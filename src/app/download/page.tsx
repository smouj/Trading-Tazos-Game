"use client"

import { Download, Monitor, Apple, Terminal, Github, ExternalLink, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useI18n } from "@/lib/i18n"

const OS_CARDS = [
  {
    id: "windows",
    icon: Monitor,
    color: "#00A4EF",
    labelKey: "download_windows" as const,
    exe: ".exe",
    comingSoon: true,
  },
  {
    id: "mac",
    icon: Apple,
    color: "#1a1a1a",
    labelKey: "download_mac" as const,
    exe: ".dmg",
    comingSoon: true,
  },
  {
    id: "linux",
    icon: Terminal,
    color: "#FCC624",
    labelKey: "download_linux" as const,
    exe: ".AppImage",
    comingSoon: true,
  },
]

const GITHUB_URL = "https://github.com/smouj/Trading-Tazos-Game"
const RELEASES_URL = `${GITHUB_URL}/releases`
const VERSION = "v0.3.0"

export default function DownloadPage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen flex flex-col mag-bg">
      {/* Magazine masthead */}
      <header className="bg-[#E3350D] border-b-4 border-[#1a1a1a] mag-stripes">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="text-white hover:opacity-70 transition-opacity">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mag-stroke-sm">
              {t.download_title}
            </h1>
            <p className="text-[10px] sm:text-xs font-bold text-white/70 uppercase tracking-wider mt-0.5">
              {t.download_subtitle} — {VERSION}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
        {/* Intro */}
        <div className="text-center space-y-2 py-4">
          <Download className="w-12 h-12 mx-auto text-[#E3350D] drop-shadow-[2px_2px_0px_#1a1a1a]" />
          <p className="text-sm font-bold text-[#1a1a1a]/60 max-w-lg mx-auto leading-relaxed">
            {t.download_intro}
          </p>
        </div>

        {/* OS Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {OS_CARDS.map((os) => {
            const Icon = os.icon
            return (
              <div
                key={os.id}
                className="relative mag-card p-6 text-center transition-all hover:-translate-y-1"
                style={{ background: "white" }}
              >
                {/* Coming Soon badge */}
                {os.comingSoon && (
                  <div className="absolute -top-2 -right-2 star-burst px-2 py-0.5 border-2 border-[#1a1a1a] bg-[#FFCC00]">
                    <span className="text-[9px] font-black text-[#1a1a1a] uppercase tracking-wider">
                      {t.download_coming_soon}
                    </span>
                  </div>
                )}

                <div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center border-3 border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a]"
                  style={{ background: os.color }}
                >
                  <Icon className="w-8 h-8 text-white drop-shadow-[1px_1px_0px_#1a1a1a80]" />
                </div>

                <h3 className="font-black text-sm uppercase tracking-wider text-[#1a1a1a] mb-1">
                  {t[os.labelKey]}
                </h3>

                {os.comingSoon ? (
                  <p className="text-xs text-[#1a1a1a]/40 font-bold italic">
                    {t.download_coming_soon}
                  </p>
                ) : (
                  <>
                    <p className="text-[10px] text-[#1a1a1a]/50 font-medium mb-3">
                      {t.download_version} {VERSION} · {os.exe}
                    </p>
                    <a
                      href={`${RELEASES_URL}/latest`}
                      className="inline-flex items-center gap-1.5 mag-btn bg-[#E3350D] text-white text-xs font-black uppercase px-4 py-2 tracking-wider"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {t.download_cta} {t[os.labelKey]}
                    </a>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Requirements */}
        <div className="mag-card p-6" style={{ background: "white" }}>
          <h3 className="font-black text-sm uppercase tracking-wider text-[#1a1a1a] mb-3 flex items-center gap-2">
            <Monitor className="w-4 h-4 text-[#E3350D]" />
            {t.download_requirements}
          </h3>
          <p className="text-sm font-medium text-[#1a1a1a]/60 leading-relaxed">
            {t.download_requirements_list}
          </p>
        </div>

        {/* Source Code */}
        <div className="mag-card p-6 text-center" style={{ background: "white" }}>
          <Github className="w-8 h-8 mx-auto mb-2 text-[#1a1a1a]" />
          <h3 className="font-black text-sm uppercase tracking-wider text-[#1a1a1a] mb-1">
            {t.download_source}
          </h3>
          <p className="text-xs text-[#1a1a1a]/50 font-medium mb-3">
            {t.download_source_desc}
          </p>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mag-btn bg-[#1a1a1a] text-[#FFCC00] text-xs font-black uppercase px-5 py-2.5 tracking-wider"
          >
            <Github className="w-3.5 h-3.5" />
            GitHub
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Web CTA */}
        <div className="text-center pb-8">
          <p className="text-xs text-[#1a1a1a]/50 font-medium">
            {t.download_also_web}{" "}
            <Link href="/" className="font-black text-[#E3350D] hover:underline uppercase tracking-wider">
              medaclawarena.com
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t-4 border-[#1a1a1a] bg-[#FFCC00]/10 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[10px] font-bold text-[#1a1a1a]/40 uppercase tracking-wider">
            {t.siteFooterTribute}
          </p>
        </div>
      </footer>
    </div>
  )
}
