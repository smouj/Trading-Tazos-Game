"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n"
import { Layers, Plus, Trash2, Star, Swords, Shield, Zap } from "lucide-react"

interface DeckTazo {
  id: string; name: string; displayName: string; imageUrl: string; franchise: string
  attack: number; defense: number; resistance: number
  weight: number; stability: number; spin: number
  control: number; bounce: number; precision: number
  role?: string | null
}
interface Deck { id: string; name: string; isActive: boolean; tazoCount: number; tazos: DeckTazo[] }

const FRANCHISE_BORDER: Record<string, string> = {
  minimon: "#FFCB05", cybermon: "#00A1E9", dracobell: "#FF6B00",
}

export default function DecksPage() {
  const { t } = useI18n()
  const { user, token, loading } = useAuth()
  const [decks, setDecks] = useState<Deck[]>([])
  const [fetching, setFetching] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [deckName, setDeckName] = useState("")
  const [error, setError] = useState("")

  const fetchDecks = () => {
    if (!token) return
    fetch("/api/decks", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((d) => setDecks(d.decks || []))
      .catch(() => {})
      .finally(() => setFetching(false))
  }
  useEffect(() => { fetchDecks() }, [token])

  const handleCreate = async () => {
    if (!deckName.trim()) return
    setError("")
    try {
      const res = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: deckName, tazoIds: [] }),
      })
      if (res.ok) { setDeckName(""); setShowCreate(false); fetchDecks() }
      else { const d = await res.json(); setError(d.error || "Failed") }
    } catch { setError("Network error") }
  }

  const handleActivate = async (deckId: string) => {
    await fetch(`/api/decks/${deckId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isActive: true }),
    })
    fetchDecks()
  }

  const handleDelete = async (deckId: string) => {
    if (!confirm(t.common_confirm_delete)) return
    await fetch(`/api/decks/${deckId}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token}` },
    })
    fetchDecks()
  }

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="mag-spinner w-10 h-10 rounded-full border-4 border-[#FFCC00] border-t-[#E3350D]" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="py-20 text-center space-y-5">
        <Layers className="w-14 h-14 text-[#1a1a1a]/15 mx-auto" />
        <p className="font-black text-sm text-[#1a1a1a]/40 uppercase tracking-wider">{t.auth_login_subtitle}</p>
        <Link href="/login" className="inline-block py-3 px-8 mag-btn bg-[#E3350D] text-white text-xs font-black uppercase tracking-widest">
          {t.auth_login}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 space-y-4">
      {/* ═══════════════════════════════════════════ */}
      {/* GAME BANNER                               */}
      {/* ═══════════════════════════════════════════ */}
      <div className="game-banner px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Layers className="w-5 h-5 text-[#FFCC00]" />
          <span className="text-sm font-bold text-white/80 tracking-wide uppercase">
            {t.decks_title}
          </span>
        </div>
        <div className="w-px h-5 bg-white/[0.06]" />
        <span className="text-sm font-bold text-[#FFCC00] tracking-wide">
          {decks.length} DECKS
        </span>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="ml-auto game-btn bg-white/5 text-white/70 border border-white/[0.08] hover:bg-white/10 hover:border-white/[0.12] flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider rounded-lg transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          {t.decks_create}
        </button>
      </div>

        {/* Create form */}
        {showCreate && (
          <div className="game-panel p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                placeholder={t.decks_name_placeholder}
                className="game-input flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={handleCreate} className="game-btn px-5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg bg-[#FFCC00] text-black hover:bg-[#FFD633] hover:shadow-[0_0_20px_rgba(255,204,0,0.3)] transition-all">
                  {t.decks_create}
                </button>
                <button onClick={() => setShowCreate(false)} className="game-btn px-3 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg bg-white/5 text-white/50 border border-white/[0.08] hover:bg-white/10 hover:text-white/70 transition-all">
                  {t.common_cancel}
                </button>
              </div>
            </div>
            {error && <p className="text-sm font-medium text-red-400 mt-2">{error}</p>}
            <p className="text-[10px] text-white/20 mt-2 uppercase tracking-wider">
              ${t.decks_select_tazos} -- {t.decks_select_tazos} — {t.decks_min_tazos}
            </p>
          </div>
        )}

        {/* Decks list */}
        {decks.length > 0 ? (
          <div className="space-y-4">
            {decks.map((deck) => (
              <div
                key={deck.id}
                className="game-panel p-5 hover:bg-white/[0.04] hover:border-[#FFCC00]/20 transition-all cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white/80 uppercase tracking-wide">{deck.name}</h2>
                      {deck.isActive && (
                        <span className="inline-flex items-center gap-1 text-[9px] bg-[#FFCC00] text-black font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          <Star className="w-2.5 h-2.5 fill-black" />
                          {t.decks_active}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/25 uppercase tracking-wider mt-0.5">
                      {deck.tazoCount} {t.decks_tazo_count}
                    </p>
                  </div>

                  <div className="flex gap-1.5">
                    {!deck.isActive && (
                      <button
                        onClick={() => handleActivate(deck.id)}
                        className="game-btn px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider rounded-lg bg-[#FFCC00] text-black hover:bg-[#FFD633] transition-all flex items-center gap-1"
                      >
                        <Star className="w-3 h-3" />
                        {t.decks_activate}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(deck.id)}
                      className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider rounded-lg bg-transparent text-red-400/60 border border-red-400/20 hover:bg-red-400/10 hover:text-red-400 hover:border-red-400/30 transition-all flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Tazo strip */}
                {deck.tazos.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {deck.tazos.map((tazo) => {
                      const borderColor = FRANCHISE_BORDER[tazo.franchise] || "#1a1a1a"
                      return (
                        <div
                          key={tazo.id}
                          className="shrink-0 overflow-hidden rounded-lg game-card"
                          style={{ width: "80px", borderColor: `${borderColor}30`, border: `1px solid ${borderColor}20` }}
                        >
                          <div className="h-1" style={{ background: borderColor }} />
                          <div className="p-1.5 flex items-center justify-center" style={{ aspectRatio: "1", background: "rgba(255,255,255,0.02)" }}>
                            {tazo.imageUrl ? (
                              <img src={tazo.imageUrl} alt={tazo.name || ""} className="w-full h-full object-contain rounded-lg" loading="lazy" />
                            ) : (
                              <span className="text-xl font-bold text-white/10">?</span>
                            )}
                          </div>
                          <div className="p-1">
                            <p className="text-[8px] font-semibold text-white/60 truncate leading-tight">
                              {tazo.name || "?"}
                            </p>
                            <div className="flex gap-0.5 mt-0.5">
                              <span className="text-[7px] font-semibold text-red-400/80">{tazo.attack}</span>
                              <span className="text-[7px] text-white/10">/</span>
                              <span className="text-[7px] font-semibold text-blue-400/80">{tazo.defense}</span>
                              <span className="text-[7px] text-white/10">/</span>
                              <span className="text-[7px] font-semibold text-amber-400/80">{tazo.bounce}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-white/10 italic uppercase tracking-wider py-4 text-center border border-dashed border-white/[0.06] rounded-lg">
                    {t.decks_select_tazos}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : !showCreate ? (
          /* Empty state */
          <div className="game-empty rounded-lg text-center py-20">
            <Layers className="w-20 h-20 text-white/[0.05] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white/20 mb-2 uppercase tracking-wide">
              {t.decks_empty}
            </h2>
            <button
              onClick={() => setShowCreate(true)}
              className="game-btn inline-block mt-4 py-3 px-8 text-sm font-semibold uppercase tracking-widest rounded-lg bg-[#FFCC00] text-black hover:bg-[#FFD633] hover:shadow-[0_0_20px_rgba(255,204,0,0.3)] transition-all"
            >
              {t.decks_create}
            </button>
          </div>
        ) : null}
    </div>
  )
}
