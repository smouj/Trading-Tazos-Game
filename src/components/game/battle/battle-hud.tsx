// ============================================================
// Trading Tazos Game — Battle HUD v2 (90s Magazine Edition)
// Full magazine panel layout with halftone, stripes, bold
// comic typography, and sticker-style phase badges.
// Overlay inside the 3D battle scene.
//
// Design tokens: all colors reference --ttg-* CSS custom properties.
// ============================================================
"use client"

import { Swords, Disc3, Trophy } from "lucide-react"
import { BATTLE_COLORS } from "@/lib/battle/colors"

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
  intro:         { text: "GET READY!",        color: "var(--ttg-black)", bg: "var(--ttg-yellow)", emoji: "⚡" },
  round_start:   { text: "ROUND START",       color: "var(--ttg-black)", bg: "var(--ttg-success)", emoji: "🏁" },
  betting:       { text: "BET YOUR TAZO",     color: "var(--ttg-black)", bg: "var(--ttg-yellow)", emoji: "🎯" },
  stakes_reveal: { text: "STAKES REVEALED",   color: "var(--ttg-black)", bg: "var(--ttg-yellow)", emoji: "👀" },
  coin_flip:     { text: "COIN FLIP",         color: "var(--ttg-black)", bg: "var(--ttg-yellow)", emoji: "🪙" },
  player_aim:    { text: "AIM",               color: "var(--ttg-black)", bg: "var(--ttg-yellow)", emoji: "🎯" },
  player_charge: { text: "POWER UP!",         color: "var(--ttg-black)", bg: "var(--ttg-warning)", emoji: "⚡" },
  player_tilt:   { text: "TILT & SLAM!",      color: "#fff",             bg: "var(--ttg-red)", emoji: "💥" },
  throwing:      { text: "THROWING...",       color: "#fff",             bg: "var(--ttg-red)", emoji: "💫" },
  slamming:      { text: "SLAM!",             color: "#fff",             bg: "var(--ttg-red)", emoji: "💥" },
  physics:       { text: "RESOLVING...",      color: "var(--ttg-black)", bg: "var(--ttg-warning)", emoji: "🔮" },
  impact:        { text: "IMPACT!",           color: "#fff",             bg: "var(--ttg-red)", emoji: "💥" },
  resolve_impact:{ text: "RESULT",            color: "var(--ttg-black)", bg: "var(--ttg-success)", emoji: "✅" },
  opponent_aim:  { text: "OPPONENT AIM",      color: "#fff",             bg: "var(--ttg-blue)", emoji: "👁️" },
  opponent_slam: { text: "OPPONENT SLAM!",    color: "#fff",             bg: "var(--ttg-blue)", emoji: "💥" },
  opponent_turn: { text: "OPPONENT TURN",     color: "#fff",             bg: "var(--ttg-blue)", emoji: "🔄" },
  round_end:     { text: "ROUND OVER",        color: "var(--ttg-black)", bg: "var(--ttg-success)", emoji: "🏆" },
  match_end:     { text: "MATCH END",         color: "#fff",             bg: "var(--ttg-red)", emoji: "🏆" },
  paused:        { text: "PAUSED",            color: "#fff",             bg: "var(--ttg-black)", emoji: "⏸️" },
  lobby:         { text: "SELECT DECK",       color: "var(--ttg-black)", bg: "var(--ttg-yellow)", emoji: "🃏" },
  turn_transition:{ text: "NEXT ROUND",       color: "var(--ttg-black)", bg: "var(--ttg-success)", emoji: "⏭️" },
}

// ── Score display ──
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
        className="flex-1 h-3 border-2 border-ttg-black overflow-hidden relative"
        style={{
          background: "repeating-linear-gradient(-30deg, transparent, transparent 1px, rgba(0,0,0,0.06) 1px, rgba(0,0,0,0.06) 2px), rgba(255,255,255,0.7)",
          boxShadow: "inset 1px 1px 0 rgba(0,0,0,0.1)",
        }}
      >
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
          <div key={i} className="absolute top-0 bottom-0 w-px"
            style={{ left: `${(i + 1) * 25}%`, background: "var(--ttg-black)", opacity: 0.15 }} />
        ))}
      </div>
      <span
        className="text-[13px] font-black text-ttg-black tabular-nums w-8 text-center shrink-0"
        style={{ textShadow: "0 1px 0 rgba(255,255,255,0.5)" }}
      >
        {score}
      </span>
    </div>
  )
}

// ── Tazo counter chips ──
function TazoChips({ remaining, color }: { remaining: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative w-6 h-6 shrink-0">
        {Array.from({ length: Math.min(remaining, 3) }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border-2 border-ttg-black"
            style={{
              width: 14, height: 14,
              left: i * 4, top: i * 2,
              background: i === 0 ? color : i === 1 ? "var(--ttg-yellow)" : "var(--ttg-black)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
            }}
          />
        ))}
      </div>
      <span className="text-[13px] font-black text-ttg-black tabular-nums leading-none"
        style={{ textShadow: "0 1px 0 rgba(255,255,255,0.5)" }}>
        {remaining}
      </span>
    </div>
  )
}

