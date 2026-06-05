// ============================================================
// Trading Tazos Game — Battle View (Complete Rewrite)
// Professional 3D tazo battle: lobby → intro → aim → throw → resolve.
// Supports AI practice, PvP ranked, and PvP friend modes.
// Mobile-first responsive design.
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
  TazoCard, DiscPhysics, MatchConfig, MatchResult, ThrowParams, RoundResult,
} from "@/lib/battle/game-loop"
import { deriveBattleStats } from "@/lib/battle/battle-types"
import GameLobby from "./battle/game-lobby"
import BattleArena3D from "./battle/battle-arena-3d"
import BattleHUD from "./battle/battle-hud"
import LaunchSystem from "./battle/launch-system"
import BattleResultPanel from "./battle/battle-result-panel"
import { Disc3, Swords, Play, RotateCcw } from "lucide-react"

// ─── Demo tazos for guest users ───
const DEMO_TAZOS: TazoCard[] = [
  { id: "demo-1", name: "Lumipuff", slug: "lumipuff", franchise: "minimon", imageUrl: "/assets/tazos/minimon/001.png", attack: 45, defense: 40, resistance: 35, weight: 35, stability: 40, spin: 55, control: 50, bounce: 45, precision: 55 },
  { id: "demo-2", name: "Emberkit", slug: "emberkit", franchise: "minimon", imageUrl: "/assets/tazos/minimon/003.png", attack: 65, defense: 50, resistance: 45, weight: 40, stability: 45, spin: 45, control: 55, bounce: 40, precision: 50 },
  { id: "demo-3", name: "Voltcrab", slug: "voltcrab-x", franchise: "cybermon", imageUrl: "/assets/tazos/cybermon/001.png", attack: 70, defense: 45, resistance: 50, weight: 55, stability: 50, spin: 60, control: 40, bounce: 35, precision: 45 },
  { id: "demo-4", name: "Datadrake", slug: "datadrake", franchise: "cybermon", imageUrl: "/assets/tazos/cybermon/002.png", attack: 60, defense: 55, resistance: 50, weight: 45, stability: 55, spin: 50, control: 60, bounce: 45, precision: 55 },
  { id: "demo-5", name: "Rai Kendo", slug: "rai-kendo", franchise: "dracobell", imageUrl: "/assets/tazos/dracobell/001.png", attack: 75, defense: 45, resistance: 42, weight: 52, stability: 48, spin: 55, control: 47, bounce: 42, precision: 48 },
  { id: "demo-6", name: "Tenzan", slug: "tenzan-blaze", franchise: "dracobell", imageUrl: "/assets/tazos/dracobell/002.png", attack: 80, defense: 55, resistance: 52, weight: 58, stability: 55, spin: 65, control: 60, bounce: 48, precision: 55 },
  { id: "demo-7", name: "Mizu Shiro", slug: "mizu-shiro", franchise: "dracobell", imageUrl: "/assets/tazos/dracobell/003.png", attack: 62, defense: 65, resistance: 58, weight: 55, stability: 58, spin: 50, control: 52, bounce: 45, precision: 52 },
]

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
  const [aimParams, setAimParams] = useState<{ x: number; y: number; accuracy: number }>({ x: 0, y: 0, accuracy: 0.8 })
  const effectRun = useRef(false)

  // ─── Load tazos ───
  useEffect(() => {
    async function load() {
      try {
        let myTazos: TazoCard[] = []
        if (user && token) {
          const deckRes = await fetch("/api/decks", { headers: { Authorization: `Bearer ${token}` } })
          if (deckRes.ok) {
            const data = await deckRes.json()
            const activeDeck = data.decks?.find((d: { isActive: boolean }) => d.isActive)
            if (activeDeck?.tazos?.length) {
              myTazos = activeDeck.tazos.map((t: Record<string, unknown>) => ({
                id: t.id as string,
                name: (t.name || t.displayName || "?") as string,
                slug: (t.slug || "") as string,
                franchise: (t.franchiseSlug || "minimon") as "minimon" | "cybermon" | "dracobell",
                imageUrl: t.imageUrl as string || null,
                attack: (t.attack || 50) as number,
                defense: (t.defense || 50) as number,
                resistance: ((t as any).resistance || 50) as number,
                weight: ((t as any).weight || 50) as number,
                stability: ((t as any).stability || 50) as number,
                spin: (t.spin || 50) as number,
                control: (t.control || 50) as number,
                bounce: ((t as any).bounce || 50) as number,
                precision: ((t as any).precision || 50) as number,
              }))
            }
          }
        }
        setPlayerTazos(myTazos.length >= 5 ? myTazos : DEMO_TAZOS)
      } catch { setPlayerTazos(DEMO_TAZOS) }
      finally { setLoading(false) }
    }
    load()
  }, [user, token])

  // ─── Start match ───
  const handleStartMatch = useCallback(async (mode: PlayMode, difficulty: AIDifficulty, deck: TazoCard[]) => {
    setPlayerDeck(deck)

    // Generate opponent deck
    let oppDeck: TazoCard[] = []
    if (mode === "practice") {
      // Use demo tazos for AI
      oppDeck = [...DEMO_TAZOS].sort(() => Math.random() - 0.5).slice(0, 5)
    } else {
      try {
        const res = await fetch("/api/tazos?sortBy=attack&sortOrder=desc&limit=20")
        if (res.ok) {
          const data = await res.json()
          const pool = (data.tazos || []).map((t: Record<string, unknown>) => ({
            id: t.id as string,
            name: (t.name || "?") as string,
            slug: t.slug as string,
            franchise: ((t.franchise as { slug?: string })?.slug || "minimon") as "minimon" | "cybermon" | "dracobell",
            imageUrl: t.imageUrl as string || null,
            attack: (t.attack || 50) as number,
            defense: (t.defense || 50) as number,
            resistance: ((t as any).resistance || 50) as number,
            weight: ((t as any).weight || 50) as number,
            stability: ((t as any).stability || 50) as number,
            spin: (t.spin || 50) as number,
            control: (t.control || 50) as number,
            bounce: ((t as any).bounce || 50) as number,
            precision: ((t as any).precision || 50) as number,
          }))
          oppDeck = pool
            .filter((t: TazoCard) => !deck.some(d => d.id === t.id))
            .sort(() => Math.random() - 0.5).slice(0, 5)
        }
      } catch { oppDeck = [...DEMO_TAZOS].sort(() => Math.random() - 0.5).slice(0, 5) }
    }
    if (oppDeck.length < 5) oppDeck = [...DEMO_TAZOS].sort(() => Math.random() - 0.5).slice(0, 5)

    const config: MatchConfig = {
      mode,
      aiDifficulty: difficulty,
      arena: DEFAULT_ARENA_3D,
      rounds: 0,
      playerDeck: deck,
      opponentDeck: oppDeck,
    }

    setMatchConfig(config)
    setPlayerHP(100)
    setOpponentHP(100)
    setPlayerCaptured(0)
    setOpponentCaptured(0)
    setRound(1)
    setTurnNumber(0)
    setMatchResult(null)

    // Init physics discs on the field
    const pDiscs: DiscPhysics[] = deck.map((t, i) => ({
      id: t.id,
      position: [i * 0.8 - 1.6, 0.04, 3.5], // Player side
      velocity: [0, 0, 0],
      rotation: [0, 0, 0],
      angularVelocity: [0, 0, 0],
      facing: "front",
      state: "stopped",
      owner: "player",
    }))
    const oDiscs: DiscPhysics[] = oppDeck.map((t, i) => ({
      id: t.id,
      position: [i * 0.8 - 1.6, 0.04, -3.5], // Opponent side
      velocity: [0, 0, 0],
      rotation: [0, 0, 0],
      angularVelocity: [0, 0, 0],
      facing: "front",
      state: "stopped",
      owner: "opponent",
    }))

    setPlayerDiscs(pDiscs)
    setOpponentDiscs(oDiscs)

    // Intro → Round start
    setGamePhase("intro")
    setTimeout(() => {
      setGamePhase("round_start")
      setTimeout(() => {
        // Start with player aim
        const firstTazo = deck[0]
        setThrowingTazo(firstTazo)
        setLaunchPhase("aim")
        setGamePhase("player_aim")
      }, 1500)
    }, 2500)
  }, [])

  // ─── AIM lock ───
  const handleAimLock = useCallback((x: number, y: number, accuracy: number) => {
    setAimParams({ x, y, accuracy })
    setLaunchPhase("power")
    setGamePhase("player_power")
  }, [])

  // ─── POWER lock → throw ───
  const handlePowerLock = useCallback((power: number, accuracy: number) => {
    if (!throwingTazo || !matchConfig) return

    const throwParams: ThrowParams = {
      tazoId: throwingTazo.id,
      aimX: aimParams.x,
      aimY: aimParams.y,
      power,
      powerAccuracy: accuracy,
      spinType: "none", // Simplified: we skip spin phase for now
      accuracyPenalty: (1 - aimParams.accuracy) * 0.5 + (1 - accuracy) * 0.3,
      timestamp: Date.now(),
    }

    setGamePhase("throwing")

    // Simulate throw after animation delay
    setTimeout(() => {
      if (!matchConfig) return
      setGamePhase("physics")

      const result = simulateThrow(throwingTazo, throwParams, opponentDiscs, matchConfig.arena)
      setOpponentDiscs([...result.discs])

      // Apply HP damage
      const damage = result.result.hpDealt
      setOpponentHP(prev => Math.max(0, prev - damage))
      setOpponentCaptured(prev => prev + result.result.discsCaptured.length)
      setPlayerCaptured(prev => prev + result.result.discsRingOut.length)
      setTurnNumber(prev => prev + 1)

      setTimeout(() => {
        setGamePhase("resolve")

        // Check match end
        const end = checkMatchEnd(
          { id: "player", name: "You", deck: playerDeck, hp: playerHP, maxHp: 100, tazosRemaining: playerDeck.length - playerCaptured, captured: playerCaptured, currentTazo: null, isAI: false },
          { id: "opponent", name: matchConfig.mode === "practice" ? `AI` : "Opponent", deck: matchConfig.opponentDeck, hp: opponentHP - damage, maxHp: 100, tazosRemaining: matchConfig.opponentDeck.length - opponentCaptured, captured: opponentCaptured, currentTazo: null, isAI: true },
          playerDiscs, opponentDiscs
        )

        if (end) {
          setMatchResult(end)
          setGamePhase("match_end")
          return
        }

        // Opponent turn
        setTimeout(() => {
          setGamePhase("opponent_turn")
          const oppTazo = matchConfig.opponentDeck[Math.floor(Math.random() * matchConfig.opponentDeck.length)]
          const aiMove = generateAIMove(oppTazo, playerDiscs, opponentDiscs, matchConfig.arena, matchConfig.aiDifficulty)

          setTimeout(() => {
            setGamePhase("physics")
            const oppResult = simulateThrow(oppTazo, aiMove, playerDiscs, matchConfig.arena)
            setPlayerDiscs([...oppResult.discs])
            const oppDamage = oppResult.result.hpDealt
            setPlayerHP(prev => Math.max(0, prev - oppDamage))
            setPlayerCaptured(prev => prev + oppResult.result.discsCaptured.length)
            setTurnNumber(prev => prev + 1)

            setTimeout(() => {
              setGamePhase("resolve")
              // Check end again
              const end2 = checkMatchEnd(
                { id: "player", name: "You", deck: playerDeck, hp: playerHP - oppDamage, maxHp: 100, tazosRemaining: playerDeck.length - playerCaptured, captured: playerCaptured, currentTazo: null, isAI: false },
                { id: "opponent", name: matchConfig.mode === "practice" ? `AI` : "Opponent", deck: matchConfig.opponentDeck, hp: opponentHP - damage, maxHp: 100, tazosRemaining: matchConfig.opponentDeck.length - opponentCaptured, captured: opponentCaptured, currentTazo: null, isAI: true },
                playerDiscs, opponentDiscs
              )
              if (end2) {
                setMatchResult(end2)
                setGamePhase("match_end")
                return
              }

              // Next round
              setRound(prev => prev + 1)
              setGamePhase("round_end")
              setTimeout(() => {
                const nextTazo = playerDeck[turnNumber % playerDeck.length]
                setThrowingTazo(nextTazo)
                setLaunchPhase("aim")
                setGamePhase("player_aim")
              }, 1500)
            }, 1000)
          }, 1500)
        }, 1200)
      }, 800)
    }, 400)
  }, [throwingTazo, matchConfig, aimParams, playerDeck, playerHP, opponentHP, playerDiscs, opponentDiscs, playerCaptured, opponentCaptured, turnNumber])

  // ─── Rematch ───
  const handleRematch = useCallback(() => {
    if (!matchConfig) return
    handleStartMatch(matchConfig.mode, matchConfig.aiDifficulty, playerDeck)
  }, [matchConfig, playerDeck, handleStartMatch])

  // ─── Back to lobby ───
  const handleBackToLobby = useCallback(() => {
    setGamePhase("lobby")
    setMatchConfig(null)
    setMatchResult(null)
    setThrowingTazo(null)
  }, [])

  // ─── Loading ───
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <Disc3 className="w-12 h-12 mx-auto animate-spin text-[#FFCC00]" />
          <p className="font-black text-sm text-[#1a1a1a] uppercase tracking-wider">Loading Battle...</p>
        </div>
      </div>
    )
  }

  // ─── Lobby ───
  if (gamePhase === "lobby") {
    return (
      <GameLobby
        playerTazos={playerTazos}
        onStart={handleStartMatch}
        isLoading={false}
        isAuthenticated={!!user}
      />
    )
  }

  // ─── Match End ───
  if (gamePhase === "match_end" && matchResult) {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <BattleResultPanel
          result={{
            winner: matchResult.winner,
            victoryType: matchResult.victoryType,
            playerScore: playerDiscs.filter(d => d.owner === "player" && d.state !== "captured").length,
            opponentScore: opponentDiscs.filter(d => d.owner === "opponent" && d.state !== "captured").length,
            totalTurns: turnNumber,
            playerCaptures: playerCaptured,
            opponentCaptures: opponentCaptured,
            summary: matchResult.summary,
          }}
          playerName="You"
          opponentName={matchConfig?.mode === "practice" ? `AI (${matchConfig?.aiDifficulty})` : "Opponent"}
          onRematch={handleRematch}
        />
        <div className="text-center">
          <button
            onClick={handleBackToLobby}
            className="px-6 py-3 font-black text-sm uppercase tracking-wider bg-white text-[#1a1a1a] border-3 border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
          >
            <RotateCcw className="w-4 h-4 inline mr-2" />
            Back to Lobby
          </button>
        </div>
      </div>
    )
  }

  // ─── Active Battle ───
  const arenaConfig = matchConfig?.arena || DEFAULT_ARENA_3D
  const isCompact = typeof window !== "undefined" && window.innerWidth < 640

  return (
    <div className="w-full h-full flex flex-col space-y-3 animate-in fade-in duration-300">
      {/* ── HUD ── */}
      <div className="flex-shrink-0 px-1">
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

      {/* ── Back to lobby button ── */}
      {gamePhase !== "throwing" && gamePhase !== "physics" && (
        <button
          onClick={handleBackToLobby}
          className="self-start text-[10px] font-bold text-[#1a1a1a]/40 hover:text-[#E3350D] transition-colors ml-1"
        >
          ← Lobby
        </button>
      )}

      {/* ── Arena 3D ── */}
      <div className="flex-1 min-h-0">
        <BattleArena3D
          config={arenaConfig}
          playerDiscs={playerDiscs}
          opponentDiscs={opponentDiscs}
          gamePhase={gamePhase}
          aimDirection={
            gamePhase === "player_aim" && aimParams
              ? [aimParams.x, 0, aimParams.y > 0 ? -aimParams.y : Math.abs(aimParams.y)]
              : undefined
          }
          aimPower={launchPhase === "power" ? 0.5 : undefined}
          compact={isCompact}
        />
      </div>

      {/* ── Launch Controls ── */}
      {gamePhase === "player_aim" || gamePhase === "player_power" || gamePhase === "player_spin" ? (
        <div className="flex-shrink-0">
          <LaunchSystem
            phase={launchPhase}
            onAimLock={handleAimLock}
            onPowerLock={handlePowerLock}
            onSpinLock={(spin) => {
              // Handle spin
              handlePowerLock(0.6, 0.8)
            }}
            throwingTazoName={throwingTazo?.name || "?"}
            throwingTazoFranchise={throwingTazo?.franchise || "minimon"}
          />
        </div>
      ) : gamePhase === "throwing" || gamePhase === "physics" ? (
        <div className="flex-shrink-0 p-4 bg-white border-3 border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] text-center">
          <Disc3 className="w-8 h-8 mx-auto animate-spin text-[#FFCC00]" />
          <p className="font-black text-sm uppercase text-[#1a1a1a]/50 mt-2">
            {gamePhase === "throwing" ? "Throwing..." : "Resolving..."}
          </p>
        </div>
      ) : gamePhase === "opponent_turn" ? (
        <div className="flex-shrink-0 p-4 bg-white border-3 border-[#E3350D] shadow-[4px_4px_0px_#1a1a1a] text-center">
          <Disc3 className="w-8 h-8 mx-auto animate-spin text-[#E3350D]" />
          <p className="font-black text-xs uppercase text-[#E3350D] mt-2">
            Opponent is throwing...
          </p>
        </div>
      ) : gamePhase === "round_end" ? (
        <div className="flex-shrink-0 p-4 bg-white border-3 border-[#22C55E] shadow-[4px_4px_0px_#1a1a1a] text-center">
          <p className="font-black text-xs uppercase text-[#22C55E]">
            Round {round} Complete — Next Round Starting...
          </p>
        </div>
      ) : null}
    </div>
  )
}
