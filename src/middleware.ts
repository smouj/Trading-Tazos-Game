// ============================================================
// Trading Tazos Game — Middleware
// ============================================================

import { NextRequest, NextResponse } from "next/server"

// Dashboard root → album
const ROOT_REDIRECTS: Record<string, string> = {
  "/app": "/app/album",
}

// Legacy pages → new /app/* paths
const LEGACY_PAGES: Record<string, string> = {
  "/collection": "/app/collection",
  "/decks": "/app/decks",
  "/quests": "/app/quests",
  "/shop": "/app/shop",
  "/album": "/app/album",
  "/battle": "/app/battle",
  "/scanner": "/app/album",
  "/stats": "/app/stats",
  "/profile": "/app/settings",
  "/settings": "/app/settings",
  "/inventory": "/app/collection",
}

// Auth pages that redirect to dashboard if already logged in
// Note: /register is excluded so logged-in users can create a new account if needed
const AUTH_REDIRECT_PAGES = ["/login"]

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value
  const { pathname } = req.nextUrl

  // Root redirects
  if (ROOT_REDIRECTS[pathname]) {
    return NextResponse.redirect(new URL(ROOT_REDIRECTS[pathname], req.url), 307)
  }

  // Legacy page redirects → /app/*
  if (LEGACY_PAGES[pathname]) {
    return NextResponse.redirect(new URL(LEGACY_PAGES[pathname], req.url), 308)
  }

  // /app/* — entire dashboard requires valid (non-expired) authentication
  if (pathname.startsWith("/app/")) {
    if (!token || isJwtExpired(token)) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("redirect", pathname)
      const res = NextResponse.redirect(loginUrl)
      // Clear stale cookie so client doesn't think it's authed
      res.cookies.delete("auth_token")
      res.cookies.delete("ttg_session")
      return res
    }
    return NextResponse.next()
  }

  // Redirect authenticated users away from login → dashboard
  if (AUTH_REDIRECT_PAGES.includes(pathname) && token && !isJwtExpired(token)) {
    return NextResponse.redirect(new URL("/app/album", req.url))
  }

  return NextResponse.next()
}

/** Check if JWT payload has expired (no signature verification needed — API routes handle that) */
function isJwtExpired(token: string): boolean {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString("utf8"))
    return payload.exp ? Date.now() / 1000 > payload.exp : true
  } catch {
    return true
  }
}

export const config = {
  matcher: [
    // Dashboard root redirect
    "/app",
    // Dashboard pages (protected)
    "/app/:path*",
    // Legacy redirects
    "/collection", "/collection/:path*",
    "/decks", "/decks/:path*",
    "/quests", "/quests/:path*",
    "/shop", "/shop/:path*",
    "/album",
    "/battle", "/battle/:path*",
    "/scanner", "/scanner/:path*",
    "/stats", "/stats/:path*",
    "/profile",
    "/settings", "/settings/:path*",
    "/inventory",
    // Auth pages
    "/login", "/register",
  ],
}