export default function BattleHUD(props: BattleHUDProps) {
  const {
    playerName, opponentName, playerScore, opponentScore,
    playerTazos, opponentTazos, playerCaptured, opponentCaptured,
    round, phase, turnPlayer, compact,
  } = props
  const phaseInfo = PHASE_LABELS[phase] || { text: phase, color: "var(--ttg-black)", bg: "var(--ttg-yellow)", emoji: "❓" }
  const pRemaining = Math.max(0, playerTazos - playerCaptured)
  const oRemaining = Math.max(0, opponentTazos - opponentCaptured)
  const isPlayerTurn = turnPlayer === "player"
  const isOpponentTurn = turnPlayer === "opponent"
  const isIntro = phase === "intro"

  if (compact) {
    return (
      <div
        className="flex items-center gap-2 px-2 py-1.5"
        style={{
          background: "repeating-linear-gradient(-30deg, transparent, transparent 3px, rgba(255,204,0,0.15) 3px, rgba(255,204,0,0.15) 6px), rgba(255,249,230,0.95)",
          borderBottom: "3px solid var(--ttg-black)",
        }}
      >
        <span className="text-[10px] font-black text-ttg-black tabular-nums">{playerScore}</span>
        <div className="flex-1 h-2 bg-white/50 border overflow-hidden"
          style={{ borderColor: "var(--ttg-black)", opacity: 0.3 }}>
          <div className="h-full transition-all duration-400 ease-out"
            style={{ width: `${Math.min(100, (playerScore / 10) * 100)}%`, background: "linear-gradient(90deg, var(--ttg-red), var(--ttg-red-dark))" }} />
        </div>
        <div className="flex flex-col items-center shrink-0">
          <span className="text-[7px] font-black uppercase tracking-[0.15em] px-1.5 py-0.5 border-2 border-ttg-black leading-none"
            style={{ background: phaseInfo.bg, color: phaseInfo.color }}>
            {phaseInfo.emoji} {phaseInfo.text}
          </span>
          <span className="text-[7px] font-black mt-0.5" style={{ color: "var(--ttg-black)", opacity: 0.25 }}>R{round}</span>
        </div>
        <div className="flex-1 h-2 bg-white/50 border overflow-hidden"
          style={{ borderColor: "var(--ttg-black)", opacity: 0.3 }}>
          <div className="h-full transition-all duration-400 ease-out ml-auto"
            style={{ width: `${Math.min(100, (opponentScore / 10) * 100)}%`, background: "linear-gradient(90deg, var(--ttg-blue), var(--ttg-blue-dark))" }} />
        </div>
        <span className="text-[10px] font-black text-ttg-black tabular-nums">{opponentScore}</span>
      </div>
    )
  }

  // ── Compact magazine header: single-row, full-width, minimal vertical footprint ──
  return (
    <div
      className="w-full select-none"
      style={{
        background: "linear-gradient(180deg, rgba(30,30,30,0.97) 0%, rgba(22,22,22,0.97) 100%)",
        borderBottom: "2px solid rgba(255,204,0,0.2)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
      }}
    >
      <div className="flex items-center gap-2 px-3 py-1.5 max-w-7xl mx-auto">
        {/* ── Left: Player score + tazo count ── */}
        <div className="flex items-center gap-2 shrink-0" style={{ minWidth: 100 }}>
          <div className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" style={{ color: BATTLE_COLORS.red }} />
            <span className="text-xs font-black text-white tabular-nums" style={{ minWidth: 20 }}>{playerScore}</span>
          </div>
          <Disc3 className="w-3 h-3" style={{ color: "rgba(255,255,255,0.15)" }} />
          <span className="text-[10px] font-bold tabular-nums" style={{ color: "rgba(255,255,255,0.35)" }}>{pRemaining}</span>
        </div>

        {/* ── Center: Phase sticker ── */}
        <div className="flex-1 flex items-center justify-center gap-2">
          {!isIntro && (
            <span className="text-[9px] font-black tabular-nums px-1.5 py-0.5 rounded-sm"
              style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.2)" }}>R{round}</span>
          )}
          <span className="text-[9px] font-black uppercase tracking-[0.15em]"
            style={{ color: phaseInfo.color }}>
            {phaseInfo.emoji} {phaseInfo.text}
          </span>
          {isPlayerTurn && (
            <div className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: BATTLE_COLORS.red, boxShadow: `0 0 6px ${BATTLE_COLORS.red}` }} />
          )}
          {isOpponentTurn && (
            <div className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: BATTLE_COLORS.blue, boxShadow: `0 0 6px ${BATTLE_COLORS.blue}` }} />
          )}
        </div>

        {/* ── Right: Opponent score + tazo count ── */}
        <div className="flex items-center gap-2 shrink-0 justify-end" style={{ minWidth: 100 }}>
          <span className="text-[10px] font-bold tabular-nums" style={{ color: "rgba(255,255,255,0.35)" }}>{oRemaining}</span>
          <Disc3 className="w-3 h-3" style={{ color: "rgba(255,255,255,0.15)" }} />
          <div className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" style={{ color: BATTLE_COLORS.blue }} />
            <span className="text-xs font-black text-white tabular-nums" style={{ minWidth: 20 }}>{opponentScore}</span>
          </div>
        </div>
      </div>

      {/* ═══ Score bars (thin) ═══ */}
      <div className="flex gap-px px-3 pb-1.5 max-w-7xl mx-auto">
        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${Math.min(100, (playerScore / 10) * 100)}%`,
              background: `linear-gradient(90deg, ${BATTLE_COLORS.red}, ${BATTLE_COLORS.red}cc)`,
            }} />
        </div>
        <div className="w-4" />{/* spacer */}
        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full ml-auto transition-all duration-500 ease-out"
            style={{
              width: `${Math.min(100, (opponentScore / 10) * 100)}%`,
              background: `linear-gradient(90deg, ${BATTLE_COLORS.blue}cc, ${BATTLE_COLORS.blue})`,
            }} />
        </div>
      </div>
    </div>
  )
}
