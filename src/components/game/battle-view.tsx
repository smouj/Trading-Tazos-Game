// ============================================================
// Trading Tazos Game — Battle View
// Complete battle experience: lobby → intro → aim → launch → resolve.
// Proper data flow with real tazo images, responsive mobile-first UX.
// ============================================================
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import {
  createMatch, simulateThrow, generateAIMove, checkMatchEnd,
  DEFAULT_ARENA_3D,
} from "@/lib/battle/game-loop"
import type {
  GameState, PlayMode, AIDifficulty, SpinType,
  TazoCard, DiscPhysics, MatchConfig, MatchResult, ThrowParams,
} from "@/lib/battle/game-loop"
import GameLobby from "./battle/game-lobby"
import BattleArena3D from "./battle/battle-arena-3d"
import BattleHUD from "./battle/battle-hud"
import LaunchSystem from "./battle/launch-system"
import BattleResultPanel from "./battle/battle-result-panel"
import { Disc3, RotateCcw } from "lucide-react"

const BACK_ARTS: Record<string, string> = {
  minimon: "/tazos-artgen/backs/minimon-back.png",
  cybermon: "/tazos-artgen/backs/cybermon-back.png",
  dracobell: "/tazos-artgen/backs/dracobell-back.png",
}

// ─── Demo tazos for guest users — with correct imageUrls ───
const DEMO_TAZOS: TazoCard[] = [
  { id: "demo-1", name: "Lumipuff", slug: "lumipuff", franchise: "minimon", imageUrl: "/tazos-artgen/minimon/minimon-001.png", attack: 45, defense: 40, resistance: 35, weight: 35, stability: 40, spin: 55, control: 50, bounce: 45, precision: 55 },
  { id: "demo-2", name: "Leafroll", slug: "leafroll", franchise: "minimon", imageUrl: "/tazos-artgen/minimon/minimon-004.png", attack: 55, defense: 60, resistance: 50, weight: 35, stability: 55, spin: 40, control: 50, bounce: 50, precision: 48 },
  { id: "demo-3", name: "Voltcrab-X", slug: "voltcrab-x", franchise: "cybermon", imageUrl: "/tazos-artgen/cybermon/cybermon-001.png", attack: 70, defense: 45, resistance: 50, weight: 55, stability: 50, spin: 60, control: 40, bounce: 35, precision: 45 },
  { id: "demo-4", name: "Datadrake", slug: "datadrake", franchise: "cybermon", imageUrl: "/tazos-artgen/cybermon/cybermon-002.png", attack: 60, defense: 55, resistance: 50, weight: 45, stability: 55, spin: 50, control: 60, bounce: 45, precision: 55 },
  { id: "demo-5", name: "Bytefang", slug: "bytefang", franchise: "cybermon", imageUrl: "/tazos-artgen/cybermon/cybermon-003.png", attack: 65, defense: 48, resistance: 42, weight: 48, stability: 45, spin: 62, control: 44, bounce: 40, precision: 50 },
  { id: "demo-6", name: "Rai Kendo", slug: "rai-kendo", franchise: "dracobell", imageUrl: "/tazos-artgen/dracobell/dracobell-001.png", attack: 75, defense: 45, resistance: 42, weight: 52, stability: 48, spin: 55, control: 47, bounce: 42, precision: 48 },
  { id: "demo-7", name: "Tenzan Blaze", slug: "tenzan-blaze", franchise: "dracobell", imageUrl: "/tazos-artgen/dracobell/dracobell-002.png", attack: 80, defense: 55, resistance: 52, weight: 58, stability: 55, spin: 65, control: 60, bounce: 48, precision: 55 },
]

// ─── Create physics discs from deck ───
function makeDiscs(deck: TazoCard[], owner: "player" | "opponent", startZ: number): DiscPhysics[] {
  return deck.map((t, i) => ({
    id: t.id,
    tazoName: t.name,
    franchise: t.franchise,
    imageUrl: t.imageUrl,
    backImageUrl: BACK_ARTS[t.franchise] || null,
    position: [(i - 2) * 0.9, 0.06, startZ] as [number, number, number],
    velocity: [0, 0, 0] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
    angularVelocity: [0, 0, 0] as [number, number, number],
    facing: "front" as const,
    state: "stopped" as const,
    owner,
  }))
}

