// ============================================================
// Trading Tazos Game — PvP Battle Panel
// Online matchmaking + turn relay via WebSocket.
// ============================================================
"use client"

import { useState, useEffect, useCallback } from "react"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import { useMultiplayer } from "@/lib/multiplayer"
import {
  Swords, Users, Clock, Loader2, Wifi, WifiOff,
  User, ArrowRight, Trophy, X,
} from "lucide-react"
import Link from "next/link"

export default function PvPBattlePanel() {
  const { t } = useI18n()
  const { user } = useAuth()
  const mp = useMultiplayer()

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mag-card p-8 max-w-md space-y-4">
          <Users className="w-12 h-12 mx-auto text-zinc-500" />
          <h3 className="text-lg font-black uppercase tracking-wider text-[#1a1a1a]">
            {t.tabBattle} Online
          </h3>
          <p className="text-sm text-zinc-500 font-medium">
            {t.auth_login} or {t.auth_register} to battle
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Link href="/login" className="mag-btn bg-[#FFCC00] text-[#1a1a1a] text-xs font-black uppercase px-4 py-2 border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all">
              {t.auth_login}
            </Link>
            <Link href="/register" className="mag-btn bg-[#E3350D] text-white text-xs font-black uppercase px-4 py-2 border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all">
              {t.auth_register}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ─── Matchmaking ────────────────────────────────────
  if (mp.state === "idle" || mp.state === "connecting") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mag-card p-8 max-w-md w-full space-y-6">
          <Swords className="w-14 h-14 mx-auto text-[#FFCC00] drop-shadow-[2px_2px_0px_#1a1a1a]" />
          <h3 className="text-xl font-black uppercase tracking-wider text-[#1a1a1a]">
            PvP Battle
          </h3>
          <p className="text-sm text-zinc-500 font-medium leading-relaxed">
            Challenge another player in real time.<br />
            You need an <strong>active deck</strong> with at least 5 tazos.
          </p>
          <button
            onClick={mp.joinQueue}
            disabled={mp.state === "connecting"}
            className="mag-btn w-full bg-[#FFCC00] text-[#1a1a1a] text-sm font-black uppercase px-6 py-3 border-2 border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mp.state === "connecting" ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> {t.common_loading || "Connecting..."}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Swords className="w-4 h-4" /> Find Match
              </span>
            )}
          </button>
        </div>
      </div>
    )
  }

  // ─── In Queue ───────────────────────────────────────
  if (mp.state === "queued") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mag-card p-8 max-w-md w-full space-y-6">
          <div className="relative mx-auto w-16 h-16">
            <Clock className="w-16 h-16 text-[#FFCC00] animate-spin" />
            <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-[#1a1a1a]">
              {mp.queuePosition}
            </span>
          </div>
          <h3 className="text-lg font-black uppercase tracking-wider text-[#1a1a1a]">
            Searching for opponent...
          </h3>
          <p className="text-sm text-zinc-500 font-medium">
            Position in queue: <strong className="text-[#E3350D]">#{mp.queuePosition}</strong>
          </p>
          <button
            onClick={mp.leaveQueue}
            className="mag-btn text-xs font-black uppercase px-4 py-2 border-2 border-[#1a1a1a] bg-zinc-200 text-zinc-600 shadow-[2px_2px_0px_#1a1a1a] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <X className="w-3 h-3 inline mr-1" /> Cancel
          </button>
        </div>
      </div>
    )
  }

  // ─── Matched — Brief Intro ──────────────────────────
  // (after match, transition to battle in next iteration)
  if (mp.state === "matched") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mag-card p-8 max-w-md w-full space-y-6">
          <Trophy className="w-14 h-14 mx-auto text-[#FFCC00] drop-shadow-[2px_2px_0px_#1a1a1a]" />
          <h3 className="text-lg font-black uppercase tracking-wider text-[#1a1a1a]">
            Match Found!
          </h3>
          <div className="flex items-center justify-center gap-3">
            <div className="text-right">
              <p className="text-sm font-black text-[#1a1a1a]">{user.name}</p>
              <p className="text-[10px] text-zinc-500 font-bold uppercase">You</p>
            </div>
            <Swords className="w-5 h-5 text-[#E3350D]" />
            <div className="text-left">
              <p className="text-sm font-black text-[#1a1a1a]">{mp.opponent?.name || "Opponent"}</p>
              <p className="text-[10px] text-zinc-500 font-bold uppercase">Opponent</p>
            </div>
          </div>
          <p className="text-xs text-zinc-500 font-medium">
            Room: <code className="text-[10px] bg-zinc-200 px-1 py-0.5 rounded">{mp.roomId}</code>
          </p>
          <p className="text-xs text-[#E3350D] font-bold">
            Battle engine syncing across WebSocket will be ready in the next update. For now, enjoy the matchmaking!
          </p>
        </div>
      </div>
    )
  }

  // ─── Playing / Disconnected ─────────────────────────
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mag-card p-8 max-w-md w-full space-y-6">
        {mp.state === "playing" ? (
          <>
            <Wifi className="w-12 h-12 mx-auto text-green-500" />
            <h3 className="text-lg font-black uppercase tracking-wider text-[#1a1a1a]">Battle in progress</h3>
            <p className="text-sm text-zinc-500">vs {mp.opponent?.name}</p>
          </>
        ) : (
          <>
            <WifiOff className="w-12 h-12 mx-auto text-red-500" />
            <h3 className="text-lg font-black uppercase tracking-wider text-[#1a1a1a]">Disconnected</h3>
            <button onClick={mp.joinQueue} className="mag-btn bg-[#FFCC00] text-[#1a1a1a] text-sm font-black uppercase px-6 py-3 border-2 border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all">
              <RotateCcw className="w-4 h-4 inline mr-1" /> Find New Match
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function RotateCcw(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  )
}
