// ============================================================
// Trading Tazos Game — Bag Shop Page
// Buy potato chip bags with credits and open them.
// GAME-STYLE: Dark immersive UI, neon accents, game panels.
// ============================================================
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { ShoppingBag, Coins, Zap, Star, Gift, Loader2, X, Sparkles, Crosshair, Trophy, Calendar, Check, ShoppingCart } from "lucide-react"
import ConfettiBurst from "@/components/game/confetti-burst"
import BagOpener3D, { type BagData } from "@/components/game/bag-opener-3d"

interface BagConfig {
  type: string; name: string; cost: number; bonusChance: number; rareBoost: number; color: string; icon: React.ReactNode
}

const BAGS: BagConfig[] = [
  { type: "standard", name: "Bolsa Clasica", cost: 50, bonusChance: 8, rareBoost: 1, color: "#FFCC00", icon: <ShoppingBag className="w-5 h-5" /> },
  { type: "premium", name: "Bolsa Premium", cost: 150, bonusChance: 15, rareBoost: 2, color: "#E3350D", icon: <Star className="w-5 h-5" /> },
  { type: "mega", name: "Mega Bolsa", cost: 400, bonusChance: 25, rareBoost: 3, color: "#7C3AED", icon: <Zap className="w-5 h-5" /> },
]

const RARITY_COLORS: Record<string, string> = { common: "#9CA3AF", uncommon: "#22C55E", rare: "#3B82F6", "ultra-rare": "#A855F7", legendary: "#F59E0B" }
const RARITY_LABELS: Record<string, string> = { common: "Comun", uncommon: "Poco Comun", rare: "Raro", "ultra-rare": "Ultra Raro", legendary: "Legendario" }

function BagPreview3D({ bag, open = false, progress = 0 }: { bag: BagConfig; open?: boolean; progress?: number }) {
  return (
    <div className="relative h-48 flex items-center justify-center overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)" }}>
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: `radial-gradient(circle at center, ${bag.color}10, transparent 60%)` }} />
      <div className="relative w-32 h-44 flex flex-col items-center justify-between p-3 transition-all duration-500"
        style={{ background: "linear-gradient(145deg, rgba(26,26,26,0.9), rgba(15,15,26,0.95))", border: `2px solid ${bag.color}40`, borderRadius: "12px", boxShadow: `0 0 20px ${bag.color}20, 0 8px 32px rgba(0,0,0,0.5)`, transform: open ? `rotate(${(progress-0.5)*6}deg) scale(0.95)` : "rotate(-2deg)" }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-white/[0.06]" style={{ background: `radial-gradient(circle, ${bag.color}20, transparent 70%)` }}><ShoppingBag className="w-8 h-8" style={{ color: bag.color }} /></div>
        <div className="text-center space-y-0.5"><p className="text-lg font-bold text-white/90 tracking-wider" style={{ textShadow: `0 0 8px ${bag.color}40` }}>TAZOS</p><p className="text-[9px] font-semibold text-white/25 uppercase tracking-[0.2em]">{bag.type}</p></div>
        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-white/[0.06]" style={{ background: `${bag.color}15` }}><Coins className="w-3 h-3" style={{ color: bag.color }} /><span className="text-xs font-bold" style={{ color: bag.color }}>{bag.cost}</span></div>
        {open && <div className="absolute inset-x-4 top-8 h-0.5 bg-gradient-to-r from-white/0 via-white/40 to-white/0" style={{ transform: `scaleX(${Math.max(0.05, progress)})`, transformOrigin: "left" }} />}
      </div>
    </div>
  )
}

