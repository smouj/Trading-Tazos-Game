// ============================================================
// Trading Tazos Game — Onboarding Banner
// Guided 3-step flow for new players: Open → Build → Fight
// ============================================================
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingBag, Swords, Star, ArrowRight, CheckCircle, X, Gift } from "lucide-react"

interface Step {
  id: string; label: string; desc: string; icon: typeof Gift
  href: string; check: () => Promise<boolean>
}

export default function OnboardingBanner() {
  const [stepIndex, setStepIndex] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const [completed, setCompleted] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const done: string[] = []
      let firstPending = 0

      // Step 1 — Check unopened bags
      try {
        const r = await fetch("/api/bags")
        if (r.ok) {
          const d = await r.json()
          if ((d.bags?.length || d.total || 0) === 0) done.push("open")
          else if (firstPending === 0) firstPending = 0 // still has bags
        }
      } catch { /* ignore */ }

      // Step 2 — Check if bag count is zero (all opened) so move to deck
      if (done.includes("open")) {
        try {
          const r = await fetch("/api/tazos?limit=500")
          if (r.ok) {
            const d = await r.json()
            if ((d.tazos?.length || 0) >= 5) done.push("deck")
            else {
              firstPending = Math.max(firstPending, 1)
              // Not enough tazos yet — need more bags
              done.length = 0 // reset — still need to open bags
              firstPending = 0
            }
          }
        } catch { /* ignore */ }
      }

      // Step 3 — Check if deck exists
      if (done.includes("deck")) {
        try {
          const r = await fetch("/api/decks")
          if (r.ok) {
            const d = await r.json()
            if ((d.decks?.length || 0) > 0) done.push("battle")
            else if (firstPending <= 1) firstPending = 2
          }
        } catch { /* ignore */ }
      }

      setCompleted(done)
      setStepIndex(firstPending)
      setLoading(false)
      if (done.length >= 3) setDismissed(true)
    })()
  }, [])

  if (dismissed || loading) return null

  const STEPS = [
    { id: "open", label: "Open Bags", desc: "Open your welcome bags in the Shop!", icon: Gift, href: "/app/shop" },
    { id: "deck", label: "Build Deck", desc: "Create your first 5-tazo battle deck", icon: Star, href: "/app/decks" },
    { id: "battle", label: "First Battle", desc: "Enter the arena and win your first match!", icon: Swords, href: "/app?tab=battle" },
  ]

  const current = STEPS[stepIndex]
  if (!current) {
    setDismissed(true)
    return null
  }
  const allDone = completed.length === STEPS.length

  return (
    <div className="relative overflow-hidden border-3 border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] mb-6"
      style={{ background: "linear-gradient(135deg, #FFCC00 0%, #FFB800 100%)" }}>
      {/* Halftone overlay */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(#1a1a1a 1px, transparent 1px)", backgroundSize: "7px 7px" }} />

      <button onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-white/80 border-2 border-[#1a1a1a] hover:bg-white z-10">
        <X className="w-3.5 h-3.5 text-[#1a1a1a]" />
      </button>

      <div className="relative z-10 px-4 sm:px-6 py-4">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <Gift className="w-5 h-5 text-[#E3350D]" />
          <h2 className="text-sm font-black uppercase tracking-[0.12em] text-[#1a1a1a]">
            Welcome! Let&apos;s Get Started
          </h2>
          <span className="text-[9px] font-black text-[#1a1a1a]/40 uppercase ml-auto">
            {completed.length}/3
          </span>
        </div>

        {/* Step pills */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {STEPS.map((s, i) => {
            const done = completed.includes(s.id)
            const active = i === stepIndex
            return (
              <div key={s.id} className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-black border-2 ${
                done ? "border-[#22C55E] bg-[#22C55E10]" :
                active ? "border-[#1a1a1a] bg-white shadow-[1px_1px_0px_#1a1a1a]" :
                "border-[#1a1a1a]/15 bg-white/40 text-[#1a1a1a]/30"
              }`}>
                {done ? (
                  <CheckCircle className="w-3 h-3 text-[#22C55E]" />
                ) : (
                  <span className="w-4 h-4 flex items-center justify-center rounded-full border border-current text-[8px]">{i + 1}</span>
                )}
                <span>{s.label}</span>
              </div>
            )
          })}
        </div>

        {/* Current CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white/70 border-2 border-[#1a1a1a] p-3">
          <current.icon className="w-8 h-8 text-[#E3350D] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-black text-xs uppercase text-[#1a1a1a]">{current.label}</p>
            <p className="text-[10px] font-bold text-[#1a1a1a]/40">{current.desc}</p>
          </div>
          <Link
            href={current.href}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-[#E3350D] text-white text-[10px] font-black uppercase tracking-wider border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
          >
            {current.id === "open" ? "Open Bags" : current.id === "deck" ? "Build Deck" : "Battle!"}
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
