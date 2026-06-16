"use client"

// ============================================================
// Trading Tazos Game — Stats Page
// User ID Card + Global Stats + Battle History + Leaderboard
// ============================================================

import { Suspense, useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import StatsPanel from "@/components/game/stats-panel"
import BattleHistory from "@/components/game/battle-history"
import UserIdCard from "@/components/game/user-id-card"
import { BarChart3, Trophy, Swords, Disc3, TrendingUp, Crown, Medal } from "lucide-react"
import { StatsPanelSkeleton, BattleHistorySkeleton } from "@/components/ui/loading-skeletons"
import { TOTAL_PLANNED } from "@/lib/franchise-config"

interface LeaderboardUser {
  id: string
  name: string
  displayName: string | null
  avatarUrl: string | null
  level: number
  xp: number
  totalBattles: number
  totalWins: number
  totalTazosOwned: number
}

function StatsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto w-full py-4 sm:py-6 space-y-4 px-4">
      <div className="h-14 rounded bg-[#1a1a1a]/[0.04] animate-pulse" />
      <StatsPanelSkeleton />
      <BattleHistorySkeleton rows={4} />
    </div>
  )
}

function StatsContent() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [userData, setUserData] = useState<any>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [settingsRes, statsRes] = await Promise.all([
        fetch("/api/user/settings").then(r => r.ok ? r.json() : null),
        fetch("/api/stats").then(r => r.ok ? r.json() : null),
      ])
      if (settingsRes?.user) setUserData(settingsRes.user)
      if (statsRes?.leaderboard) setLeaderboard(statsRes.leaderboard)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const refreshKey = Number(searchParams.get("refresh") || 0)

  return (
    <div className="max-w-7xl mx-auto w-full py-4 sm:py-6 space-y-4 px-4">
      {/* Magazine Banner */}
      <div
        className="px-4 py-3 flex flex-wrap items-center gap-3 relative overflow-hidden"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(255,255,255,0.025) 6px, rgba(255,255,255,0.025) 12px), linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 100%)`,
          border: "3px solid #1a1a1a",
          boxShadow: "4px 4px 0px #FFCC00",
        }}
      >
        <div className="flex items-center gap-1.5">
          <BarChart3 className="w-5 h-5 text-[#FFCC00]" />
          <h1 className="text-sm sm:text-lg font-black text-white uppercase tracking-tight">STATS & RANKINGS</h1>
        </div>
        <div className="w-px h-5 bg-white/15" />
        <span className="text-xs font-black text-[#3B4CCA] tracking-tight">{TOTAL_PLANNED} SEASON 1 TAZOS</span>
      </div>

      {/* User ID Card */}
      {userData && (
        <UserIdCard user={userData} variant="full" />
      )}

      {/* Two-column: Global Stats + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Global Stats */}
        <div className="lg:col-span-3">
          <StatsPanel refreshKey={refreshKey} />
        </div>

        {/* Leaderboard */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border-3 border-[#1a1a1a] bg-white overflow-hidden"
            style={{ boxShadow: "4px 4px 0px #1a1a1a" }}>
            <div className="px-4 py-3 bg-gradient-to-r from-[#FFCC00] to-[#FFD700] border-b-2 border-[#1a1a1a]">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#1a1a1a]" />
                <h2 className="text-sm font-black text-[#1a1a1a] uppercase tracking-tight">Top Players</h2>
              </div>
            </div>
            <div className="divide-y-2 divide-[#1a1a1a]/5">
              {leaderboard.length === 0 && !loading && (
                <div className="p-6 text-center">
                  <p className="text-sm font-bold text-[#1a1a1a]/30">No players yet</p>
                </div>
              )}
              {leaderboard.map((entry, i) => (
                <div key={entry.id} className={`flex items-center gap-3 px-4 py-3 ${user?.id === entry.id ? "bg-[#FFCC00]/5" : ""}`}>
                  {/* Rank */}
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: i === 0 ? "#FFCC00" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "#1a1a1a/0.05",
                      border: i < 3 ? "2px solid #1a1a1a" : "1px solid #1a1a1a/0.1",
                    }}>
                    {i < 3 ? (
                      <Medal className="w-3.5 h-3.5 text-[#1a1a1a]" />
                    ) : (
                      <span className="text-[10px] font-black text-[#1a1a1a]/40">{i + 1}</span>
                    )}
                  </div>
                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-[#1a1a1a] truncate">
                      {entry.displayName || entry.name}
                      {user?.id === entry.id && <span className="text-[10px] text-[#E3350D] ml-1 font-bold">(you)</span>}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold text-[#FFCC00] bg-[#FFCC00]/10 px-1.5 py-0.5 rounded-full">Lv.{entry.level}</span>
                      <span className="text-[10px] font-semibold text-[#1a1a1a]/25">{entry.totalTazosOwned} tazos</span>
                    </div>
                  </div>
                  {/* Stats */}
                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-[#1a1a1a]">{entry.totalWins}W</div>
                    <div className="text-[9px] font-bold text-[#1a1a1a]/25">{entry.totalBattles} battles</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Battle History */}
      <BattleHistory />
    </div>
  )
}

export default function StatsPage() {
  return (
    <Suspense fallback={<StatsSkeleton />}>
      <StatsContent />
    </Suspense>
  )
}
