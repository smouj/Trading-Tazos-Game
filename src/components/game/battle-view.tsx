'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BattleSelectCard } from './battle-select-card'
import { BattleCanvas } from './battle-canvas'
import type { Tazo, BattleResult, BattleEvent, BattleTazo } from '@/lib/game/types'
import { RARITY_CONFIG } from '@/lib/game/types'
import {
  Swords,
  Zap,
  Shield,
  RotateCcw,
  Trophy,
  ArrowLeft,
  Play,
  Pause,
  FastForward,
  Shuffle,
  Crown,
  Target,
  Flame,
  CircleDot,
  Star,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────
type BattlePhase = 'select' | 'battle' | 'result'
type Difficulty = 'easy' | 'medium' | 'hard'

interface BattleViewProps {
  onBackToAlbum?: () => void
}

// ─── Constants ───────────────────────────────────────────────────────
const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; bg: string; border: string; shadow: string; text: string; desc: string }> = {
  easy: { label: 'EASY', bg: 'bg-green-400', border: 'border-black border-3', shadow: 'shadow-[3px_3px_0_0_#000]', text: 'text-black', desc: 'Weaker opponents' },
  medium: { label: 'MEDIUM', bg: 'bg-yellow-400', border: 'border-black border-3', shadow: 'shadow-[3px_3px_0_0_#000]', text: 'text-black', desc: 'Balanced match' },
  hard: { label: 'HARD', bg: 'bg-red-500', border: 'border-black border-3', shadow: 'shadow-[3px_3px_0_0_#000]', text: 'text-white', desc: 'Strong opponents' },
}

