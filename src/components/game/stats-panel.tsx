'use client'

import { useState, useEffect } from 'react'
import { Tazo } from '@/lib/game/types'
import { Trophy, Swords, Shield, Wind, Weight, Target, Star, Package, CheckCircle, XCircle, TrendingUp, Activity, Crosshair, Waves, Zap } from 'lucide-react'

interface StatsData { totalTazos: number; ownedTazos: number; totalFranchises: number; totalCollections: number; byRarity: Record<string, number>; byCondition: Record<string, number>; byFranchise: Record<string, number> }

const FRANCHISE_COLORS: Record<string, string> = { Minimon: '#FFCB05', Cybermon: '#00A1E9', Dracobell: '#FF6B00' }
const RARITY_COLORS: Record<string, string> = { common: '#9CA3AF', uncommon: '#22C55E', rare: '#3B82F6', ultra: '#A855F7', legendary: '#F59E0B' }
const RARITY_LABELS: Record<string, string> = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', ultra: 'Ultra', legendary: 'Legendary' }

const STAT_ICONS = [
  { key: 'attack', label: 'Strongest Attack', icon: Swords, color: '#E3350D' },
  { key: 'defense', label: 'Best Defense', icon: Shield, color: '#3B4CCA' },
  { key: 'resistance', label: 'Best Resistance', icon: Activity, color: '#6366F1' },
  { key: 'weight', label: 'Heaviest', icon: Weight, color: '#FF6B00' },
  { key: 'stability', label: 'Best Stability', icon: Waves, color: '#14B8A6' },
  { key: 'spin', label: 'Top Spin', icon: Wind, color: '#78C850' },
  { key: 'control', label: 'Best Control', icon: Target, color: '#00A1E9' },
  { key: 'bounce', label: 'Best Bounce', icon: Zap, color: '#F97316' },
  { key: 'precision', label: 'Best Precision', icon: Crosshair, color: '#06B6D4' },
]

