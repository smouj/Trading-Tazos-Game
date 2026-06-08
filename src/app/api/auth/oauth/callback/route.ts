// GET /api/auth/oauth/callback?provider=github|google|discord&code=xxx&state=xxx
// Handles OAuth callback: exchanges code for profile, creates user, sets JWT cookie, redirects.

import { NextRequest, NextResponse } from "next/server"
import { exchangeOAuthCode, findOrCreateOAuthUser, generateToken, authCookie, OAuthProvider } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const rawProvider = sp.get("provider")
  const code = sp.get("code")
  const state = sp.get("state")
  const error = sp.get("error")
  const origin = req.nextUrl.origin

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=oauth_${error}`, origin))
  }

  const validProviders: OAuthProvider[] = ["github", "google", "discord"]
  const provider = validProviders.includes(rawProvider as any) ? (rawProvider as OAuthProvider) : null

  if (!provider || !code || !state) {
    return NextResponse.redirect(new URL(`/login?error=invalid_oauth_request`, origin))
  }

  const redirectUri = `${origin}/api/auth/oauth/callback?provider=${provider}`

  const result = await exchangeOAuthCode(provider, code, state, redirectUri)
  if ("error" in result) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(result.error)}`, origin))
  }

  const user = await findOrCreateOAuthUser(result.profile)
  const token = generateToken(user)

  const res = NextResponse.redirect(new URL(result.redirectTo || "/app/collection", origin))
  res.headers.set("Set-Cookie", authCookie(token))
  return res
}

export const dynamic = "force-dynamic"
