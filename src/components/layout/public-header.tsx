"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import LanguageSwitcher from "@/components/ui/language-switcher"

const navItems = [
  { href: "/how-to-play", key: "nav_how_to_play", fallback: "How to Play" },
  { href: "/collections", key: "nav_collections", fallback: "Collections" },
  { href: "/tazos", key: "nav_tazos", fallback: "Tazos" },
  { href: "/leaderboard", key: "nav_leaderboard", fallback: "Leaderboard" },
  { href: "/download", key: "nav_download", fallback: "Download" },
  { href: "/faq", key: "nav_faq", fallback: "FAQ" },
]

function label(t: Record<string, string>, key: string, fallback: string) {
  return t[key] || fallback
}

export default function PublicHeader() {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-[#FFCC00] border-b-4 border-[#1a1a1a] mag-stripes">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 min-w-0" onClick={() => setOpen(false)}>
            <img src="/logo/logo-icon-black.png" alt="Trading Tazos Game" className="w-12 h-12 drop-shadow-[3px_3px_0px_rgba(26,26,26,0.3)]" />
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-black leading-none uppercase text-[#1a1a1a] truncate">
                {t.siteTitle || "TRADING TAZOS GAME"}
              </p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E3350D]">
                {t.siteMastheadBadge || "Collector's Edition"}
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 ml-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-[11px] font-black uppercase tracking-wider text-[#1a1a1a] hover:bg-white border-2 border-transparent hover:border-[#1a1a1a] hover:shadow-[2px_2px_0px_#1a1a1a] transition-all"
              >
                {label(t as unknown as Record<string, string>, item.key, item.fallback)}
              </Link>
            ))}
          </nav>

          <div className="hidden sm:flex items-center gap-2 ml-auto lg:ml-3">
            <LanguageSwitcher />
            <Link href="/login" className="mag-btn bg-white text-[#1a1a1a] px-4 py-2 text-xs font-black uppercase tracking-wider">
              {t.auth_login}
            </Link>
            <Link href="/register" className="mag-btn bg-[#E3350D] text-white px-4 py-2 text-xs font-black uppercase tracking-wider">
              {t.auth_register}
            </Link>
          </div>

          <button
            type="button"
            className="sm:hidden ml-auto border-3 border-[#1a1a1a] bg-white p-2 shadow-[2px_2px_0px_#1a1a1a]"
            aria-label="Open menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <div className="sm:hidden mt-3 border-3 border-[#1a1a1a] bg-white shadow-[4px_4px_0px_#1a1a1a] p-3">
            <nav className="grid gap-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="px-3 py-2 text-sm font-black uppercase text-[#1a1a1a] hover:bg-[#FFCC00]">
                  {label(t as unknown as Record<string, string>, item.key, item.fallback)}
                </Link>
              ))}
            </nav>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Link href="/login" onClick={() => setOpen(false)} className="mag-btn bg-white text-[#1a1a1a] px-3 py-2 text-xs font-black uppercase text-center">
                {t.auth_login}
              </Link>
              <Link href="/register" onClick={() => setOpen(false)} className="mag-btn bg-[#E3350D] text-white px-3 py-2 text-xs font-black uppercase text-center">
                {t.auth_register}
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