export default function BagShopPage() {
  const { t } = useI18n()
  const { user, token } = useAuth()
  const [credits, setCredits] = useState(0)
  const [selectedBag, setSelectedBag] = useState<BagConfig>(BAGS[0])
  const [buying, setBuying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bagId, setBagId] = useState<string | null>(null)
  const [stage, setStage] = useState<"select" | "buying" | "opening" | "reveal">("select")
  const [tearProgress, setTearProgress] = useState(0)
  const [revealedTazo, setRevealedTazo] = useState<any>(null)
  const [bonusTazo, setBonusTazo] = useState<any>(null)
  const [openingAnim, setOpeningAnim] = useState(false)
  const [pendingBags, setPendingBags] = useState<number>(0)
  const tearIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const bagIdRef = useRef<string | null>(null)

  useEffect(() => { bagIdRef.current = bagId }, [bagId])
  useEffect(() => { if (!token) return; fetch("/api/bags", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setPendingBags(d.total ?? 0)).catch(() => {}) }, [token, stage])
  useEffect(() => { if (!token) return; fetch("/api/credits", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setCredits(d.credits ?? 0)).catch(() => {}) }, [token])

  const handleBuy = useCallback(async () => {
    if (!token) return; setBuying(true); setError(null)
    try {
      const res = await fetch("/api/bags/buy", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ bagType: selectedBag.type }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Purchase failed"); setBuying(false); return }
      setCredits(data.creditsRemaining); setBagId(data.bagId); setBuying(false); setStage("opening"); setTearProgress(0); startTearAnimation()
    } catch { setError("Connection error"); setBuying(false) }
  }, [token, selectedBag])

  const startTearAnimation = () => {
    if (tearIntervalRef.current) clearInterval(tearIntervalRef.current)
    setOpeningAnim(true)
    let step = 0; const steps = 40
    tearIntervalRef.current = setInterval(() => {
      step++; const progress = Math.min(1, step / steps); const eased = progress < 0.5 ? 2*progress*progress : 1-Math.pow(-2*progress+2,2)/2
      setTearProgress(eased)
      if (step >= steps) { if (tearIntervalRef.current) clearInterval(tearIntervalRef.current); tearIntervalRef.current = null; openBag() }
    }, 50)
  }

  const openBag = async () => {
    const currentBagId = bagIdRef.current
    if (!token || !currentBagId) { setStage("select"); setOpeningAnim(false); setError("Something went wrong"); return }
    try {
      const res = await fetch("/api/bags/open", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ bagId: currentBagId }) })
      const data = await res.json()
      if (res.ok) { setTimeout(() => { setRevealedTazo(data.tazo); setBonusTazo(data.bonusTazo); setStage("reveal"); setOpeningAnim(false) }, 500) }
      else { setError(data.error || "Failed to open bag"); setStage("select"); setOpeningAnim(false) }
    } catch { setError("Connection error"); setStage("select"); setOpeningAnim(false) }
  }

  const handleReset = () => { if (tearIntervalRef.current) clearInterval(tearIntervalRef.current); tearIntervalRef.current = null; setStage("select"); setBagId(null); bagIdRef.current = null; setRevealedTazo(null); setBonusTazo(null); setTearProgress(0); setOpeningAnim(false); setError(null) }

  // ── Guest ──
  if (!user) return (
    <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
      <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center border border-white/[0.06]" style={{ background: "radial-gradient(circle, #FFCC0010, transparent 70%)" }}><ShoppingBag className="w-10 h-10 text-white/15" /></div>
      <h1 className="text-2xl font-bold text-white/80 tracking-wide">TAZO SHOP</h1>
      <p className="text-sm text-white/25">Sign in to buy and open bags</p>
      <Link href="/login" className="game-btn inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold uppercase tracking-wider rounded-lg bg-[#FFCC00] text-black hover:bg-[#FFD633] hover:shadow-[0_0_20px_rgba(255,204,0,0.3)] transition-all">{t.auth_login || "Sign In"}</Link>
    </div>
  )

  // ── Select ──
  if (stage === "select") return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">
      <div className="game-banner flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-[#FFCC00]/20" style={{ background: "linear-gradient(135deg, #FFCC0010, #FFCC0005)" }}><ShoppingCart className="w-5 h-5 text-[#FFCC00]" /></div>
        <div><h1 className="text-lg font-bold text-white/90 tracking-wide">TAZO SHOP</h1><div className="flex items-center gap-2 mt-0.5"><Coins className="w-3.5 h-3.5 text-[#FFCC00]" /><span className="text-sm font-bold text-[#FFCC00]">{credits}</span><span className="text-[10px] text-white/25 uppercase">Credits</span></div></div>
      </div>

      {pendingBags > 0 && (
        <div className="game-panel text-center space-y-3 p-5" style={{ borderColor: "#22C55E30", background: "linear-gradient(135deg, #22C55E08, #22C55E02)" }}>
          <div className="flex items-center justify-center gap-2"><Gift className="w-6 h-6 text-[#22C55E]" /><span className="text-lg font-bold text-white/80">{pendingBags} Bags to Open!</span></div>
          <p className="text-xs text-white/25">Potato chip bags with tazos inside — open them to grow your collection!</p>
          <button onClick={async () => { if (!token) return; setError(null); setBuying(true); try { const res = await fetch("/api/bags", { headers: { Authorization: `Bearer ${token}` } }); const data = await res.json(); if (data.bags?.length > 0) { const fb = data.bags[0]; setBagId(fb.id); setSelectedBag({ type: fb.bagType || "standard", name: "Mystery Bag", cost: 0, bonusChance: 10, rareBoost: 1, color: fb.preview?.franchiseColor || "#FFCC00", icon: <Gift className="w-5 h-5" /> }); setBuying(false); setStage("opening"); setTearProgress(0); startTearAnimation() } } catch { setError("Failed"); setBuying(false) } }} disabled={buying} className="game-btn px-8 py-3 text-sm font-semibold uppercase tracking-wider rounded-lg bg-[#22C55E] text-black hover:bg-[#2DD76A] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all disabled:opacity-30">{buying ? <Loader2 className="w-5 h-5 animate-spin inline" /> : "Open Next Bag"}</button>
        </div>
      )}

      {error && <div className="game-panel p-3 text-center" style={{ borderColor: "#EF444430", background: "rgba(239,68,68,0.05)" }}><p className="text-xs font-medium text-red-400">{error}</p><button onClick={() => setError(null)} className="mt-1 text-[10px] text-white/25 hover:text-white/50"><X className="w-3 h-3 inline" /> Dismiss</button></div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {BAGS.map(bag => {
          const isSelected = selectedBag.type === bag.type
          return (
            <button key={bag.type} onClick={() => setSelectedBag(bag)} className={`game-panel text-left p-0 overflow-hidden transition-all duration-200 ${isSelected ? "border-[#FFCC00] shadow-[0_0_15px_rgba(255,204,0,0.2)]" : "border-white/[0.04] hover:border-white/[0.08]"}`}>
              <BagPreview3D bag={bag} open={isSelected} progress={isSelected ? 0.15 : 0} />
              <div className="p-4 space-y-2 border-t border-white/[0.04]">
                <div className="flex items-center gap-2">{bag.icon}<h3 className="font-bold text-sm text-white/80 uppercase tracking-wide">{bag.name}</h3></div>
                <div className="space-y-1 text-[10px] text-white/25 font-medium"><p className="flex items-center gap-1.5"><Crosshair className="w-3 h-3 text-white/15" /> {bag.rareBoost}x rare boost</p><p className="flex items-center gap-1.5"><Gift className="w-3 h-3 text-white/15" /> {bag.bonusChance}% bonus tazo</p><p className="flex items-center gap-1.5 mt-2 text-sm font-bold text-[#FFCC00]"><Coins className="w-3.5 h-3.5" /> {bag.cost}</p></div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="text-center">
        <button onClick={handleBuy} disabled={buying || credits < selectedBag.cost} className="game-btn px-10 py-4 text-base font-bold uppercase tracking-wider rounded-lg bg-[#FFCC00] text-black hover:bg-[#FFD633] hover:shadow-[0_0_30px_rgba(255,204,0,0.4)] transition-all disabled:opacity-20 disabled:cursor-not-allowed">
          {buying ? <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Buying...</span> : <span className="flex items-center gap-2"><ShoppingBag className="w-5 h-5" /> Buy {selectedBag.name} — {selectedBag.cost} <Coins className="w-4 h-4 inline" /></span>}
        </button>
        {credits < selectedBag.cost && <p className="mt-2 text-xs font-medium text-red-400/80">Need {selectedBag.cost - credits} more credits</p>}
      </div>

      <div className="game-panel p-4">
        <h3 className="font-semibold text-xs text-white/60 uppercase tracking-[0.15em] mb-3 flex items-center gap-2"><Gift className="w-4 h-4 text-[#F59E0B]" /> How to earn</h3>
        <div className="grid grid-cols-2 gap-2 text-xs text-white/25 font-medium">
          <p className="flex items-center gap-1.5"><Trophy className="w-3 h-3 text-[#F59E0B]/60" /> Win battles: +30</p>
          <p className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-[#3B4CCA]/60" /> Daily login: +25</p>
          <p className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#22C55E]/60" /> Quests: +50-200</p>
          <p className="flex items-center gap-1.5"><Crosshair className="w-3 h-3 text-[#E3350D]/60" /> Perfect throws: +10</p>
        </div>
      </div>
    </div>
  )

  // ── Opening ──
  if (stage === "opening") return (
    <div className="max-w-2xl mx-auto py-8 px-4 text-center space-y-4">
      <h2 className="text-xl font-bold text-white/80 tracking-wide">Opening {selectedBag.name}...</h2>
      <p className="text-xs text-white/25">{tearProgress < 0.3 ? "Rip the bag open to reveal your tazo..." : tearProgress < 0.7 ? "Almost there..." : "Something shiny inside!"}</p>
      <div className="game-panel overflow-hidden">
        <BagOpener3D bag={{ id: bagId || "", bagType: selectedBag.type, preview: { franchise: { slug: selectedBag.type === "premium" ? "dracobell" : selectedBag.type === "mega" ? "cybermon" : "minimon" }, rarity: "common" } }} opening={openingAnim} progress={tearProgress} onOpen={() => { if (!tearIntervalRef.current) startTearAnimation() }} onSkip={() => { if (tearIntervalRef.current) clearInterval(tearIntervalRef.current); tearIntervalRef.current = null; setTearProgress(1); setTimeout(() => openBag(), 150) }} />
      </div>
      <p className="text-xs text-white/15">{tearProgress < 0.05 ? 'Click "Open Bag!" to start' : tearProgress < 1 ? "Tearing open..." : "Revealing tazo..."}</p>
    </div>
  )

  // ── Reveal ──
  if (stage === "reveal" && revealedTazo) {
    const rc = RARITY_COLORS[revealedTazo.rarity] || "#9CA3AF"
    return (
      <div className="max-w-lg mx-auto py-8 px-4 space-y-6 text-center">
        <div className="flex items-center justify-center gap-2"><Sparkles className="w-5 h-5 text-[#F59E0B]" /><h2 className="text-xl font-bold text-white/80 tracking-wide">Tazo Revealed!</h2><Sparkles className="w-5 h-5 text-[#F59E0B]" /></div>
        <ConfettiBurst active />
        <div className="flex items-center justify-center py-6">
          <div className="w-48 h-48 rounded-full flex items-center justify-center overflow-hidden" style={{ background: "linear-gradient(135deg, #1a1a2e, #0f0f1a)", border: `3px solid ${rc}30`, boxShadow: `0 0 40px ${rc}20, 0 0 80px ${rc}08` }}>
            {revealedTazo.imageUrl ? <img src={revealedTazo.imageUrl} alt={revealedTazo.displayName || revealedTazo.name} className="w-[90%] h-[90%] object-contain rounded-full" /> : <img src={`/tazos-artgen/backs/${revealedTazo.franchise?.slug || "minimon"}-back.png`} alt="Series back" className="w-[90%] h-[90%] object-contain rounded-full" />}
          </div>
        </div>
        <div className="game-panel text-left space-y-3">
          <div className="flex items-center justify-between"><h3 className="text-lg font-bold text-white/80 tracking-wide">{revealedTazo.displayName || revealedTazo.name}</h3><span className="px-3 py-1 text-[10px] font-semibold uppercase rounded-full border" style={{ borderColor: rc, color: rc, background: `${rc}10` }}>{RARITY_LABELS[revealedTazo.rarity] || revealedTazo.rarity}</span></div>
          <p className="text-xs text-white/25">{revealedTazo.franchise?.name || revealedTazo.franchise?.slug}</p>
          <div className="grid grid-cols-3 gap-1.5">
            {["attack","defense","resistance","weight","stability","spin","control","bounce","precision"].map(s => <div key={s} className="text-center p-1.5 rounded-lg border border-white/[0.04]" style={{ background: "rgba(255,255,255,0.02)" }}><div className="text-[8px] text-white/15 uppercase">{s.substring(0,3)}</div><div className="text-xs font-bold text-white/60">{revealedTazo[s]}</div></div>)}
          </div>
        </div>
        {bonusTazo && (
          <div className="game-panel text-center" style={{ borderColor: "#F59E0B30", background: "rgba(245,158,11,0.05)" }}>
            <p className="text-xs font-semibold text-[#F59E0B] uppercase tracking-wider flex items-center justify-center gap-1"><Gift className="w-4 h-4" /> Bonus Tazo!</p>
            <p className="text-sm font-bold text-white/70 mt-1">{bonusTazo.displayName || bonusTazo.name}</p>
            <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-semibold uppercase rounded-full border" style={{ borderColor: RARITY_COLORS[bonusTazo.rarity] || "#9CA3AF", color: RARITY_COLORS[bonusTazo.rarity] || "#9CA3AF", background: `${RARITY_COLORS[bonusTazo.rarity] || "#9CA3AF"}10` }}>{RARITY_LABELS[bonusTazo.rarity] || bonusTazo.rarity}</span>
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <button onClick={handleReset} className="game-btn px-6 py-3 text-sm font-semibold uppercase tracking-wider rounded-lg bg-[#FFCC00] text-black hover:bg-[#FFD633] hover:shadow-[0_0_20px_rgba(255,204,0,0.3)] transition-all"><ShoppingBag className="w-4 h-4 inline mr-1.5" /> Buy Another</button>
          <Link href="/app/collection" className="game-btn-secondary px-6 py-3 text-sm font-semibold uppercase tracking-wider rounded-lg inline-flex items-center">View Collection</Link>
        </div>
      </div>
    )
  }

  return null
}
