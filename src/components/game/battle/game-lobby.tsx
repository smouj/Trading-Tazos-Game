// ============================================================
// Trading Tazos Game — Game Lobby
// Pre-battle screen: mode selection (AI/PvP), deck setup, launch.
// ============================================================
"use client"

import { useState, useMemo } from "react"
import type { TazoCard, PlayMode, AIDifficulty } from "@/lib/battle/game-loop"
import { Swords, Bot, Globe, Play, ChevronRight, Zap, Shield, Crosshair, Timer, Star } from "lucide-react"

interface GameLobbyProps {
  playerTazos: TazoCard[]
  onStart: (mode: PlayMode, difficulty: AIDifficulty, deck: TazoCard[]) => void
  isLoading: boolean
  isAuthenticated: boolean
}

export default function GameLobby({ playerTazos, onStart, isLoading, isAuthenticated }: GameLobbyProps) {
  const [mode, setMode] = useState<PlayMode>("practice")
  const [difficulty, setDifficulty] = useState<AIDifficulty>("skilled")
  const [selectedDeck, setSelectedDeck] = useState<number[]>([])

  // Auto-select best 5 tazos by total stats
  const bestDeck = useMemo(() => {
    return [...playerTazos]
      .sort((a, b) => {
        const totalA = a.attack + a.defense + a.bounce + a.spin + a.precision
        const totalB = b.attack + b.defense + b.bounce + b.spin + b.precision
        return totalB - totalA
      })
      .slice(0, 5)
  }, [playerTazos])

  const deck = selectedDeck.length === 5
    ? playerTazos.filter(t => selectedDeck.includes(playerTazos.indexOf(t)))
    : bestDeck

  const deckTotalStats = deck.reduce((acc, t) => ({
    attack: acc.attack + t.attack,
    defense: acc.defense + t.defense,
    bounce: acc.bounce + t.bounce,
    spin: acc.spin + t.spin,
    precision: acc.precision + t.precision,
  }), { attack: 0, defense: 0, bounce: 0, spin: 0, precision: 0 })

  const handleToggleTazo = (idx: number) => {
    setSelectedDeck(prev => {
      if (prev.includes(idx)) return prev.filter(i => i !== idx)
      if (prev.length >= 5) return [...prev.slice(1), idx]
      return [...prev, idx]
    })
  }

  const franchiseColor = (f: string) =>
    f === "minimon" ? "#FFCB05" : f === "cybermon" ? "#00A1E9" : "#FF6B00"

  const franchiseGrad = (f: string) =>
    f === "minimon"
      ? "linear-gradient(135deg, #FFCB05, #FF8C00)"
      : f === "cybermon"
      ? "linear-gradient(135deg, #00A1E9, #0057B7)"
      : "linear-gradient(135deg, #FF6B00, #CC4400)"

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      {/* ── Title ── */}
      <div className="text-center p-4 sm:p-6 bg-[#FFCC00] border-3 border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a]">
        <Swords className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-[#1a1a1a]" />
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-[#1a1a1a]">
          Battle Arena
        </h2>
        <p className="text-sm font-bold text-[#1a1a1a]/60 mt-1">
          Select your mode, pick your tazos, and fight!
        </p>
      </div>

      {/* ── Mode Selection ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Practice */}
        <button
          onClick={() => setMode("practice")}
          className={`p-4 border-3 text-left transition-all ${
            mode === "practice"
              ? "bg-white border-[#FFCC00] shadow-[4px_4px_0px_#FFCC00]"
              : "bg-zinc-50 border-[#1a1a1a]/20 hover:border-[#1a1a1a]/60"
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <Bot className="w-6 h-6 text-[#FFCC00]" />
            {mode === "practice" && (
              <span className="text-[10px] font-black bg-[#FFCC00] px-2 py-0.5 border-2 border-[#1a1a1a]">ACTIVE</span>
            )}
          </div>
          <h3 className="font-black text-sm uppercase text-[#1a1a1a]">Practice</h3>
          <p className="text-xs text-[#1a1a1a]/50 mt-1">Fight the AI. No pressure, just fun.</p>
          <span className="text-[10px] font-bold text-green-600 mt-1 block">✓ No login needed</span>
        </button>

        {/* PvP Ranked */}
        <button
          onClick={() => setMode("pvp_ranked")}
          className={`p-4 border-3 text-left transition-all ${
            mode === "pvp_ranked"
              ? "bg-white border-[#E3350D] shadow-[4px_4px_0px_#E3350D]"
              : "bg-zinc-50 border-[#1a1a1a]/20 hover:border-[#1a1a1a]/60"
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <Globe className="w-6 h-6 text-[#E3350D]" />
            {mode === "pvp_ranked" && (
              <span className="text-[10px] font-black bg-[#E3350D] text-white px-2 py-0.5 border-2 border-[#1a1a1a]">ACTIVE</span>
            )}
          </div>
          <h3 className="font-black text-sm uppercase text-[#1a1a1a]">Ranked PvP</h3>
          <p className="text-xs text-[#1a1a1a]/50 mt-1">Matchmaking. Climb the ladder. Glory awaits.</p>
          {!isAuthenticated && (
            <span className="text-[10px] font-bold text-[#E3350D] mt-1 block">🔒 Login required</span>
          )}
        </button>

        {/* PvP Friend */}
        <button
          onClick={() => setMode("pvp_friend")}
          className={`p-4 border-3 text-left transition-all ${
            mode === "pvp_friend"
              ? "bg-white border-[#3B4CCA] shadow-[4px_4px_0px_#3B4CCA]"
              : "bg-zinc-50 border-[#1a1a1a]/20 hover:border-[#1a1a1a]/60"
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <Swords className="w-6 h-6 text-[#3B4CCA]" />
            {mode === "pvp_friend" && (
              <span className="text-[10px] font-black bg-[#3B4CCA] text-white px-2 py-0.5 border-2 border-[#1a1a1a]">ACTIVE</span>
            )}
          </div>
          <h3 className="font-black text-sm uppercase text-[#1a1a1a]">Friend Battle</h3>
          <p className="text-xs text-[#1a1a1a]/50 mt-1">Room code. Direct challenge. No ladder.</p>
          {!isAuthenticated && (
            <span className="text-[10px] font-bold text-[#E3350D] mt-1 block">🔒 Login required</span>
          )}
        </button>
      </div>

      {/* ── AI Difficulty ── */}
      {mode === "practice" && (
        <div className="p-4 bg-white border-3 border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a]">
          <h3 className="font-black text-xs uppercase tracking-wider text-[#1a1a1a]/50 mb-3">AI Difficulty</h3>
          <div className="grid grid-cols-3 gap-2">
            {(["novice", "skilled", "master"] as AIDifficulty[]).map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`p-3 border-2 text-center transition-all ${
                  difficulty === d
                    ? "border-[#FFCC00] bg-[#FFCB0510] shadow-[2px_2px_0px_#FFCC00]"
                    : "border-[#1a1a1a]/20 hover:border-[#1a1a1a]/60"
                }`}
              >
                <div className="font-black text-sm uppercase text-[#1a1a1a] capitalize">{d}</div>
                <div className="text-[10px] text-[#1a1a1a]/40 mt-0.5">
                  {d === "novice" ? "Easy" : d === "skilled" ? "Normal" : "Hard"}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Deck Selector ── */}
      <div className="p-4 bg-white border-3 border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-xs uppercase tracking-wider text-[#1a1a1a]/50">
            Your Deck ({deck.length}/5)
          </h3>
          <span className="text-[10px] font-bold text-[#1a1a1a]/30">
            {selectedDeck.length > 0 ? "Custom" : "Auto-best"}
          </span>
        </div>

        {/* Deck stats summary */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <StatBadge icon={<Zap className="w-3 h-3" />} label="ATK" value={deckTotalStats.attack} color="#E3350D" />
          <StatBadge icon={<Shield className="w-3 h-3" />} label="DEF" value={deckTotalStats.defense} color="#3B4CCA" />
          <StatBadge icon={<Crosshair className="w-3 h-3" />} label="PRC" value={deckTotalStats.precision} color="#22C55E" />
          <StatBadge icon={<Timer className="w-3 h-3" />} label="SPN" value={deckTotalStats.spin} color="#F59E0B" />
          <StatBadge icon={<Star className="w-3 h-3" />} label="BNC" value={deckTotalStats.bounce} color="#A855F7" />
        </div>

        {/* Tazo grid */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-[160px] sm:max-h-[200px] overflow-y-auto custom-scrollbar">
          {playerTazos.map((t, idx) => {
            const selected = selectedDeck.length > 0 ? selectedDeck.includes(idx) : bestDeck.some(b => b.id === t.id)
            const total = t.attack + t.defense + t.precision + t.spin + t.bounce
            return (
              <button
                key={t.id}
                onClick={() => handleToggleTazo(idx)}
                className={`p-2 border-2 text-center transition-all ${
                  selected
                    ? "border-[#FFCC00] bg-[#FFCB0510] shadow-[2px_2px_0px_#FFCC00]"
                    : "border-[#1a1a1a]/10 hover:border-[#1a1a1a]/40 opacity-80 hover:opacity-100"
                }`}
              >
                {/* Tazo image thumbnail */}
                <div className="w-10 h-10 mx-auto mb-1 rounded-full overflow-hidden border-2 border-[#1a1a1a]/20 bg-zinc-100">
                  {t.imageUrl ? (
                    <img
                      src={t.imageUrl}
                      alt={t.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-white text-[10px] font-black"
                      style={{ background: franchiseGrad(t.franchise) }}
                    >
                      {t.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="text-[10px] font-bold text-[#1a1a1a] truncate leading-tight">{t.name}</div>
                <div className="text-[9px] font-bold mt-0.5" style={{ color: franchiseColor(t.franchise) }}>
                  {total}
                </div>
              </button>
            )
          })}
        </div>
        {playerTazos.length < 5 && (
          <p className="text-xs text-[#E3350D] font-bold mt-2 text-center">
            You need at least 5 tazos in your collection to battle!
          </p>
        )}
      </div>

      {/* ── Action ── */}
      <div className="text-center">
        <button
          onClick={() => {
            const finalDeck = selectedDeck.length === 5
              ? playerTazos.filter(t => selectedDeck.includes(playerTazos.indexOf(t)))
              : bestDeck
            onStart(mode, difficulty, finalDeck)
          }}
          disabled={playerTazos.length < 5 || isLoading || (mode !== "practice" && !isAuthenticated)}
          className="w-full sm:w-auto px-8 sm:px-12 py-4 font-black text-lg uppercase tracking-wider bg-[#E3350D] text-white border-3 border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#1a1a1a] transition-all disabled:opacity-40 disabled:cursor-not-allowed active:translate-x-[2px] active:translate-y-[2px]"
        >
          {isLoading
            ? "Loading..."
            : mode === "practice"
              ? (
                <>
                  <Play className="w-5 h-5 inline mr-2" />
                  Battle AI
                </>
              )
              : mode === "pvp_ranked"
              ? (
                <>
                  <Globe className="w-5 h-5 inline mr-2" />
                  Find Match
                </>
              )
              : (
                <>
                  <Swords className="w-5 h-5 inline mr-2" />
                  Create Room
                </>
              )
          }
        </button>
        {!isAuthenticated && mode !== "practice" && (
          <p className="text-xs text-[#E3350D] font-bold mt-2">
            You need to be logged in for online battles.
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Stat Badge ───
function StatBadge({ icon, label, value, color }: {
  icon: React.ReactNode
  label: string
  value: number
  color: string
}) {
  return (
    <div className="flex items-center gap-1 px-2 py-0.5 bg-zinc-100 border border-[#1a1a1a]/15 rounded text-[10px] font-bold">
      <span style={{ color }}>{icon}</span>
      <span className="text-[#1a1a1a]/50">{label}</span>
      <span className="text-[#1a1a1a]">{value}</span>
    </div>
  )
}