// ─── Component ───────────────────────────────────────────────────────
export function BattleView({ onBackToAlbum }: BattleViewProps) {
  // Phase
  const [phase, setPhase] = useState<BattlePhase>('select')

  // Select phase
  const [ownedTazos, setOwnedTazos] = useState<Tazo[]>([])
  const [allTazos, setAllTazos] = useState<Tazo[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [loadingTazos, setLoadingTazos] = useState(true)

  // Battle phase
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [currentEventIndex, setCurrentEventIndex] = useState(0)
  const [battleLog, setBattleLog] = useState<string[]>([])
  const [battleComplete, setBattleComplete] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const logEndRef = useRef<HTMLDivElement>(null)

  // ── Fetch tazos ──
  useEffect(() => {
    async function fetchTazos() {
      try {
        const [ownedRes, allRes] = await Promise.all([
          fetch('/api/tazos?owned=true'),
          fetch('/api/tazos'),
        ])
        const ownedData = await ownedRes.json()
        const allData = await allRes.json()
        setOwnedTazos(ownedData.tazos || [])
        setAllTazos(allData.tazos || [])
      } catch (err) {
        console.error('Failed to fetch tazos:', err)
      } finally {
        setLoadingTazos(false)
      }
    }
    fetchTazos()
  }, [])

  // ── Selection handlers ──
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id)
      }
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }, [])

  const randomTeam = useCallback(() => {
    const shuffled = [...ownedTazos].sort(() => Math.random() - 0.5)
    setSelectedIds(shuffled.slice(0, 3).map(t => t.id))
  }, [ownedTazos])

  // ── Generate opponent team ──
  const generateOpponent = useCallback((): string[] => {
    const unowned = allTazos.filter(t => !t.isOwned)
    const candidates = unowned.length >= 3 ? unowned : allTazos.filter(t => !selectedIds.includes(t.id))

    const sorted = [...candidates].sort((a, b) => {
      const powerA = a.attack + a.defense + a.spin + a.aura
      const powerB = b.attack + b.defense + b.spin + b.aura
      return powerA - powerB
    })

    let pool: Tazo[]
    switch (difficulty) {
      case 'easy': {
        const cutoff = Math.max(3, Math.ceil(sorted.length * 0.4))
        pool = sorted.slice(0, cutoff)
        break
      }
      case 'hard': {
        const cutoff = Math.max(3, Math.ceil(sorted.length * 0.4))
        pool = sorted.slice(-cutoff)
        break
      }
      default: {
        const start = Math.floor(sorted.length * 0.2)
        const end = Math.max(start + 3, Math.ceil(sorted.length * 0.8))
        pool = sorted.slice(start, end)
        break
      }
    }

    const shuffled = pool.sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 3).map(t => t.id)
  }, [allTazos, difficulty, selectedIds])

  // ── Start battle ──
  const startBattle = useCallback(async () => {
    if (selectedIds.length !== 3) return
    setIsSubmitting(true)

    const opponentIds = generateOpponent()

    try {
      const res = await fetch('/api/battle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerTazoIds: selectedIds, opponentTazoIds: opponentIds }),
      })
      const data = await res.json()

      const mappedPlayerTazos: BattleTazo[] = (data.playerTazos || []).map(mapBattleTazo)
      const mappedOpponentTazos: BattleTazo[] = (data.opponentTazos || []).map(mapBattleTazo)
      const nameToId = new Map<string, string>()
      for (const t of [...mappedPlayerTazos, ...mappedOpponentTazos]) {
        nameToId.set(t.name, t.id)
      }

      const result: BattleResult = {
        winner: data.winner,
        victoryType: data.victoryType,
        rounds: data.rounds,
        battleLog: (data.battleLog || []).map((e: Record<string, unknown>) => {
          const desc = e.description as string
          const actor = e.actor as 'player' | 'opponent' | undefined
          const mappedType = mapEventType(e.type as string) as BattleEvent['type']
          const { actorId, targetId } = extractIdsFromDescription(
            desc,
            actor,
            mappedType,
            nameToId,
            mappedPlayerTazos,
            mappedOpponentTazos
          )
          const damageMatch = desc.match(/for (\d+) damage/)
          return {
            round: e.round as number,
            type: mappedType,
            description: desc,
            actorId,
            targetId,
            damage: damageMatch ? parseInt(damageMatch[1]) : (e.damage as number | undefined),
          }
        }),
        playerTazos: mappedPlayerTazos,
        opponentTazos: mappedOpponentTazos,
      }

      setBattleResult(result)
      setPhase('battle')
      setIsPlaying(true)
      setCurrentEventIndex(0)
      setBattleLog([])
      setBattleComplete(false)
    } catch (err) {
      console.error('Battle failed:', err)
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedIds, generateOpponent])

  // ── Battle event handlers ──
  const handleEventComplete = useCallback(() => {
    if (!battleResult) return
    const event = battleResult.battleLog[currentEventIndex]
    if (event) {
      setBattleLog(prev => [...prev, `[R${event.round}] ${event.description}`])
    }
    setCurrentEventIndex(prev => prev + 1)
  }, [battleResult, currentEventIndex])

  const handleAllEventsComplete = useCallback(() => {
    setBattleComplete(true)
    setIsPlaying(false)
  }, [])

  // Auto-advance to result
  useEffect(() => {
    if (battleComplete && phase === 'battle') {
      const timer = setTimeout(() => setPhase('result'), 2000)
      return () => clearTimeout(timer)
    }
  }, [battleComplete, phase])

  // Scroll log to bottom
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [battleLog])

  // ── Speed control ──
  const cycleSpeed = useCallback(() => {
    setSpeed(prev => prev === 1 ? 2 : prev === 2 ? 4 : 1)
  }, [])

  // ── Battle again ──
  const battleAgain = useCallback(() => {
    setPhase('select')
    setBattleResult(null)
    setSelectedIds([])
    setCurrentEventIndex(0)
    setBattleLog([])
    setBattleComplete(false)
    setIsPlaying(false)
    setSpeed(1)
  }, [])

  // ── Helpers ──
  const selectedTazos = ownedTazos.filter(t => selectedIds.includes(t.id))

  // ─────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen mag-bg">
      {/* ── SELECT PHASE ── */}
      {phase === 'select' && (
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Magazine Header */}
          <div className="mb-6">
            {/* Yellow strip behind title */}
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400 -skew-y-1 rounded-lg" />
              <div className="relative px-6 py-4 text-center">
                <h1 className="mag-stroke-red text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none">
                  BATTLE ARENA!
                </h1>
              </div>
            </div>
            <p className="text-center text-lg italic font-bold text-black mt-2">
              Choose your team and <span className="text-red-600 uppercase font-black not-italic">FIGHT!</span>
            </p>
            {onBackToAlbum && (
              <div className="text-center mt-2">
                <button
                  onClick={onBackToAlbum}
                  className="mag-btn text-xs px-3 py-1 bg-white border-2 border-black shadow-[2px_2px_0_0_#000] hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                >
                  <ArrowLeft className="w-3 h-3 mr-1 inline" /> Back to Album
                </button>
              </div>
            )}
          </div>

          {/* Selected team - Yellow banner with thick black border */}
          <div className="mb-6 p-4 bg-yellow-300 border-4 border-black shadow-[4px_4px_0_0_#000] rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-5 h-5 text-black" />
              <span className="font-black text-sm text-black uppercase tracking-wide">Your Team ({selectedIds.length}/3)</span>
            </div>
            <div className="flex gap-3 min-h-[90px]">
              {selectedTazos.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-black/50 text-sm border-2 border-dashed border-black/30 rounded-lg bg-yellow-200/50">
                  Click tazos below to select your team!
                </div>
              )}
              {selectedTazos.map(tazo => (
                <div
                  key={tazo.id}
                  className="flex-1 p-3 bg-white border-3 border-black shadow-[2px_2px_0_0_#000] rounded-lg flex flex-col items-center gap-1"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white shadow-md border-2 border-black"
                    style={{ backgroundColor: tazo.franchise?.color || '#666' }}
                  >
                    {tazo.name.charAt(0)}
                  </div>
                  <span className="text-xs font-black truncate w-full text-center text-black">{tazo.name}</span>
                  <div className="flex gap-1 w-full justify-center">
                    <span className="text-[9px] text-red-600 font-bold flex items-center gap-0.5"><Target className="w-2.5 h-2.5" />{tazo.attack}</span>
                    <span className="text-[9px] text-blue-600 font-bold flex items-center gap-0.5"><Shield className="w-2.5 h-2.5" />{tazo.defense}</span>
                    <span className="text-[9px] text-green-600 font-bold flex items-center gap-0.5"><RotateCcw className="w-2.5 h-2.5" />{tazo.spin}</span>
                  </div>
                </div>
              ))}
              {/* Empty slots - dashed boxes with "+" */}
              {Array.from({ length: Math.max(0, 3 - selectedTazos.length) }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex-1 p-3 border-3 border-dashed border-black/40 rounded-lg flex items-center justify-center bg-white/30"
                >
                  <span className="text-black/30 text-4xl font-black">+</span>
                </div>
              ))}
            </div>
          </div>

          {/* Controls row */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* Difficulty - Magazine sticker style */}
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-600" />
              <span className="font-black text-sm text-black uppercase">Difficulty:</span>
              {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={cn(
                    'px-4 py-1.5 font-black text-xs uppercase tracking-wider border-3 transition-all',
                    DIFFICULTY_CONFIG[d].bg,
                    DIFFICULTY_CONFIG[d].text,
                    difficulty === d
                      ? 'border-black shadow-[3px_3px_0_0_#000] scale-105'
                      : 'border-black/30 shadow-[2px_2px_0_0_rgba(0,0,0,0.3)] opacity-60 hover:opacity-100'
                  )}
                >
                  {DIFFICULTY_CONFIG[d].label}
                </button>
              ))}
            </div>

            <div className="flex-1" />

            {/* Random + Start */}
            <button
              onClick={randomTeam}
              className="mag-btn px-4 py-2 bg-white border-3 border-black font-black text-sm shadow-[3px_3px_0_0_#000] hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all flex items-center gap-1"
            >
              <Shuffle className="w-4 h-4" /> Random Team
            </button>
            <button
              onClick={startBattle}
              disabled={selectedIds.length !== 3 || isSubmitting}
              className={cn(
                'px-6 py-2.5 font-black text-base uppercase tracking-wider border-3 border-black transition-all flex items-center gap-2',
                selectedIds.length === 3 && !isSubmitting
                  ? 'bg-red-500 text-white shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]'
                  : 'bg-gray-300 text-gray-500 shadow-[2px_2px_0_0_rgba(0,0,0,0.3)] cursor-not-allowed'
              )}
            >
              {isSubmitting ? (
                <span className="mag-spinner inline-block w-4 h-4 mr-1" />
              ) : (
                <Swords className="w-5 h-5" />
              )}
              Start Battle!
            </button>
          </div>

          {/* Tazo grid - White background with dots texture */}
          <div className="bg-white border-4 border-black shadow-[6px_6px_0_0_#000] rounded-lg p-4">
            <div className="mag-dots rounded-lg">
              {loadingTazos ? (
                <div className="flex items-center justify-center py-20">
                  <div className="mag-spinner w-10 h-10" />
                </div>
              ) : ownedTazos.length === 0 ? (
                <div className="text-center py-20 text-black/40">
                  <Star className="w-12 h-12 mx-auto mb-3" />
                  <p className="font-bold text-lg">No owned tazos yet!</p>
                  <p className="text-sm">Collect some first!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {ownedTazos.map(tazo => (
                    <BattleSelectCard
                      key={tazo.id}
                      tazo={tazo}
                      selected={selectedIds.includes(tazo.id)}
                      onSelect={toggleSelect}
                      disabled={selectedIds.length >= 3 && !selectedIds.includes(tazo.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── BATTLE PHASE ── */}
      {phase === 'battle' && battleResult && (
        <div className="h-screen flex flex-col bg-amber-50">
          {/* Magazine-style header bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-yellow-400 border-b-4 border-black">
            <div className="flex items-center gap-3">
              <div className="bg-red-500 border-2 border-black p-1 rounded">
                <Swords className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-black text-sm text-black">ROUND {currentEventIndex > 0 ? battleResult.battleLog[Math.min(currentEventIndex, battleResult.battleLog.length - 1)]?.round || 1 : 1}</span>
                <span className="text-black/50 text-xs font-bold ml-2">/ {battleResult.rounds}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <button
                onClick={() => setIsPlaying(prev => !prev)}
                className="mag-btn w-8 h-8 flex items-center justify-center bg-white border-2 border-black shadow-[2px_2px_0_0_#000] hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              {/* Speed */}
              <button
                onClick={cycleSpeed}
                className="mag-btn px-2 py-1 bg-white border-2 border-black shadow-[2px_2px_0_0_#000] hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-black text-xs"
              >
                <FastForward className="w-3 h-3 mr-1 inline" /> {speed}x
              </button>
              {/* Skip to result */}
              <button
                onClick={() => {
                  const remaining = battleResult.battleLog.slice(currentEventIndex)
                  setBattleLog(prev => [...prev, ...remaining.map(e => `[R${e.round}] ${e.description}`)])
                  setCurrentEventIndex(battleResult.battleLog.length)
                  setBattleComplete(true)
                  setIsPlaying(false)
                }}
                className="mag-btn px-2 py-1 bg-white border-2 border-black shadow-[2px_2px_0_0_#000] hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-black text-xs"
              >
                Skip <ChevronRight className="w-3 h-3 inline" />
              </button>
            </div>
          </div>

          {/* Main area: Canvas + Log */}
          <div className="flex-1 flex min-h-0">
            {/* Canvas */}
            <div className="flex-1 relative">
              <BattleCanvas
                playerTazos={battleResult.playerTazos}
                opponentTazos={battleResult.opponentTazos}
                events={battleResult.battleLog}
                isPlaying={isPlaying}
                speed={speed}
                currentEventIndex={currentEventIndex}
                onEventComplete={handleEventComplete}
                onAllEventsComplete={handleAllEventsComplete}
              />

              {/* Battle complete overlay */}
              {battleComplete && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 animate-in fade-in duration-500">
                  <div className="text-center">
                    <div className="text-5xl mb-2 animate-bounce">
                      {battleResult.winner === 'player' ? '🏆' : battleResult.winner === 'opponent' ? '💀' : '🤝'}
                    </div>
                    <h2 className={cn(
                      'text-5xl font-black',
                      battleResult.winner === 'player' ? 'mag-stroke text-yellow-400' : battleResult.winner === 'opponent' ? 'mag-stroke-red text-red-500' : 'mag-stroke-white text-white'
                    )}>
                      {battleResult.winner === 'player' ? 'VICTORY!' : battleResult.winner === 'opponent' ? 'DEFEAT!' : 'DRAW!'}
                    </h2>
                    {battleResult.victoryType && (
                      <div className="mt-3 inline-block bg-white border-3 border-black px-4 py-1 font-black text-sm shadow-[2px_2px_0_0_#000]">
                        {battleResult.victoryType.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Battle log - White background with black border, comic-style */}
            <div className="w-64 lg:w-80 bg-white border-l-4 border-black flex flex-col">
              <div className="px-3 py-2 border-b-3 border-black bg-yellow-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-black" />
                <span className="font-black text-sm text-black uppercase">Battle Log</span>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-1">
                  {battleLog.length === 0 && (
                    <p className="text-black/30 text-xs text-center py-4 font-bold italic">Waiting for battle...</p>
                  )}
                  {battleLog.map((msg, i) => (
                    <div
                      key={i}
                      className={cn(
                        'text-[11px] leading-snug py-1 px-2 border-2 font-bold transition-all',
                        msg.includes('knocked out') || msg.includes('Ring-out')
                          ? 'bg-red-200 border-red-500 text-red-800'
                          : msg.includes('super effective')
                          ? 'bg-yellow-200 border-yellow-500 text-yellow-800'
                          : msg.includes('evolution')
                          ? 'bg-green-200 border-green-500 text-green-800'
                          : msg.includes('transform')
                          ? 'bg-orange-200 border-orange-500 text-orange-800'
                          : msg.includes('slams') || msg.includes('damage')
                          ? 'bg-gray-100 border-gray-300 text-gray-800'
                          : 'bg-gray-50 border-gray-200 text-gray-600'
                      )}
                    >
                      {msg}
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>
              </ScrollArea>

              {/* Team status */}
              <div className="border-t-3 border-black p-3 bg-amber-50">
                <div className="text-[10px] font-black text-blue-700 mb-1 uppercase">PLAYER</div>
                {battleResult.playerTazos.map(t => (
                  <TazoStatus key={t.id} tazo={t} side="player" />
                ))}
                <div className="text-[10px] font-black text-red-700 mb-1 mt-2 uppercase">OPPONENT</div>
                {battleResult.opponentTazos.map(t => (
                  <TazoStatus key={t.id} tazo={t} side="opponent" />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RESULT PHASE ── */}
      {phase === 'result' && battleResult && (
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Winner banner with confetti-like background */}
          <div className={cn(
            'relative text-center mb-8 p-8 border-4 border-black shadow-[6px_6px_0_0_#000] overflow-hidden',
            battleResult.winner === 'player' ? 'bg-yellow-300' : battleResult.winner === 'opponent' ? 'bg-red-300' : 'bg-gray-200'
          )}>
            {/* Diagonal stripes background */}
            <div className={cn(
              'absolute inset-0 opacity-20',
              battleResult.winner === 'player' ? 'mag-stripes' : 'mag-dots'
            )} />
            <div className="relative">
              <div className="text-6xl mb-4 animate-bounce">
                {battleResult.winner === 'player' ? '🏆' : battleResult.winner === 'opponent' ? '💀' : '🤝'}
              </div>
              <h1 className={cn(
                'text-5xl sm:text-6xl md:text-7xl font-black leading-none',
                battleResult.winner === 'player' ? 'mag-stroke text-yellow-400' : battleResult.winner === 'opponent' ? 'mag-stroke-red text-red-500' : 'mag-stroke text-gray-500'
              )}>
                {battleResult.winner === 'player' ? 'VICTORY!' : battleResult.winner === 'opponent' ? 'DEFEAT!' : 'DRAW!'}
              </h1>
              {battleResult.victoryType && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  {battleResult.victoryType === 'knockout' && <Flame className="w-5 h-5 text-black" />}
                  {battleResult.victoryType === 'ring-out' && <CircleDot className="w-5 h-5 text-black" />}
                  {battleResult.victoryType === 'spin-out' && <RotateCcw className="w-5 h-5 text-black" />}
                  {battleResult.victoryType === 'combo' && <Sparkles className="w-5 h-5 text-black" />}
                  <span className="bg-white border-2 border-black px-3 py-1 font-black text-sm shadow-[2px_2px_0_0_#000]">
                    {battleResult.victoryType.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
              )}
              <p className="text-black/60 text-sm mt-3 font-bold">Battle lasted {battleResult.rounds} rounds</p>
            </div>
          </div>

          {/* Battle Summary - Magazine cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Player team */}
            <div className="mag-card-blue p-4 border-3 border-black shadow-[4px_4px_0_0_#000] rounded-lg bg-blue-100">
              <h3 className="font-black text-sm text-blue-800 mb-3 flex items-center gap-2 uppercase">
                <Crown className="w-4 h-4" /> Your Team
              </h3>
              {battleResult.playerTazos.map(t => (
                <ResultTazo key={t.id} tazo={t} isWinner={battleResult!.winner === 'player'} />
              ))}
            </div>

            {/* Opponent team */}
            <div className="mag-card-red p-4 border-3 border-black shadow-[4px_4px_0_0_#000] rounded-lg bg-red-100">
              <h3 className="font-black text-sm text-red-800 mb-3 flex items-center gap-2 uppercase">
                <Swords className="w-4 h-4" /> Opponent
              </h3>
              {battleResult.opponentTazos.map(t => (
                <ResultTazo key={t.id} tazo={t} isWinner={battleResult!.winner === 'opponent'} />
              ))}
            </div>
          </div>

          {/* Battle highlights - Yellow-bordered box */}
          <div className="mb-8 p-4 bg-white border-4 border-yellow-500 shadow-[4px_4px_0_0_#000] rounded-lg">
            <h3 className="font-black text-sm text-black mb-3 flex items-center gap-2 uppercase">
              <Zap className="w-4 h-4 text-yellow-600" /> Battle Highlights
            </h3>
            <ScrollArea className="max-h-48">
              <div className="space-y-1">
                {battleResult.battleLog
                  .filter(e =>
                    e.type === 'knockout' || e.type === 'ring_out' ||
                    e.type === 'type_advantage' || e.type === 'evolution' ||
                    e.type === 'transform' || e.type === 'skill' ||
                    e.type === 'combo'
                  )
                  .map((e, i) => (
                    <div key={i} className={cn(
                      'text-xs py-1.5 px-2 border-2 font-bold',
                      e.type === 'knockout' || e.type === 'ring_out'
                        ? 'bg-red-200 border-red-400 text-red-800'
                        : e.type === 'type_advantage'
                        ? 'bg-yellow-200 border-yellow-400 text-yellow-800'
                        : e.type === 'evolution'
                        ? 'bg-green-200 border-green-400 text-green-800'
                        : e.type === 'transform'
                        ? 'bg-orange-200 border-orange-400 text-orange-800'
                        : 'bg-gray-100 border-gray-300 text-gray-700'
                    )}>
                      [R{e.round}] {e.description}
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={battleAgain}
              className="mag-btn px-6 py-3 bg-red-500 border-3 border-black font-black text-base text-white uppercase tracking-wider shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all flex items-center gap-2"
            >
              <Swords className="w-5 h-5" /> Battle Again!
            </button>
            {onBackToAlbum && (
              <button
                onClick={onBackToAlbum}
                className="mag-btn px-4 py-3 bg-white border-3 border-black font-black text-sm uppercase tracking-wider shadow-[3px_3px_0_0_#000] hover:shadow-[1px_1px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Album
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────

function TazoStatus({ tazo, side }: { tazo: BattleTazo; side: 'player' | 'opponent' }) {
  const hpPct = Math.max(0, tazo.currentHp / tazo.maxHp) * 100
  const isDead = tazo.currentHp <= 0

  return (
    <div className={cn('flex items-center gap-2 py-1', isDead && 'opacity-40')}>
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-white shrink-0 border border-black"
        style={{ backgroundColor: tazo.franchise?.color || '#666' }}
      >
        {tazo.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-black truncate text-black">{tazo.name}</div>
        <div className="flex items-center gap-1">
          <div className="flex-1 h-2 bg-black/10 border border-black/20 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', hpPct > 50 ? 'bg-green-500' : hpPct > 25 ? 'bg-yellow-500' : 'bg-red-500')}
              style={{ width: `${hpPct}%` }}
            />
          </div>
          <span className="text-[8px] font-black text-black/50 w-8 text-right">{Math.max(0, tazo.currentHp)}</span>
        </div>
      </div>
    </div>
  )
}

function ResultTazo({ tazo, isWinner }: { tazo: BattleTazo; isWinner: boolean }) {
  const hpPct = Math.max(0, tazo.currentHp / tazo.maxHp) * 100
  const isDead = tazo.currentHp <= 0
  const rarity = RARITY_CONFIG[tazo.rarity as keyof typeof RARITY_CONFIG]

  return (
    <div className={cn(
      'flex items-center gap-3 p-2 border-2 mb-2 transition-all',
      isDead ? 'bg-black/5 border-black/20 opacity-50' : 'bg-white border-black shadow-[2px_2px_0_0_#000]',
      isWinner && !isDead && 'border-yellow-500 bg-yellow-50'
    )}>
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white shrink-0 border-2 border-black"
        style={{ backgroundColor: tazo.franchise?.color || '#666' }}
      >
        {tazo.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-black text-sm truncate text-black">{tazo.name}</span>
          {rarity && (
            <Badge variant="outline" className={cn('text-[8px] px-1 py-0 h-4 font-black border-2', rarity.color, rarity.bgColor, rarity.borderColor)}>
              {rarity.label}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-2.5 bg-black/10 border border-black/20 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full', hpPct > 50 ? 'bg-green-500' : hpPct > 25 ? 'bg-yellow-500' : 'bg-red-500')}
              style={{ width: `${hpPct}%` }}
            />
          </div>
          <span className="text-xs font-black text-black/60">{Math.max(0, tazo.currentHp)}/{tazo.maxHp}</span>
        </div>
        {isDead && <span className="text-[10px] text-red-600 font-black uppercase">KO!</span>}
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────

function mapEventType(type: string): string {
  const map: Record<string, string> = {
    attack: 'collision',
    defense: 'skill',
    ki_charge: 'skill',
    evolution_boost: 'evolution',
    ring_out_check: 'spin_decay',
  }
  return map[type] || type
}

function extractIdsFromDescription(
  desc: string,
  actor: 'player' | 'opponent' | undefined,
  _type: BattleEvent['type'],
  nameToId: Map<string, string>,
  playerTazos: BattleTazo[],
  opponentTazos: BattleTazo[]
): { actorId: string | undefined; targetId: string | undefined } {
  let actorId: string | undefined
  let targetId: string | undefined

  const allNames = [...playerTazos.map(t => t.name), ...opponentTazos.map(t => t.name)]
    .sort((a, b) => b.length - a.length)

  const foundNames: string[] = []
  for (const name of allNames) {
    if (desc.includes(name)) {
      foundNames.push(name)
    }
  }

  if (foundNames.length >= 1) {
    const firstName = foundNames[0]
    actorId = nameToId.get(firstName)
  }
  if (foundNames.length >= 2) {
    const secondName = foundNames[1]
    targetId = nameToId.get(secondName)
  }

  if (!actorId && actor) {
    const sideTazos = actor === 'player' ? playerTazos : opponentTazos
    const otherSideTazos = actor === 'player' ? opponentTazos : playerTazos
    actorId = sideTazos.find(t => t.currentHp > 0)?.id || sideTazos[0]?.id
    targetId = otherSideTazos.find(t => t.currentHp > 0)?.id || otherSideTazos[0]?.id
  }

  if (desc.includes('Ring-out') || desc.includes('knocked out')) {
    for (const name of foundNames) {
      const id = nameToId.get(name)
      if (id) {
        if (!targetId) targetId = id
      }
    }
  }

  return { actorId, targetId }
}

function mapBattleTazo(raw: Record<string, unknown>): BattleTazo {
  const franchise = raw.franchise as { name: string; slug: string; mechanic?: string | null } | undefined
  return {
    id: raw.id as string,
    name: raw.name as string,
    slug: '',
    franchiseId: '',
    collectionId: '',
    printedNumber: null,
    condition: 'good',
    physicalType: 'cardboard',
    combatType: (raw.combatType as string) || null,
    rarity: 'common',
    imageUrl: null,
    skill: null,
    skillDesc: null,
    evolutionFrom: null,
    evolutionTo: null,
    transformStage: null,
    transformOf: null,
    attack: (raw.attack as number) || 50,
    defense: (raw.defense as number) || 50,
    spin: (raw.spin as number) || 50,
    weight: (raw.weight as number) || 50,
    aura: (raw.aura as number) || 50,
    control: (raw.control as number) || 50,
    isOwned: false,
    battleWins: 0,
    battleLosses: 0,
    franchise: franchise ? { id: '', name: franchise.name, slug: franchise.slug, color: '', mechanic: franchise.mechanic } : undefined,
    collection: undefined,
    createdAt: '',
    updatedAt: '',
    currentHp: (raw.hp as number) || 0,
    maxHp: 100 + ((raw.defense as number) || 50),
    currentSpin: (raw.currentSpin as number) || 0,
    maxSpin: (raw.spin as number) || 50,
    kiCharge: (raw.ki as number) || undefined,
    isEvolved: false,
    isTransformed: false,
  }
}
