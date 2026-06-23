"use client"
import Image from "next/image"

// ============================================================
// Magazine Header — shared across all pages.
// Dark var(--ttg-black) bar with TRADINGTAZOSGAME logo, "Official TTG
// Beta" subtitle, desktop nav tabs, mobile nav strip, and auth.
//
// variant="landing" (default) → full landing nav tabs
// variant="app" → logo + identity only (app has its own tab strip)
//
// Design tokens: all colors reference --ttg-* CSS custom properties
// via Tailwind bg-ttg-* / text-ttg-* utility classes.
// ============================================================

import { useEffect, useState } from "react"
import Link from "next/link"
import { Shield } from "lucide-react"

const NAV_ITEMS: [string, string][] = [
  ["home", "Home"],
  ["how-to-play", "How to Play"],
  ["collections", "Collections"],
  ["tazos", "Tazos"],
  ["leaderboard", "Rankings"],
  ["download", "Download"],
  ["faq", "FAQ"],
  ["wiki", "Wiki"],
  ["contact", "Contact"],
]

export default function MagazineHeader({
  variant = "landing",
}: {
  variant?: "landing" | "app"
}) {
  // auth removed (TTG-Engine)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const isApp = variant === "app"

  return (
    <header className="sticky top-0 z-40 bg-ttg-black border-b-[5px] border-ttg-black">
      {/* Top row: logo + brand + nav + auth */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5">
        {/* Left: Logo + Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 cursor-pointer no-underline group"
        >
          <Image
            src="/logo/logo-tg-yellow.png"
            alt="TTG"
            width={32}
            height={32}
            className="w-7 h-7 sm:w-8 sm:h-8"
            priority
           unoptimized/>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-[0.08em] leading-none">
              TRADING<span className="text-ttg-yellow">TAZOS</span>
              <span className="text-white/80">GAME</span>
            </h2>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em] leading-none mt-0.5"
               style={{ color: "var(--ttg-yellow)", opacity: 0.7 }}>
              Collect · Trade · Battle
            </p>
          </div>
        </Link>

        {/* Desktop nav — only on landing variant */}
        {!isApp && (
          <nav
            className="hidden sm:flex items-center gap-1"
            role="navigation"
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map(([page, label]) => (
              <a
                key={page}
                href={page === "home" ? "/" : `/?page=${page}`}
                className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors no-underline text-white/50 hover:text-ttg-yellow"
              >
                {label}
              </a>
            ))}
          </nav>
        )}

        {/* Right: Download CTA */}
              <a
                href="/?page=download"
                className="inline-flex items-center px-4 py-1.5 text-xs font-black uppercase tracking-wider bg-ttg-yellow text-ttg-black border-2 border-ttg-black shadow-[2px_2px_0px_var(--ttg-black)] hover:shadow-[1px_1px_0px_var(--ttg-black)] hover:translate-x-[0.5px] hover:translate-y-[0.5px] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all"
              >
                Download
              </a>
      </div>

      {/* Mobile nav — only on landing variant */}
      {!isApp && (
        <nav className="sm:hidden flex items-center justify-center gap-0 px-2 pb-2 overflow-x-auto">
          {NAV_ITEMS.map(([page, label]) => (
            <a
              key={page}
              href={page === "home" ? "/" : `/?page=${page}`}
              className="px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-colors no-underline text-white/40 hover:text-ttg-yellow"
            >
              {label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
