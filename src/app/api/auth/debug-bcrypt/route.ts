// Temporary debug route — only available in development
import { NextResponse } from "next/server"
import { hashPassword, verifyPassword } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  const pwd = "test123"
  
  // Test 1: hash + verify
  const hash = hashPassword(pwd)
  const valid = await verifyPassword(pwd, hash)

  return NextResponse.json({
    status: "ok",
    freshHashValid: valid,
  })
}
