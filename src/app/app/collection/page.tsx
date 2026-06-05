"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n"
import { Package, Swords, Star, TrendingUp, Clock, BookOpen, Sparkles, Zap, ShoppingBag, ChevronRight } from "lucide-react"

interface DeckTazo { id: string; name: string; displayName: string; number: string; imageUrl: string; rarity: string; franchiseSlug: string; attack: number; defense: number; resistance: number; role?: string | null }
interface Deck { id: string; name: string; isActive: boolean; tazos: DeckTazo[] }
interface CollectionTazo { id: string; tazoId: string; quantity: number; acquiredAt: string; obtainedFrom?: string | null; isFavorite: boolean; inDeckId?: string | null; deckName?: string | null; tazo: DeckTazo & { precision: number; bounce: number; control: number; spin: number; stability: number; weight: number; franchise: string } }
interface CollectionData { items: CollectionTazo[]; total: number; totalUnique: number; decks: Deck[]; franchiseSummary: Record<string, number> }

const FRANCHISE_COLORS: Record<string, string> = { minimon: "#FFCB05", cybermon: "#00A1E9", dracobell: "#FF6B00" }
const RARITY_COLORS: Record<string, string> = { common: "#9CA3AF", uncommon: "#22C55E", rare: "#3B82F6", ultra: "#A855F7", legendary: "#F59E0B" }
const RARITY_STARS: Record<string, string> = { common: "★", uncommon: "★★", rare: "★★★", ultra: "★★★★", legendary: "★★★★★" }

function totalPower(t: CollectionTazo["tazo"]): number {
  return t.attack + t.defense + t.resistance + t.weight + t.stability + t.spin + t.control + t.bounce + t.precision
}
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"; if (mins < 60) return `${mins}m`; if (mins < 1440) return `${Math.floor(mins/60)}h`; return `${Math.floor(mins/1440)}d`
}

