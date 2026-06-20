import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events.
 */
export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature")
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET not configured")
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
  }

  let event: any
  try {
    const body = await req.text()
    const Stripe = await import("stripe")
    const stripe = new Stripe.default(process.env.STRIPE_SECRET_KEY!)
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error(`[stripe-webhook] Signature verification failed:`, err.message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        const userId = session.client_reference_id || session.metadata?.userId
        const credits = parseInt(session.metadata?.credits || "0", 10)
        const packageId = session.metadata?.packageId || "unknown"

        if (!userId || !credits) {
          console.error("[stripe-webhook] Missing userId or credits in session metadata")
          return NextResponse.json({ error: "Invalid metadata" }, { status: 400 })
        }

        const existing = await prisma.purchase.findFirst({
          where: { stripeSessionId: session.id },
        })
        if (existing) {
          console.log(`[stripe-webhook] Session ${session.id} already processed`)
          return NextResponse.json({ received: true, alreadyProcessed: true })
        }

        await prisma.$transaction([
          prisma.user.update({
            where: { id: userId },
            data: { credits: { increment: credits } },
          }),
          prisma.purchase.create({
            data: {
              userId,
              packageId: `credit-${packageId}`,
              amount: credits,
              priceCents: session.amount_total || 0,
              currency: (session.currency || "eur").toUpperCase(),
              stripeSessionId: session.id,
              stripePaymentId: session.payment_intent,
              status: "completed",
            },
          }),
          prisma.creditTransaction.create({
            data: {
              userId,
              amount: credits,
              source: "purchase",
              reference: session.id,
            },
          }),
        ])

        console.log(`[stripe-webhook] ✅ +${credits} credits to user ${userId}`)
        break
      }

      case "checkout.session.expired": {
        const session = event.data.object
        const userId = session.client_reference_id || session.metadata?.userId
        if (userId) {
          await prisma.purchase.updateMany({
            where: { stripeSessionId: session.id },
            data: { status: "failed" },
          })
        }
        break
      }

      case "charge.refunded": {
        const charge = event.data.object
        if (charge.payment_intent) {
          const purchase = await prisma.purchase.findFirst({
            where: { stripePaymentId: charge.payment_intent as string },
          })
          if (purchase && purchase.status !== "refunded") {
            await prisma.$transaction([
              prisma.user.update({
                where: { id: purchase.userId },
                data: { credits: { decrement: purchase.amount } },
              }),
              prisma.purchase.update({
                where: { id: purchase.id },
                data: { status: "refunded", refundedAt: new Date() },
              }),
              prisma.creditTransaction.create({
                data: {
                  userId: purchase.userId,
                  amount: -purchase.amount,
                  source: "refund",
                  reference: charge.id as string,
                },
              }),
            ])
            console.log(`[stripe-webhook] 🔙 Refunded ${purchase.amount} credits`)
          }
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error(`[stripe-webhook] Error processing ${event.type}:`, error)
    return NextResponse.json({ received: true, error: error.message })
  }
}
