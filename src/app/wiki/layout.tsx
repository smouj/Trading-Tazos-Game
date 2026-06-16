// ============================================================
// TTG Wiki — Magazine Layout
// Wraps all /wiki/* routes in the full magazine shell
// (header, wiki nav, footer, halftone) matching the launcher.
// ============================================================
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import MagazineHeader from "@/components/game/magazine-header"
import MagazineFooter from "@/components/game/magazine-footer"
import { WIKI_SERIES_CONFIG } from "@/lib/wiki-types"
import type { TTGWikiSeries } from "@/lib/wiki-types"

const SERIES_SLUG_TO_KEY: Record<string, TTGWikiSeries> = {
  minimon: "minimon",
  cybermon: "cybermon",
  "draco-bell": "draco_bell",
}

const WIKI_NAV_ITEMS = [
  { id: "wiki", label: "Wiki", href: "/wiki", color: "#1a1a1a" },
  ...Object.entries(WIKI_SERIES_CONFIG).map(([key, cfg]) => ({
    id: key,
    label: cfg.label,
    href: `/wiki/${cfg.slug}`,
    color: cfg.color,
  })),
]

export default function WikiMagazineLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Determine active series from pathname
  const activeSeries = pathname.startsWith("/wiki/minimon")
    ? "minimon"
    : pathname.startsWith("/wiki/cybermon")
    ? "cybermon"
    : pathname.startsWith("/wiki/draco-bell")
    ? "draco_bell"
    : null

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ background: "#FFF9E6" }}
    >
      {/* ── Halftone overlay ── */}
      <div className="mag-halftone absolute inset-0 opacity-40 pointer-events-none" />

      {/* ── Magazine Masthead ── */}
      <MagazineHeader variant="app" />

      {/* ── Wiki Navigation Strip ── */}
      <nav
        className="relative z-10 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2.5 overflow-x-auto
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
          border-b-[3px] border-[#1a1a1a] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] bg-white"
        role="navigation"
        aria-label="Wiki navigation"
      >
        {WIKI_NAV_ITEMS.map(({ id, label, href, color }) => {
          const isActive =
            id === "wiki"
              ? pathname === "/wiki"
              : activeSeries === id
          return (
            <Link
              key={id}
              href={href}
              className={`flex items-center gap-1 sm:gap-1.5 px-3 sm:px-3.5 py-2 text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap border-2 ${
                isActive
                  ? "bg-[#FFCC00] text-[#1a1a1a] border-[#1a1a1a]"
                  : "text-[#1a1a1a]/40 hover:text-[#1a1a1a]/70 border-transparent hover:border-[#1a1a1a]/15 hover:bg-[#1a1a1a]/3"
              }`}
              style={
                isActive
                  ? { boxShadow: "3px 3px 0 #1a1a1a" }
                  : isActive
                  ? {}
                  : {}
              }
            >
              {/* Series color dot for series nav items */}
              {id !== "wiki" && (
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
              )}
              {label}
            </Link>
          )
        })}
        {/* Back to TTG link */}
        <span className="text-[#1a1a1a]/15 font-black mx-1">|</span>
        <Link
          href="/"
          className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#1a1a1a]/30 hover:text-[#1a1a1a]/60 transition-colors whitespace-nowrap"
        >
          ← TTG
        </Link>
      </nav>

      {/* ── Page Content ── */}
      <main
        className="relative z-10 flex-1 w-full"
        id="main-content"
        role="main"
        aria-label="Wiki content"
      >
        {children}
      </main>

      {/* ── Magazine Footer ── */}
      <div className="relative z-10 h-2 mag-stripes opacity-30 pointer-events-none" />
      <MagazineFooter />
    </div>
  )
}