export default function StatsPanel({ refreshKey }: { refreshKey?: number }) {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [topTazos, setTopTazos] = useState<Record<string, Tazo>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [statsRes, tazosRes] = await Promise.all([fetch('/api/stats'), fetch('/api/tazos?sortBy=attack&sortOrder=desc')])
        const statsData = await statsRes.json()
        const tazosData = await tazosRes.json()
        setStats(statsData)
        const allTazos: Tazo[] = tazosData.tazos || []
        const tops: Record<string, Tazo> = {}
        for (const sc of STAT_ICONS) {
          const sorted = [...allTazos].sort((a, b) => (b as any)[sc.key] - (a as any)[sc.key])
          if (sorted.length > 0) tops[sc.key] = sorted[0]
        }
        setTopTazos(tops)
      } catch (err) { console.error('Failed to fetch stats:', err) } finally { setLoading(false) }
    }
    fetchData()
  }, [refreshKey])

  if (loading) return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="game-panel h-28 animate-pulse" />)}
      {Array.from({ length: 3 }).map((_, i) => <div key={i+4} className="game-panel h-48 animate-pulse" />)}
    </div>
  )

  if (!stats) return null

  const missingTazos = stats.totalTazos - stats.ownedTazos
  const completionPct = stats.totalTazos > 0 ? Math.round((stats.ownedTazos / stats.totalTazos) * 100) : 0
  const maxFranchise = Math.max(...Object.values(stats.byFranchise), 1)
  const maxRarity = Math.max(...Object.values(stats.byRarity), 1)

  return (
    <div className="space-y-4">

      {/* ═══ TOP STAT CARDS ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Package, label: "Total", value: stats.totalTazos, sub: "Tazos", color: "#FFCC00", bg: "rgba(255,204,0,0.06)" },
          { icon: CheckCircle, label: "Owned", value: stats.ownedTazos, sub: "Collected", color: "#22C55E", bg: "rgba(34,197,94,0.06)" },
          { icon: XCircle, label: "Missing", value: missingTazos, sub: "Gotta Find", color: "#E3350D", bg: "rgba(227,53,13,0.06)" },
          { icon: TrendingUp, label: "Progress", value: `${completionPct}%`, sub: `${stats.ownedTazos}/${stats.totalTazos}`, color: "#3B4CCA", bg: "rgba(59,76,202,0.06)" },
        ].map(({ icon: Icon, label, value, sub, color, bg }) => (
          <div key={label} className="game-panel p-4 flex flex-col items-center justify-center text-center" style={{ background: bg }}>
            <span className="text-[9px] font-semibold uppercase tracking-widest mb-1.5" style={{ color }}>{label}</span>
            <Icon className="w-5 h-5 mb-1 opacity-40" style={{ color }} />
            <p className="text-3xl font-bold" style={{ color }}>{value}</p>
            <p className="text-[10px] text-white/15 font-medium mt-1 uppercase">{sub}</p>
          </div>
        ))}
      </div>

      {/* ═══ COLLECTION PROGRESS ═══ */}
      <div className="game-panel p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs font-semibold text-white/25 uppercase tracking-wider mb-2">Collection Progress</p>
            <div className="h-5 game-stat-bar-bg overflow-hidden rounded-full">
              <div className="h-full game-stat-bar-fill rounded-full" style={{ width: `${completionPct}%` }} />
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#FFCC00]">{completionPct}%</p>
            <p className="text-xs text-white/15">{stats.ownedTazos}/{stats.totalTazos}</p>
          </div>
        </div>
      </div>

      {/* ═══ FRANCHISE + RARITY BARS ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Franchise distribution */}
        <div className="game-panel p-4">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em] mb-3">By Franchise</h3>
          <div className="space-y-2">
            {Object.entries(stats.byFranchise).map(([name, count]) => (
              <div key={name}>
                <div className="flex justify-between text-[10px] font-medium mb-0.5"><span className="text-white/25">{name}</span><span className="text-white/50">{count}</span></div>
                <div className="h-2 game-stat-bar-bg rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(count/maxFranchise)*100}%`, background: FRANCHISE_COLORS[name] || '#FFCC00' }} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* Rarity distribution */}
        <div className="game-panel p-4">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em] mb-3">By Rarity</h3>
          <div className="space-y-2">
            {Object.entries(stats.byRarity).map(([rarity, count]) => (
              <div key={rarity}>
                <div className="flex justify-between text-[10px] font-medium mb-0.5"><span className="text-white/25">{RARITY_LABELS[rarity] || rarity}</span><span className="text-white/50">{count}</span></div>
                <div className="h-2 game-stat-bar-bg rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(count/maxRarity)*100}%`, background: RARITY_COLORS[rarity] || '#9CA3AF' }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ BEST TAZOS Grid ═══ */}
      <div className="game-panel p-4">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em] mb-3 flex items-center gap-1.5"><Trophy className="w-4 h-4 text-[#FFCC00]" /> Top Tazos Per Stat</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {STAT_ICONS.map(({ key, label, icon: Icon, color }) => {
            const tazo = topTazos[key]
            if (!tazo) return <div key={key} className="game-empty p-3 text-center"><span className="text-[10px] text-white/10">—</span></div>
            return (
              <div key={key} className="game-card p-2 rounded-lg text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Icon className="w-3 h-3" style={{ color }} />
                  <span className="text-[8px] font-semibold text-white/25 uppercase">{label}</span>
                </div>
                <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center overflow-hidden border border-white/[0.06] mb-1" style={{ background: `${color}10` }}>
                  {tazo.imageUrl ? <img src={tazo.imageUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-lg font-bold text-white/10">?</span>}
                </div>
                <p className="text-[10px] font-semibold text-white/60 truncate">{tazo.name}</p>
                <p className="text-lg font-bold" style={{ color }}>{(tazo as any)[key]}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ═══ TAZO STATS TABLE ═══ */}
      <div className="game-panel p-4">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em] mb-3 flex items-center gap-1.5"><Star className="w-4 h-4 text-[#FFCC00]" /> Stat Champions</h3>
        <div className="divide-y divide-white/[0.04]">
          {STAT_ICONS.map(({ key, label, icon: Icon, color }) => {
            const tazo = topTazos[key]
            if (!tazo) return null
            return (
              <div key={key} className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${color}15` }}><Icon className="w-4 h-4" style={{ color }} /></div>
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-white/60 truncate">{tazo.name}</p><p className="text-[10px] text-white/15">{tazo.franchise}</p></div>
                <div className="text-right"><p className="text-lg font-bold" style={{ color }}>{(tazo as any)[key]}</p><p className="text-[9px] text-white/25">{label}</p></div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
