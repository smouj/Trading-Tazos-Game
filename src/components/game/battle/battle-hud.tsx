// ============================================================
// Trading Tazos Game — Battle HUD v2 (90s Magazine Edition)
// Full magazine panel layout with halftone, stripes, bold
// comic typography, and sticker-style phase badges.
// Overlay inside the 3D battle scene.
// ============================================================
"use client"

import { Swords, Disc3, Trophy } from "lucide-react"

export interface BattleHUDProps {
  playerName: string
  opponentName: string
  playerScore: number
  opponentScore: number
  playerTazos: number
  opponentTazos: number
  playerCaptured: number
  opponentCaptured: number
  round: number
  phase: string
  turnPlayer: "player" | "opponent" | null
  compact?: boolean
}

const PHASE_LABELS: Record<string, { text: string; color: string; bg: string; emoji: string }> = {
  intro:         { text: "GET READY!",        color: "#1a1a1a", bg: "#FFCC00", emoji: "⚡" },
  round_start:   { text: "ROUND START",       color: "#1a1a1a", bg: "#22C55E", emoji: "🏁" },
  betting:       { text: "BET YOUR TAZO",     color: "#1a1a1a", bg: "#FFCC00", emoji: "🎯" },
  stakes_reveal: { text: "STAKES REVEALED",   color: "#1a1a1a", bg: "#FFCC00", emoji: "👀" },
  coin_flip:     { text: "COIN FLIP",         color: "#1a1a1a", bg: "#FFCC00", emoji: "🪙" },
  player_aim:    { text: "AIM",               color: "#1a1a1a", bg: "#FFCC00", emoji: "🎯" },
  player_charge: { text: "POWER UP!",         color: "#1a1a1a", bg: "#F59E0B", emoji: "⚡" },
  player_tilt:   { text: "TILT & SLAM!",      color: "#fff",    bg: "#E3350D", emoji: "💥" },
  throwing:      { text: "THROWING...",       color: "#fff",    bg: "#E3350D", emoji: "💫" },
  slamming:      { text: "SLAM!",             color: "#fff",    bg: "#E3350D", emoji: "💥" },
  physics:       { text: "RESOLVING...",      color: "#1a1a1a", bg: "#F59E0B", emoji: "🔮" },
  impact:        { text: "IMPACT!",           color: "#fff",    bg: "#E3350D", emoji: "💥" },
  resolve_impact:{ text: "RESULT",            color: "#1a1a1a", bg: "#22C55E", emoji: "✅" },
  opponent_aim:  { text: "OPPONENT AIM",      color: "#fff",    bg: "#3B4CCA", emoji: "👁️" },
  opponent_slam: { text: "OPPONENT SLAM!",    color: "#fff",    bg: "#3B4CCA", emoji: "💥" },
  opponent_turn: { text: "OPPONENT TURN",     color: "#fff",    bg: "#3B4CCA", emoji: "🔄" },
  round_end:     { text: "ROUND OVER",        color: "#1a1a1a", bg: "#22C55E", emoji: "🏆" },
  match_end:     { text: "MATCH END",         color: "#fff",    bg: "#E3350D", emoji: "🏆" },
  paused:        { text: "PAUSED",            color: "#fff",    bg: "#1a1a1a", emoji: "⏸️" },
  lobby:         { text: "SELECT DECK",       color: "#1a1a1a", bg: "#FFCC00", emoji: "🃏" },
  turn_transition:{ text: "NEXT ROUND",       color: "#1a1a1a", bg: "#22C55E", emoji: "⏭️" },
}

