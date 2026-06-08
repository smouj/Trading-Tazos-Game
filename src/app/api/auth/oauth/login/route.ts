// GET /api/auth/oauth/login?provider=github|google|discord
// Redirects user to the OAuth provider's authorize page.

import { NextRequest, NextResponse } from "next/server"
import { getOAuthAuthorizeUrl, OAuthProvider } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const rawProvider = req.nextUrl.searchParams.get("provider")
  const validProviders: OAuthProvider[] = ["github", "google", "discord"]
  const provider = validProviders.includes(rawProvider as any) ? (rawProvider as OAuthProvider) : null

  if (!provider) {
    return NextResponse.json({ error: `Invalid provider. Use: ${validProviders.join(", ")}` }, { status: 400 })
  }

  const origin = req.nextUrl.origin
  const redirectUri = `${origin}/api/auth/oauth/callback?provider=${provider}`
  const url = getOAuthAuthorizeUrl(provider, redirectUri)

  if (!url) {
    return NextResponse.redirect(new URL(`/login?error=${provider}_not_configured`, origin))
  }

  return NextResponse.redirect(url)
}