export default function CollectionPage() {
  const { t } = useI18n()
  const { user, token, loading } = useAuth()
  const [data, setData] = useState<CollectionData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "deck" | "duplicates" | "recent">("all")

  useEffect(() => {
    let cancelled = false
    if (!token) return
    fetch("/api/collection?limit=500&includeDecks=true", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(d => { if (!cancelled) setData(d) }).catch(err => { if (!cancelled) setError(err.message) })
    return () => { cancelled = true }
  }, [token])

  const { strongest, rarest, recentTazos, deckTazos, duplicateTazos } = useMemo(() => {
    if (!data?.items.length) return { strongest: null, rarest: null, recentTazos: [] as CollectionTazo[], deckTazos: [] as CollectionTazo[], duplicateTazos: [] as CollectionTazo[] }
    const sorted = [...data.items].sort((a, b) => totalPower(b.tazo) - totalPower(a.tazo))
    const byRarity = [...data.items].sort((a, b) => (["legendary","ultra","rare","uncommon","common"].indexOf(b.tazo.rarity)) - (["legendary","ultra","rare","uncommon","common"].indexOf(a.tazo.rarity)))
    return {
      strongest: sorted[0] || null, rarest: byRarity[0] || null,
      recentTazos: [...data.items].sort((a, b) => new Date(b.acquiredAt).getTime() - new Date(a.acquiredAt).getTime()).slice(0, 8),
      deckTazos: data.items.filter(i => i.inDeckId), duplicateTazos: data.items.filter(i => i.quantity > 1),
    }
  }, [data])

  const filteredItems = useMemo(() => {
    if (!data) return []
    if (filter === "deck") return deckTazos
    if (filter === "duplicates") return duplicateTazos
    if (filter === "recent") return recentTazos
    return data.items
  }, [data, filter, deckTazos, duplicateTazos, recentTazos])

  if (loading || (token && !data && !error)) return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 rounded-full border-2 border-[#FFCC00]/20 border-t-[#FFCC00] animate-spin" /></div>

  if (!user) return (
    <div className="py-20 text-center space-y-5">
      <Package className="w-14 h-14 text-white/[0.05] mx-auto" />
      <p className="font-semibold text-sm text-white/20 uppercase tracking-wider">{t.auth_login_subtitle || "Sign in to see your collection"}</p>
      <Link href="/login" className="game-btn inline-flex px-8 py-3 text-sm font-semibold uppercase tracking-widest rounded-lg bg-[#FFCC00] text-black hover:bg-[#FFD633] hover:shadow-[0_0_20px_rgba(255,204,0,0.3)] transition-all">{t.auth_login || "Sign In"}</Link>
    </div>
  )

  if (data && data.items.length === 0) return (
    <div className="max-w-3xl mx-auto py-20 px-4 text-center space-y-6">
      <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center border border-[#FFCC00]/10" style={{ background: "radial-gradient(circle, #FFCC0008, transparent 70%)" }}>
        <Package className="w-12 h-12 text-[#FFCC00]/15" />
      </div>
      <h2 className="text-2xl font-bold text-white/40 tracking-wide">YOUR COLLECTION IS EMPTY</h2>
      <p className="text-sm text-white/15 max-w-md mx-auto">Open bags to discover new tazos and start building your collection.</p>
      <Link href="/shop" className="game-btn inline-flex items-center gap-2 px-10 py-4 text-base font-semibold uppercase tracking-wider rounded-lg bg-[#FFCC00] text-black hover:bg-[#FFD633] hover:shadow-[0_0_20px_rgba(255,204,0,0.4)] transition-all"><ShoppingBag className="w-5 h-5" /> Open Bags</Link>
    </div>
  )

  if (!data) return null

  const activeDeck = data.decks?.find(d => d.isActive)

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 space-y-5">

      {/* ═══ HEADER BANNER ═══ */}
      <div className="game-banner px-4 py-3 flex flex-wrap items-center gap-3">
        <Package className="w-5 h-5 text-[#FFCC00]" />
        <span className="text-lg font-bold text-white/80 uppercase tracking-wide">MY COLLECTION</span>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs font-semibold text-[#FFCC00] bg-[#FFCC00]/10 px-2 py-0.5 rounded-full border border-[#FFCC00]/20">{data.totalUnique} unique</span>
          <span className="text-xs text-white/25">{data.total} total</span>
        </div>
      </div>

      {/* ═══ STATS ROW ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Swords, label: "Active Deck", value: activeDeck ? `${activeDeck.tazos.length}/3` : "0/3", color: "#E3350D", sub: activeDeck?.name },
          { icon: TrendingUp, label: "Strongest", value: strongest ? `${totalPower(strongest.tazo)} TP` : "—", color: "#FFCC00", sub: strongest?.tazo.displayName || strongest?.tazo.name },
          { icon: Star, label: "Rarest", value: rarest ? RARITY_STARS[rarest.tazo.rarity] || "" : "—", color: RARITY_COLORS[rarest?.tazo.rarity] || "#F59E0B", sub: rarest?.tazo.displayName || rarest?.tazo.name },
          { icon: Zap, label: "Duplicates", value: String(duplicateTazos.length), color: "#00A1E9", sub: `${duplicateTazos.reduce((s, i) => s + i.quantity - 1, 0)} extra` },
        ].map(({ icon: Icon, label, value, color, sub }) => (
          <div key={label} className="game-panel p-3">
            <div className="flex items-center gap-1.5 mb-1"><Icon className="w-3.5 h-3.5" style={{ color }} /><span className="text-[9px] font-semibold text-white/25 uppercase tracking-wider">{label}</span></div>
            <div className="text-lg font-bold" style={{ color }}>{value}</div>
            {sub && <p className="text-[10px] text-white/15 truncate mt-0.5">{sub}</p>}
          </div>
        ))}
      </div>

      {/* ═══ ACTIVE DECK PREVIEW ═══ */}
      {activeDeck && activeDeck.tazos.length > 0 && (
        <div className="game-panel p-4 space-y-3" style={{ borderColor: "#FFCC0020", background: "linear-gradient(90deg, rgba(255,204,0,0.03), transparent)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Swords className="w-4 h-4 text-[#E3350D]" /><span className="text-sm font-semibold text-white/70 uppercase tracking-wide">Battle Deck: {activeDeck.name}</span></div>
            <Link href="/app?tab=battle" className="game-btn px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-lg bg-[#E3350D] text-white hover:bg-[#FF2D1A] hover:shadow-[0_0_15px_rgba(227,53,13,0.4)] transition-all flex items-center gap-1">BATTLE <ChevronRight className="w-3.5 h-3.5" /></Link>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {activeDeck.tazos.map(dt => (
              <div key={dt.id} className="game-card flex items-center gap-2 p-2 rounded-lg">
                <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-white/[0.06]" style={{ background: `${FRANCHISE_COLORS[dt.franchiseSlug] || "#1a1a1a"}10` }}>
                  {dt.imageUrl ? <img src={dt.imageUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-[10px] font-bold text-white/30">#{dt.number}</span>}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-white/60 truncate">{dt.name || dt.displayName}</p>
                  <div className="flex gap-1 text-[8px] font-medium"><span style={{ color: "#E3350D" }}>{dt.attack}</span><span style={{ color: "#3B4CCA" }}>{dt.defense}</span><span style={{ color: "#06B6D4" }}>{dt.resistance}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ FILTERS ═══ */}
      <div className="flex flex-wrap items-center gap-2">
        {([{ key: "all", label: "All", count: data.items.length }, { key: "deck", label: "In Deck", count: deckTazos.length }, { key: "duplicates", label: "Duplicates", count: duplicateTazos.length }, { key: "recent", label: "Recent", count: recentTazos.length }] as const).map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider rounded-lg transition-all"
            style={{ background: filter === f.key ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.02)", color: filter === f.key ? "white" : "rgba(255,255,255,0.3)", border: `1px solid ${filter === f.key ? "rgba(255,204,0,0.3)" : "rgba(255,255,255,0.05)"}` }}>
            {f.label} <span className="ml-1 opacity-40">({f.count})</span>
          </button>
        ))}
        {data.franchiseSummary && Object.keys(data.franchiseSummary).length > 0 && (
          <div className="ml-auto flex gap-1.5">
            {Object.entries(data.franchiseSummary).map(([slug, count]) => (
              <span key={slug} className="text-[9px] font-semibold text-white px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ background: `${FRANCHISE_COLORS[slug] || "#FFCC00"}30`, border: `1px solid ${FRANCHISE_COLORS[slug] || "#FFCC00"}30` }}>
                {slug} ({count})
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ═══ COLLECTION GRID ═══ */}
      <div className="game-grid-bg grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 p-3 sm:p-4 rounded-lg">
        {filteredItems.map(item => {
          const accent = FRANCHISE_COLORS[item.tazo.franchiseSlug] || "#FFCC00"
          const power = totalPower(item.tazo)
          const isInDeck = !!item.inDeckId
          return (
            <div key={item.id} className="game-card rounded-lg overflow-hidden group relative">
              {isInDeck && <div className="absolute top-0 right-0 z-10 w-5 h-5 flex items-center justify-center rounded-bl-lg" style={{ background: "#E3350D" }}><Swords className="w-2.5 h-2.5 text-white" /></div>}
              <div className="h-1" style={{ background: accent }} />
              <div className="p-3 flex items-center justify-center" style={{ aspectRatio: "1", background: "rgba(255,255,255,0.01)" }}>
                <div className="w-full h-full rounded-lg flex items-center justify-center overflow-hidden border border-white/[0.04]" style={{ background: `${accent}08` }}>
                  {item.tazo.imageUrl ? <img src={item.tazo.imageUrl} alt="" className="w-[85%] h-[85%] object-contain rounded-lg" loading="lazy" /> : <span className="text-4xl font-bold text-white/[0.03]">?</span>}
                </div>
              </div>
              <div className="p-2 space-y-1.5">
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0"><p className="text-[11px] font-semibold text-white/60 truncate">{item.tazo.name || item.tazo.displayName || `#${item.tazo.number}`}</p><p className="text-[8px] text-white/15 uppercase">{item.tazo.franchiseSlug} #{item.tazo.number}</p></div>
                  {item.quantity > 1 && <span className="text-[9px] font-bold bg-[#FFCC00]/15 text-[#FFCC00] px-1.5 py-0.5 rounded-full border border-[#FFCC00]/20">x{item.quantity}</span>}
                </div>
                <span className="text-[8px] font-semibold uppercase px-1.5 py-0.5 rounded-full border" style={{ color: RARITY_COLORS[item.tazo.rarity] || "#9CA3AF", borderColor: `${RARITY_COLORS[item.tazo.rarity] || "#9CA3AF"}30`, background: `${RARITY_COLORS[item.tazo.rarity] || "#9CA3AF"}08` }}>{RARITY_STARS[item.tazo.rarity] || ""}</span>
                <div className="grid grid-cols-3 gap-1">
                  {[{ l: "ATK", v: item.tazo.attack, c: "#E3350D" }, { l: "DEF", v: item.tazo.defense, c: "#3B4CCA" }, { l: "SPD", v: Math.round((item.tazo.spin + item.tazo.bounce + item.tazo.precision) / 3), c: "#06B6D4" }].map(s => (
                    <div key={s.l} className="text-center"><div className="text-[7px] text-white/10 uppercase leading-none mb-0.5">{s.l}</div><div className="text-xs font-bold" style={{ color: s.c }}>{s.v}</div></div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-[8px]"><span className="text-white/15">{power} TP</span><span className="text-white/[0.06] flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{timeAgo(item.acquiredAt)}</span></div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredItems.length === 0 && filter !== "all" && (
        <div className="game-empty text-center py-12 rounded-lg">
          <p className="font-semibold text-sm text-white/15 uppercase">No tazos match this filter</p>
          <button onClick={() => setFilter("all")} className="mt-2 text-[10px] font-semibold text-[#FFCC00]/60 underline uppercase">Show all</button>
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-wrap gap-3 justify-center pt-2">
        <Link href="/app?tab=album" className="game-btn-secondary px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider rounded-lg inline-flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> View Album</Link>
        <Link href="/app?tab=battle" className="game-btn px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider rounded-lg bg-[#E3350D] text-white hover:bg-[#FF2D1A] hover:shadow-[0_0_15px_rgba(227,53,13,0.4)] transition-all inline-flex items-center gap-1.5"><Swords className="w-4 h-4" /> Battle</Link>
        <Link href="/shop" className="game-btn px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider rounded-lg bg-[#FFCC00] text-black hover:bg-[#FFD633] hover:shadow-[0_0_20px_rgba(255,204,0,0.3)] transition-all inline-flex items-center gap-1.5"><ShoppingBag className="w-4 h-4" /> Open More Bags</Link>
      </div>
    </div>
  )
}