// ── Score display (replaces HP bar) ──
function ScoreBar({ score, label, color, side }: {
  score: number; label: string; color: string; side: "left" | "right"
}) {
  return (
    <div
      className="flex items-center gap-2"
      style={{ flexDirection: side === "right" ? "row-reverse" : "row" }}
    >
      <Trophy
        className="w-4 h-4 shrink-0"
        style={{ color, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }}
      />
      <div
        className="flex-1 h-3 border-2 border-[#1a1a1a] overflow-hidden relative"
        style={{
          background: "repeating-linear-gradient(-30deg, transparent, transparent 1px, rgba(0,0,0,0.06) 1px, rgba(0,0,0,0.06) 2px), rgba(255,255,255,0.7)",
          boxShadow: "inset 1px 1px 0 rgba(0,0,0,0.1)",
        }}
      >
        {/* Score fills proportionally — max display at 10 */}
        <div
          className="h-full transition-all duration-400 ease-out"
          style={{
            width: `${Math.min(100, (score / 10) * 100)}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
            marginLeft: side === "right" ? "auto" : 0,
          }}
        />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="absolute top-0 bottom-0 w-px bg-[#1a1a1a]/15"
            style={{ left: `${(i + 1) * 25}%` }} />
        ))}
      </div>
      <span
        className="text-[13px] font-black text-[#1a1a1a] tabular-nums w-8 text-center shrink-0"
        style={{ textShadow: "0 1px 0 rgba(255,255,255,0.5)" }}
      >
        {score}
      </span>
    </div>
  )
}

// ── Tazo counter chips ──
function TazoChips({ active, captured, color }: { active: number; captured: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative w-6 h-6 shrink-0">
        {Array.from({ length: Math.min(active, 3) }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border-2 border-[#1a1a1a]"
            style={{
              width: 14, height: 14,
              left: i * 4, top: i * 2,
              background: i === 0 ? color : i === 1 ? "#FFCC00" : "#1a1a1a",
              boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
            }}
          />
        ))}
      </div>
      <span className="text-[13px] font-black text-[#1a1a1a] tabular-nums leading-none"
        style={{ textShadow: "0 1px 0 rgba(255,255,255,0.5)" }}>
        {active}
      </span>
      {captured > 0 && (
        <span className="text-[9px] font-black text-[#E3350D] leading-none ml-0.5">+{captured}</span>
      )}
    </div>
  )
}

export default function BattleHUD(props: BattleHUDProps) {
  const {
    playerName, opponentName, playerScore, opponentScore,
    playerTazos, opponentTazos, playerCaptured, opponentCaptured,
    round, phase, turnPlayer, compact,
  } = props
  const phaseInfo = PHASE_LABELS[phase] || { text: phase, color: "#1a1a1a", bg: "#FFCC00", emoji: "❓" }
  const pActive = Math.max(0, playerTazos - playerCaptured)
  const oActive = Math.max(0, opponentTazos - opponentCaptured)
  const isPlayerTurn = turnPlayer === "player"
  const isOpponentTurn = turnPlayer === "opponent"
  const isIntro = phase === "intro"

  if (compact) {
    return (
      <div
        className="flex items-center gap-2 px-2 py-1.5"
        style={{
          background: "repeating-linear-gradient(-30deg, transparent, transparent 3px, rgba(255,204,0,0.15) 3px, rgba(255,204,0,0.15) 6px), rgba(255,249,230,0.95)",
          borderBottom: "3px solid #1a1a1a",
        }}
      >
        <span className="text-[10px] font-black text-[#1a1a1a] tabular-nums">{playerScore}</span>
        <div className="flex-1 h-2 bg-white/50 border border-[#1a1a1a]/30 overflow-hidden">
          <div className="h-full transition-all duration-400 ease-out"
            style={{ width: `${Math.min(100, (playerScore / 10) * 100)}%`, background: `linear-gradient(90deg, #E3350D, #E3350Dcc)` }} />
        </div>
        <div className="flex flex-col items-center shrink-0">
          <span className="text-[7px] font-black uppercase tracking-[0.15em] px-1.5 py-0.5 border-2 border-[#1a1a1a] leading-none"
            style={{ background: phaseInfo.bg, color: phaseInfo.color }}>
            {phaseInfo.emoji} {phaseInfo.text}
          </span>
          <span className="text-[7px] font-black text-[#1a1a1a]/25 mt-0.5">R{round}</span>
        </div>
        <div className="flex-1 h-2 bg-white/50 border border-[#1a1a1a]/30 overflow-hidden">
          <div className="h-full transition-all duration-400 ease-out ml-auto"
            style={{ width: `${Math.min(100, (opponentScore / 10) * 100)}%`, background: `linear-gradient(90deg, #3B4CCA, #3B4CCAcc)` }} />
        </div>
        <span className="text-[10px] font-black text-[#1a1a1a] tabular-nums">{opponentScore}</span>
      </div>
    )
  }

  return (
    <div
      className="w-full select-none"
      style={{
        background: "radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(180deg, #FFF9E6 0%, #FFF3CC 100%)",
        backgroundSize: "8px 8px, 100% 100%",
        borderTop: "4px solid #1a1a1a",
        borderBottom: "4px solid #1a1a1a",
        boxShadow: "0 -4px 0 #FFCC00, 0 4px 0 #FFCC00",
      }}
    >
      {/* ═══ TOP STRIP — Round + Phase Banner ═══ */}
      {!isIntro && (
        <div
          className="flex items-center justify-center px-3 py-1.5 relative"
          style={{
            background: "repeating-linear-gradient(-30deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 6px), linear-gradient(180deg, rgba(0,0,0,0.03) 0%, transparent 100%)",
            borderBottom: "2px solid #1a1a1a",
          }}
        >
          {/* Round badge */}
          <div className="absolute left-3 flex items-center gap-2">
            <div className="px-2 py-1 border-2 border-[#1a1a1a]"
              style={{ background: "#1a1a1a", boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}>
              <span className="text-[9px] font-black text-[#FFCC00] uppercase tracking-[0.2em]">R{round}</span>
            </div>
            {isPlayerTurn && (
              <div className="w-2 h-2 rounded-full bg-[#E3350D] animate-pulse"
                style={{ boxShadow: "0 0 6px #E3350D" }} />
            )}
          </div>

          {/* Phase sticker */}
          <div
            className="px-4 py-1.5 border-3 border-[#1a1a1a] relative"
            style={{
              background: phaseInfo.bg,
              boxShadow: "3px 3px 0 #1a1a1a",
              transform: "rotate(-0.5deg)",
            }}
          >
            <span className="text-[11px] font-black uppercase tracking-[0.25em]"
              style={{ color: phaseInfo.color }}>
              {phaseInfo.emoji} {phaseInfo.text}
            </span>
          </div>

          {/* Turn indicator */}
          <div className="absolute right-3">
            <div className="flex items-center gap-1">
              <span className="text-[8px] font-black text-[#1a1a1a]/40 uppercase tracking-[0.15em]">
                {isPlayerTurn ? "YOUR TURN" : isOpponentTurn ? "OPPONENT" : ""}
              </span>
              <Swords className="w-3 h-3 text-[#1a1a1a]/30" />
            </div>
          </div>
        </div>
      )}

      {/* ═══ MAIN PANELS — Player vs Opponent ═══ */}
      <div className="flex items-stretch">
        {/* PLAYER (left) */}
        <div className="flex-1 px-3 py-2.5" style={{ borderRight: "1px solid rgba(26,26,26,0.08)" }}>
          <div className="flex items-center gap-2 mb-2">
            <div
              className="px-2 py-0.5 border-2 border-[#1a1a1a]"
              style={{
                background: "linear-gradient(180deg, #E3350D 0%, #c9302c 100%)",
                boxShadow: "2px 2px 0 rgba(0,0,0,0.3)",
              }}
            >
              <span className="text-[10px] font-black text-white uppercase tracking-[0.15em]">{playerName}</span>
            </div>
          </div>
          <ScoreBar score={playerScore} label={playerName} color="#E3350D" side="left" />
          <div className="flex items-center justify-between mt-2">
            <TazoChips active={pActive} captured={playerCaptured} color="#E3350D" />
            <div className="flex items-center gap-1.5 text-[8px] font-black text-[#1a1a1a]/25 uppercase tracking-[0.15em]">
              <Disc3 className="w-2.5 h-2.5" /> DECK
            </div>
          </div>
        </div>

        {/* VS DIVIDER */}
        <div className="flex flex-col items-center justify-center px-2 shrink-0 relative">
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, #1a1a1a 2px, #1a1a1a 4px)" }}
          />
          <div
            className="relative z-10 w-8 h-8 border-3 border-[#1a1a1a] flex items-center justify-center"
            style={{ background: "#FFCC00", boxShadow: "2px 2px 0 #1a1a1a" }}
          >
            <span className="text-[14px] font-black text-[#1a1a1a] leading-none">VS</span>
          </div>
        </div>

        {/* OPPONENT (right) */}
        <div className="flex-1 px-3 py-2.5" style={{ borderLeft: "1px solid rgba(26,26,26,0.08)" }}>
          <div className="flex items-center gap-2 mb-2 justify-end">
            <div
              className="px-2 py-0.5 border-2 border-[#1a1a1a]"
              style={{
                background: "linear-gradient(180deg, #3B4CCA 0%, #2a3aa0 100%)",
                boxShadow: "2px 2px 0 rgba(0,0,0,0.3)",
              }}
            >
              <span className="text-[10px] font-black text-white uppercase tracking-[0.15em]">{opponentName}</span>
            </div>
          </div>
          <ScoreBar score={opponentScore} label={opponentName} color="#3B4CCA" side="right" />
          <div className="flex items-center justify-between mt-2 flex-row-reverse">
            <TazoChips active={oActive} captured={opponentCaptured} color="#3B4CCA" />
            <div className="flex items-center gap-1.5 text-[8px] font-black text-[#1a1a1a]/25 uppercase tracking-[0.15em] flex-row-reverse">
              <Disc3 className="w-2.5 h-2.5" /> DECK
            </div>
          </div>
        </div>
      </div>

      {/* ═══ BOTTOM ACCENT STRIPE ═══ */}
      <div
        className="h-1.5"
        style={{
          background: "repeating-linear-gradient(90deg, #FFCC00 0px, #FFCC00 4px, #1a1a1a 4px, #1a1a1a 8px)",
          borderTop: "2px solid #1a1a1a",
        }}
      />
    </div>
  )
}