// ─── Fetch user tazos from API ───
async function fetchUserTazos(token: string): Promise<TazoCard[]> {
  try {
    const res = await fetch("/api/tazos?limit=100", {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return []
    const data = await res.json()
    const tazos = (data.tazos || []).map((t: Record<string, unknown>) => ({
      id: t.id as string,
      name: (t.name || "?") as string,
      slug: (t.slug || (t.name as string || "?").toLowerCase().replace(/\s/g, "-")) as string,
      franchise: (
        (t.franchiseSlug as string) ||
        ((t.franchise as { slug?: string })?.slug) ||
        "minimon"
      ) as TazoCard["franchise"],
      imageUrl: (t.imageUrl as string) || null,
      attack: (t.attack as number) || 50,
      defense: (t.defense as number) || 50,
      resistance: ((t as any).resistance as number) || 50,
      weight: ((t as any).weight as number) || 50,
      stability: ((t as any).stability as number) || 50,
      spin: (t.spin as number) || 50,
      control: (t.control as number) || 50,
      bounce: ((t as any).bounce as number) || 50,
      precision: ((t as any).precision as number) || 50,
    }))
    return tazos
  } catch { return [] }
}

export default function BattleView() {
  const { user, token } = useAuth()
  const [gamePhase, setGamePhase] = useState<GameState>("lobby")
  const [loading, setLoading] = useState(true)
  const [playerTazos, setPlayerTazos] = useState<TazoCard[]>([])
  const [playerDeck, setPlayerDeck] = useState<TazoCard[]>([])
  const [matchConfig, setMatchConfig] = useState<MatchConfig | null>(null)
  const [playerHP, setPlayerHP] = useState(100)
  const [opponentHP, setOpponentHP] = useState(100)
  const [playerDiscs, setPlayerDiscs] = useState<DiscPhysics[]>([])
  const [opponentDiscs, setOpponentDiscs] = useState<DiscPhysics[]>([])
  const [playerCaptured, setPlayerCaptured] = useState(0)
  const [opponentCaptured, setOpponentCaptured] = useState(0)
  const [round, setRound] = useState(1)
  const [turnNumber, setTurnNumber] = useState(0)
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null)
  const [throwingTazo, setThrowingTazo] = useState<TazoCard | null>(null)
  const [launchPhase, setLaunchPhase] = useState<"aim" | "power" | "spin">("aim")
  const [aimParams, setAimParams] = useState({ x: 0, y: 0, accuracy: 0.8 })
  const turnDone = useRef(false)

  // ─── Load tazos ───
  useEffect(() => {
    async function load() {
      let myTazos: TazoCard[] = []
      if (user && token) {
        myTazos = await fetchUserTazos(token)
      }
      setPlayerTazos(myTazos.length >= 5 ? myTazos : DEMO_TAZOS)
      setLoading(false)
    }
    load()
  }, [user, token])

  // ─── Execute opponent turn ───
  const executeOpponentTurn = useCallback((cfg: MatchConfig, pDiscs: DiscPhysics[], oDiscs: DiscPhysics[],
    pCaptured: number, oCaptured: number, pHP: number, oHP: number, damage: number, round: number, turn: number
  ) => {
    const oppTazo = cfg.opponentDeck[Math.floor(Math.random() * cfg.opponentDeck.length)]
    const aiMove = generateAIMove(oppTazo, pDiscs, oDiscs, cfg.arena, cfg.aiDifficulty)

    // Create opponent disc
    const oppDisc: DiscPhysics = {
      id: oppTazo.id,
      tazoName: oppTazo.name,
      franchise: oppTazo.franchise,
      imageUrl: oppTazo.imageUrl,
      backImageUrl: BACK_ARTS[oppTazo.franchise] || null,
      position: [(Math.random() - 0.5) * 2, 0.06, cfg.arena.radius * 0.5],
      velocity: [aiMove.aimX * 5, 0, aiMove.aimY * 5],
      rotation: [0, 0, 0],
      angularVelocity: [0, 0, 0],
      facing: "front",
      state: "sliding",
      owner: "opponent" as const,
    }

    const allDiscs = [...pDiscs, ...oDiscs, oppDisc]
    // Simple simulation: move disc toward center
    const simSteps = 40
    const dt = 0.016
    let pos = [...oppDisc.position] as [number, number, number]
    let vel = [...oppDisc.velocity] as [number, number, number]
    for (let s = 0; s < simSteps; s++) {
      vel[0] *= cfg.arena.surfaceFriction
      vel[2] *= cfg.arena.surfaceFriction
      pos[0] += vel[0] * dt; pos[2] += vel[2] * dt
      const dist = Math.sqrt(pos[0]*pos[0] + pos[2]*pos[2])
      if (dist > cfg.arena.radius) {
        pos[0] *= 0.95; pos[2] *= 0.95
      }
    }
    oppDisc.position = pos; oppDisc.state = "stopped"

    // Check collisions
    let hits = 0; let flips = 0
    const newPDiscs = pDiscs.map(d => {
      if (d.state === "captured") return d
      const dx = pos[0] - d.position[0]; const dz = pos[2] - d.position[2]
      const dist = Math.sqrt(dx*dx + dz*dz)
      if (dist < 0.7 && dist > 0.01) {
        hits++
        const nx = dx/dist; const nz = dz/dist
        d.position[0] -= nx * 0.15; d.position[2] -= nz * 0.15
        d.state = "sliding"
        if (aiMove.power > 0.5 && Math.random() < aiMove.power * 0.4) {
          d.facing = d.facing === "front" ? "back" : "front"
          d.state = "flipped"
          flips++
        }
        // Check ring-out
        const edist = Math.sqrt(d.position[0]**2 + d.position[2]**2)
        if (edist > cfg.arena.ringOutThreshold) {
          d.state = "captured"
        }
      }
      return d
    })

    const newCapt = newPDiscs.filter(d => d.state === "flipped" || (d.state === "captured" && d.owner === "opponent")).length
    const dmg = Math.round(aiMove.power * 20) + flips * 10 + hits * 5
    const newPHP = Math.max(0, pHP - dmg)

    setPlayerDiscs([...newPDiscs])
    setOpponentDiscs([...oDiscs, oppDisc])
    setPlayerHP(newPHP)
    setPlayerCaptured(newCapt)
    setTurnNumber(prev => prev + 1)

    // Check match end
    const end = checkMatchEnd(
      { id: "player", name: "You", deck: playerDeck, hp: newPHP, maxHp: 100, tazosRemaining: playerDeck.length - newCapt, captured: newCapt, currentTazo: null, isAI: false },
      { id: "opponent", name: "AI", deck: cfg.opponentDeck, hp: oHP, maxHp: 100, tazosRemaining: cfg.opponentDeck.length - oCaptured, captured: oCaptured, currentTazo: null, isAI: true },
      newPDiscs, [...oDiscs, oppDisc]
    )

    if (end) {
      setMatchResult({ ...end, totalTurns: turn + 1 })
      setGamePhase("match_end")
    } else {
      setGamePhase("round_end")
      setTimeout(() => {
        setRound(prev => prev + 1)
        const nextTazo = playerDeck[(turn + 1) % playerDeck.length]
        setThrowingTazo(nextTazo)
        setLaunchPhase("aim")
        setGamePhase("player_aim")
      }, 1800)
    }
  }, [playerDeck])

  // ─── Start match ───
  const handleStartMatch = useCallback((mode: PlayMode, difficulty: AIDifficulty, deck: TazoCard[]) => {
    setPlayerDeck(deck)
    const oppDeck = [...DEMO_TAZOS].sort(() => Math.random() - 0.5).slice(0, 5)

    const config: MatchConfig = { mode, aiDifficulty: difficulty, arena: DEFAULT_ARENA_3D, rounds: 0, playerDeck: deck, opponentDeck: oppDeck }
    setMatchConfig(config)
    setPlayerHP(100); setOpponentHP(100); setPlayerCaptured(0); setOpponentCaptured(0)
    setRound(1); setTurnNumber(0); setMatchResult(null); turnDone.current = false

    setPlayerDiscs(makeDiscs(deck, "player", 3.5))
    setOpponentDiscs(makeDiscs(oppDeck, "opponent", -3.5))
    setThrowingTazo(deck[0])
    setLaunchPhase("aim")

    setGamePhase("intro")
    setTimeout(() => { setGamePhase("round_start") }, 2200)
    setTimeout(() => {
      if (!turnDone.current) setGamePhase("player_aim")
    }, 3200)
  }, [])

  // ─── Aim locked ───
  const handleAimLock = useCallback((x: number, y: number, accuracy: number) => {
    setAimParams({ x, y, accuracy })
    setLaunchPhase("power")
    setGamePhase("player_power")
  }, [])

  // ─── Power locked → throw ───
  const handlePowerLock = useCallback((power: number, accuracy: number) => {
    if (!throwingTazo || !matchConfig || turnDone.current) return
    turnDone.current = true

    const params: ThrowParams = {
      tazoId: throwingTazo.id,
      aimX: aimParams.x, aimY: aimParams.y,
      power, powerAccuracy: accuracy,
      spinType: "none",
      accuracyPenalty: (1 - aimParams.accuracy) * 0.4 + (1 - accuracy) * 0.3,
      timestamp: Date.now(),
    }

    setGamePhase("throwing")
    setTimeout(() => {
      if (!matchConfig) return
      setGamePhase("physics")

      const result = simulateThrow(throwingTazo, params, opponentDiscs, matchConfig.arena)
      setOpponentDiscs([...result.discs])
      const damage = result.result.hpDealt
      setOpponentHP(prev => Math.max(0, prev - damage))
      setOpponentCaptured(prev => prev + result.result.discsCaptured.length)

      setTimeout(() => {
        setGamePhase("resolve")
        const end = checkMatchEnd(
          { id: "player", name: "You", deck: playerDeck, hp: playerHP, maxHp: 100, tazosRemaining: playerDeck.length - playerCaptured, captured: playerCaptured, currentTazo: null, isAI: false },
          { id: "opponent", name: "AI", deck: matchConfig.opponentDeck, hp: Math.max(0, opponentHP - damage), maxHp: 100, tazosRemaining: matchConfig.opponentDeck.length - opponentCaptured, captured: opponentCaptured, currentTazo: null, isAI: true },
          playerDiscs, result.discs
        )

        if (end) {
          setMatchResult({ ...end, totalTurns: turnNumber + 1 })
          setGamePhase("match_end")
          return
        }

        setTimeout(() => {
          setGamePhase("opponent_turn")
          setTimeout(() => {
            executeOpponentTurn(
              matchConfig, playerDiscs, result.discs,
              playerCaptured, opponentCaptured,
              playerHP, opponentHP - damage,
              damage, round, turnNumber + 1
            )
            turnDone.current = false
          }, 1200)
        }, 1000)
      }, 600)
    }, 500)
  }, [throwingTazo, matchConfig, aimParams, playerDeck, playerHP, opponentHP, playerDiscs, opponentDiscs, playerCaptured, opponentCaptured, turnNumber, executeOpponentTurn])

  // ─── Rematch / Back ───
  const handleRematch = useCallback(() => {
    if (matchConfig) handleStartMatch(matchConfig.mode, matchConfig.aiDifficulty, playerDeck)
  }, [matchConfig, playerDeck, handleStartMatch])

  const handleBack = useCallback(() => {
    setGamePhase("lobby"); setMatchConfig(null); setMatchResult(null); setThrowingTazo(null)
  }, [])

  // ─── Loading ───
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Disc3 className="w-10 h-10 animate-spin text-[#FFCC00]" />
      </div>
    )
  }

  // ─── Lobby ───
  if (gamePhase === "lobby") {
    return <GameLobby playerTazos={playerTazos} onStart={handleStartMatch} isLoading={false} isAuthenticated={!!user} />
  }

  // ─── Match end ───
  if (gamePhase === "match_end" && matchResult) {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <BattleResultPanel
          result={{
            winner: matchResult.winner,
            victoryType: matchResult.victoryType,
            playerScore: matchResult.playerCaptures,
            opponentScore: matchResult.opponentCaptures,
            totalTurns: matchResult.totalTurns,
            playerCaptures: matchResult.playerCaptures,
            opponentCaptures: matchResult.opponentCaptures,
            summary: matchResult.summary,
          }}
          playerName="You"
          opponentName={matchConfig?.mode === "practice" ? `AI (${matchConfig?.aiDifficulty})` : "Opponent"}
          onRematch={handleRematch}
        />
        <div className="text-center">
          <button onClick={handleBack} className="px-6 py-3 font-black text-sm uppercase bg-white border-3 border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-[#1a1a1a]">
            <RotateCcw className="w-4 h-4 inline mr-2" />Back to Lobby
          </button>
        </div>
      </div>
    )
  }

  // ─── Active battle ───
  const isCompact = typeof window !== "undefined" && window.innerWidth < 640
  const arenaConfig = matchConfig?.arena || DEFAULT_ARENA_3D

  return (
    <div className="w-full h-full flex flex-col space-y-2 animate-in fade-in duration-200">
      {/* HUD */}
      <div className="flex-shrink-0 px-0.5">
        <BattleHUD
          playerName="You"
          opponentName={matchConfig?.mode === "practice" ? `AI (${matchConfig?.aiDifficulty})` : "Opponent"}
          playerHP={playerHP} playerMaxHP={100}
          opponentHP={opponentHP} opponentMaxHP={100}
          playerTazos={playerDeck.length}
          opponentTazos={matchConfig?.opponentDeck.length || 5}
          playerCaptured={playerCaptured}
          opponentCaptured={opponentCaptured}
          round={round}
          phase={gamePhase}
          turnPlayer={gamePhase.startsWith("player_") ? "player" : "opponent"}
          compact={isCompact}
        />
      </div>

      {/* Arena 3D */}
      <div className="flex-1 min-h-0">
        <BattleArena3D
          config={arenaConfig}
          playerDiscs={playerDiscs}
          opponentDiscs={opponentDiscs}
          gamePhase={gamePhase}
          aimDirection={
            gamePhase === "player_aim" && aimParams
              ? [aimParams.x, 0, -aimParams.y]
              : undefined
          }
          aimPower={launchPhase === "power" ? 0.5 : undefined}
          compact={isCompact}
        />
      </div>

      {/* Controls */}
      <div className="flex-shrink-0">
        {(gamePhase === "player_aim" || gamePhase === "player_power") ? (
          <LaunchSystem
            phase={launchPhase}
            onAimLock={handleAimLock}
            onPowerLock={handlePowerLock}
            onSpinLock={() => handlePowerLock(0.6, 0.8)}
            throwingTazoName={throwingTazo?.name || "?"}
            throwingTazoFranchise={throwingTazo?.franchise || "minimon"}
          />
        ) : gamePhase === "throwing" ? (
          <div className="p-4 bg-white border-3 border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] text-center">
            <Disc3 className="w-8 h-8 mx-auto animate-spin text-[#FFCC00]" />
            <p className="font-black text-sm text-[#1a1a1a]/40 mt-2 uppercase">Throwing...</p>
          </div>
        ) : gamePhase === "physics" ? (
          <div className="p-4 bg-white border-3 border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] text-center">
            <Disc3 className="w-8 h-8 mx-auto animate-spin text-[#F59E0B]" />
            <p className="font-black text-sm text-[#1a1a1a]/40 mt-2 uppercase">Resolving...</p>
          </div>
        ) : gamePhase === "opponent_turn" ? (
          <div className="p-4 bg-zinc-50 border-3 border-[#E3350D] shadow-[4px_4px_0px_#1a1a1a] text-center">
            <Disc3 className="w-8 h-8 mx-auto animate-spin text-[#E3350D]" />
            <p className="font-black text-xs text-[#E3350D] mt-2 uppercase">Opponent is throwing...</p>
          </div>
        ) : gamePhase === "round_end" ? (
          <div className="p-4 bg-white border-3 border-[#22C55E] shadow-[4px_4px_0px_#1a1a1a] text-center">
            <p className="font-black text-xs text-[#22C55E] uppercase">Round {round} complete — Next round starting...</p>
          </div>
        ) : (
          <button onClick={handleBack} className="w-full py-2 text-[10px] font-bold text-[#1a1a1a]/30 hover:text-[#E3350D] transition-colors uppercase">
            ← Leave Battle
          </button>
        )}
      </div>
    </div>
  )
}
