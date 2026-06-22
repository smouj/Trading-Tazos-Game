// ============================================================
// Trading Tazos Game — Arena Slam v2
//
// Prototype gameplay: drag-release tazo arcade.
// Isometric camera, circular arena, trajectory preview,
// collision, bounce, flip, capture feedback.
//
// Route: /battle/prototype
// Feature flag: NEXT_PUBLIC_BATTLE_V2=1
// ============================================================
"use client"

import { useRef, useState, useCallback, useEffect, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import {
  ARENA_RADIUS, DISC_RADIUS, FRICTION, STOP_THRESHOLD,
  MAX_DRAG_DISTANCE, FLIP_THRESHOLD, CAPTURE_THRESHOLD,
  calculateLaunchVelocity, calculateTrajectoryPreview,
  simulateStep, allStopped, createDemoDisc,
  type DiscState, type DragState, type TazoArchetype,
  type ImpactEvent,
} from "@/lib/battle-v2/physics"
import { THEME_COLORS } from "@/components/game/arena/ArenaTheme"

// ─── Constants ───
const CAMERA_HEIGHT = 10
const CAMERA_DISTANCE = 12
const DRAG_SENSITIVITY = 2.2

// ─── Arena Floor ───
function ArenaFloorV2() {
  const theme = THEME_COLORS.default
  const tex = useMemo(() => {
    const c = document.createElement("canvas")
    c.width = 1024; c.height = 1024
    const ctx = c.getContext("2d")!
    const g = ctx.createRadialGradient(512, 512, 20, 512, 512, 480)
    g.addColorStop(0, theme.floor[0]); g.addColorStop(0.45, theme.floor[1])
    g.addColorStop(0.75, theme.floor[2]); g.addColorStop(0.92, theme.floor[3])
    g.addColorStop(1, theme.floor[4])
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1024, 1024)
    // Outer ring
    ctx.strokeStyle = theme.accent; ctx.lineWidth = 6
    ctx.beginPath(); ctx.arc(512, 512, 480, 0, Math.PI * 2); ctx.stroke()
    // Inner ring
    ctx.strokeStyle = theme.accent + "88"; ctx.lineWidth = 2
    ctx.beginPath(); ctx.arc(512, 512, 380, 0, Math.PI * 2); ctx.stroke()
    // Center dot
    ctx.fillStyle = theme.accent + "44"; ctx.beginPath()
    ctx.arc(512, 512, 20, 0, Math.PI * 2); ctx.fill()
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <circleGeometry args={[ARENA_RADIUS + 0.3, 64]} />
      <meshStandardMaterial map={tex} roughness={0.5} metalness={0.02} />
    </mesh>
  )
}

// ─── Arena Border ───
function ArenaBorderV2() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <ringGeometry args={[ARENA_RADIUS - 0.05, ARENA_RADIUS + 0.05, 64]} />
      <meshStandardMaterial color="#FFCC00" transparent opacity={0.6} side={2} />
    </mesh>
  )
}

// ─── Tazo Disc (simple colored disc) ───
function TazoDiscV2({ disc, isSelected, isDragging }: {
  disc: DiscState
  isSelected: boolean
  isDragging: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const groupRef = useRef<THREE.Group>(null!)
  const targetPos = useMemo(() => new THREE.Vector3(disc.x, 0.06, disc.z), [disc.x, disc.z])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    // Lerp position
    groupRef.current.position.lerp(targetPos, Math.min(1, delta * 15))
    // Visual rotation
    if (meshRef.current) {
      meshRef.current.rotation.y = disc.rotation
    }
    // Scale on flip
    if (disc.flipped) {
      groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, 0.1, 0.1)
    }
    // Pulse if selected
    if (isSelected && !disc.moving) {
      const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.05
      groupRef.current.scale.x = pulse
      groupRef.current.scale.z = pulse
    }
  })

  const color = disc.owner === "player" ? "#FFD700" : "#FF4444"
  const borderColor = disc.owner === "player" ? "#FFCC00" : "#CC0000"

  return (
    <group ref={groupRef} position={[disc.x, 0.06, disc.z]}>
      {/* Main disc */}
      <mesh ref={meshRef} castShadow>
        <cylinderGeometry args={[DISC_RADIUS, DISC_RADIUS, 0.06, 32]} />
        <meshStandardMaterial
          color={disc.flipped ? "#44FF44" : color}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      {/* Border ring */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[DISC_RADIUS - 0.04, DISC_RADIUS, 32]} />
        <meshBasicMaterial color={borderColor} side={2} />
      </mesh>
      {/* Selection glow */}
      {isSelected && !disc.moving && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[DISC_RADIUS + 0.05, DISC_RADIUS + 0.12, 32]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.4 + Math.sin(Date.now() * 0.006) * 0.2} side={2} depthWrite={false} />
        </mesh>
      )}
      {/* Name label */}
      {(isSelected || disc.moving) && !disc.flipped && (
        <mesh position={[0, 0.12, 0]}>
          <planeGeometry args={[0.8, 0.2]} />
          <meshBasicMaterial color="transparent" />
        </mesh>
      )}
    </group>
  )
}

// ─── Trajectory Line ───
function TrajectoryLine({ points }: { points: Array<[number, number]> }) {
  if (points.length < 2) return null

  const lineRef = useRef<THREE.Line>(null!)

  useEffect(() => {
    if (!lineRef.current) return
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(points.length * 3)
    points.forEach(([x, z], i) => {
      positions[i * 3] = x
      positions[i * 3 + 1] = 0.03
      positions[i * 3 + 2] = z
    })
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    lineRef.current.geometry = geometry
  }, [points])

  return (
    <line ref={lineRef as any}>
      <bufferGeometry />
      <lineBasicMaterial color="#FFCC00" transparent opacity={0.6} linewidth={2} />
    </line>
  )
}

// ─── Impact Particles ───
function ImpactVFX({ impacts }: { impacts: ImpactEvent[] }) {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])
  const timeRefs = useRef<number[]>([])

  useFrame((_, delta) => {
    impacts.forEach((impact, i) => {
      const mesh = meshRefs.current[i]
      if (!mesh) return
      if (timeRefs.current[i] === undefined) timeRefs.current[i] = 1.0
      timeRefs.current[i] -= delta * 3
      if (timeRefs.current[i] <= 0) {
        mesh.visible = false
      } else {
        const s = 0.3 + (1 - timeRefs.current[i]) * 1.5
        mesh.scale.setScalar(s)
        const mat = mesh.material as THREE.MeshBasicMaterial
        mat.opacity = Math.max(0, timeRefs.current[i])
      }
    })
  })

  return (
    <>
      {impacts.map((impact, i) => (
        <mesh
          key={`${impact.x}-${impact.z}-${i}`}
          ref={el => { meshRefs.current[i] = el }}
          position={[impact.x, 0.05, impact.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.1, 0.25, 16]} />
          <meshBasicMaterial
            color={impact.type === "capture" ? "#44FF44" : impact.type === "flip" ? "#FFAA00" : "#FFFFFF"}
            transparent
            opacity={0.8}
            side={2}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  )
}

// ─── Score Display ───
function ScoreHUD({ playerScore, opponentScore }: { playerScore: number; opponentScore: number }) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20 pointer-events-none">
      <div className="flex items-center gap-2 bg-black/60 px-4 py-2 rounded-lg border border-yellow-500/30">
        <span className="text-yellow-400 font-black text-xl">{playerScore}</span>
        <span className="text-white/40 font-bold text-xs">VS</span>
        <span className="text-red-400 font-black text-xl">{opponentScore}</span>
      </div>
    </div>
  )
}

// ─── Hand Display ───
function HandDisplay({ discs, selectedId, onSelect }: {
  discs: DiscState[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-2 z-20">
      {discs.map(d => (
        <button
          key={d.id}
          onClick={() => onSelect(d.id)}
          className={`w-14 h-14 rounded-full border-3 flex flex-col items-center justify-center transition-all ${
            selectedId === d.id
              ? "border-yellow-400 bg-yellow-400/20 scale-110 shadow-lg shadow-yellow-400/30"
              : "border-white/20 bg-black/40 hover:border-white/40 hover:bg-white/10"
          }`}
        >
          <div
            className="w-8 h-8 rounded-full"
            style={{
              background: d.archetype === "heavy" ? "#8B4513"
                : d.archetype === "technical" ? "#4488CC"
                : d.archetype === "spinner" ? "#9944FF"
                : d.archetype === "bouncer" ? "#44BB44"
                : d.archetype === "defender" ? "#666688"
                : "#FFD700",
              border: `2px solid ${d.owner === "player" ? "#FFCC00" : "#FF4444"}`,
            }}
          />
          <span className="text-[7px] font-bold text-white/60 mt-0.5 uppercase leading-none">
            {d.archetype.slice(0, 4)}
          </span>
        </button>
      ))}
    </div>
  )
}

// ─── Turn Indicator ───
function TurnIndicator({ turn, phase }: { turn: "player" | "opponent"; phase: string }) {
  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
      <div className={`text-center px-3 py-1 rounded border text-[10px] font-black uppercase tracking-wider ${
        turn === "player"
          ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400"
          : "border-red-500/40 bg-red-500/10 text-red-400"
      }`}>
        {phase === "select" ? "Choose your tazo" : phase === "aim" ? "Drag to aim & release" : phase === "resolving" ? "Resolving..." : turn === "player" ? "Your turn" : "Opponent turn"}
      </div>
    </div>
  )
}

// ─── Main Arena Slam V2 Component ───
export default function ArenaSlamV2() {
  // ── Game state ──
  const [discs, setDiscs] = useState<DiscState[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [phase, setPhase] = useState<"select" | "aim" | "resolving" | "opponent" | "result">("select")
  const [playerScore, setPlayerScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [impacts, setImpacts] = useState<ImpactEvent[]>([])
  const [playerHand, setPlayerHand] = useState<DiscState[]>([])
  const [turn, setTurn] = useState<"player" | "opponent">("player")
  const [dragState, setDragState] = useState<DragState>({
    startX: 0, startZ: 0, currentX: 0, currentZ: 0, active: false,
  })
  const [trajectory, setTrajectory] = useState<Array<[number, number]>>([])

  const arenaRef = useRef<HTMLDivElement>(null)
  const simulatingRef = useRef(false)
  const animFrameRef = useRef(0)

  // ── Initialize demo setup ──
  const initDemo = useCallback(() => {
    const playerHand = [
      createDemoDisc("p1", "Hammer", "heavy", 0, 2.0, "player"),
      createDemoDisc("p2", "Blade", "technical", 0, 2.0, "player"),
      createDemoDisc("p3", "Cyclone", "spinner", 0, 2.0, "player"),
      createDemoDisc("p4", "Shield", "defender", 0, 2.0, "player"),
      createDemoDisc("p5", "Nova", "balanced", 0, 2.0, "player"),
    ]
    const opponentTargets = [
      createDemoDisc("o1", "Grunt A", "balanced", 0, -1.5, "opponent"),
      createDemoDisc("o2", "Grunt B", "balanced", -1.2, -1.0, "opponent"),
      createDemoDisc("o3", "Tank", "defender", 1.2, -1.0, "opponent"),
    ]
    setDiscs([...playerHand, ...opponentTargets])
    setPlayerHand(playerHand)
    setSelectedId(playerHand[0].id)
    setPhase("select")
    setPlayerScore(0)
    setOpponentScore(0)
    setTurn("player")
  }, [])

  useEffect(() => { initDemo() }, [initDemo])

  // ── Get selected disc ──
  const selectedDisc = useMemo(
    () => discs.find(d => d.id === selectedId) || null,
    [discs, selectedId]
  )

  // ── Pointer events for drag-release ──
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (phase !== "aim" || !selectedDisc) return
    e.preventDefault()
    const rect = arenaRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * ARENA_RADIUS * DRAG_SENSITIVITY * 2
    const z = ((e.clientY - rect.top) / rect.height - 0.5) * ARENA_RADIUS * DRAG_SENSITIVITY * 2
    setDragState({ startX: x, startZ: z, currentX: x, currentZ: z, active: true })
  }, [phase, selectedDisc])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.active || !selectedDisc) return
    const rect = arenaRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * ARENA_RADIUS * DRAG_SENSITIVITY * 2
    const z = ((e.clientY - rect.top) / rect.height - 0.5) * ARENA_RADIUS * DRAG_SENSITIVITY * 2
    setDragState(prev => ({ ...prev, currentX: x, currentZ: z }))

    // Update trajectory preview
    const preview = calculateTrajectoryPreview(selectedDisc.x, selectedDisc.z, {
      ...dragState, currentX: x, currentZ: z,
    }, selectedDisc.stats, 40)
    setTrajectory(preview)
  }, [dragState.active, selectedDisc])

  const handlePointerUp = useCallback(() => {
    if (!dragState.active || !selectedDisc) return
    setDragState(prev => ({ ...prev, active: false }))
    setTrajectory([])

    // Launch!
    const { vx, vz } = calculateLaunchVelocity(dragState, selectedDisc.stats)
    if (Math.sqrt(vx * vx + vz * vz) < 1) return // Too weak

    setPhase("resolving")

    // Set disc velocity and start simulation
    setDiscs(prev => prev.map(d =>
      d.id === selectedId
        ? { ...d, vx, vz, moving: true, rotationSpeed: vx * 0.5 }
        : d
    ))

    // Run physics simulation
    simulatingRef.current = true
  }, [dragState, selectedDisc, selectedId])

  // ── Physics simulation loop ──
  useEffect(() => {
    if (!simulatingRef.current) return

    let lastTime = performance.now()
    let allImpactEvents: ImpactEvent[] = []

    const tick = () => {
      if (!simulatingRef.current) return

      const now = performance.now()
      const delta = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now

      setDiscs(prev => {
        const result = simulateStep(prev, delta)
        allImpactEvents = result.impacts

        if (allImpactEvents.length > 0) {
          setImpacts(prev => [...prev.slice(-5), ...allImpactEvents])
        }

        // Check for captures
        const captured = result.discs.filter(d => d.flipped && !prev.find(p => p.id === d.id)?.flipped)
        if (captured.length > 0) {
          const playerCaptures = captured.filter(d => d.owner === "opponent").length
          const opponentCaptures = captured.filter(d => d.owner === "player").length
          if (playerCaptures > 0) setPlayerScore(s => s + playerCaptures)
          if (opponentCaptures > 0) setOpponentScore(s => s + opponentCaptures)
        }

        if (allStopped(result.discs)) {
          simulatingRef.current = false
          // Check win condition
          const pScore = captured.length > 0 ? playerScore + captured.filter(d => d.owner === "opponent").length : playerScore
          if (pScore >= 5) {
            setPhase("result")
          } else {
            // Opponent turn (simplified: auto-launch)
            setTimeout(() => {
              setPhase("opponent")
              setTimeout(() => opponentTurn(result.discs), 800)
            }, 300)
          }
        }

        return result.discs
      })

      animFrameRef.current = requestAnimationFrame(tick)
    }

    animFrameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [phase])

  // ── Simplified opponent AI ──
  const opponentTurn = useCallback((currentDiscs: DiscState[]) => {
    // Pick a random opponent disc that isn't flipped
    const available = currentDiscs.filter(d => d.owner === "opponent" && !d.flipped && !d.ringOut)
    if (available.length === 0) {
      setPhase("select")
      setTurn("player")
      return
    }
    const launcher = available[Math.floor(Math.random() * available.length)]
    // Aim at a random player disc
    const targets = currentDiscs.filter(d => d.owner === "player" && !d.flipped && !d.ringOut)
    const target = targets.length > 0 ? targets[Math.floor(Math.random() * targets.length)] : null

    const angle = target
      ? Math.atan2(target.z - launcher.z, target.x - launcher.x) + (Math.random() - 0.5) * 0.3
      : Math.random() * Math.PI * 2
    const speed = 6 + Math.random() * 8

    setDiscs(prev => prev.map(d =>
      d.id === launcher.id
        ? { ...d, vx: Math.cos(angle) * speed, vz: Math.sin(angle) * speed, moving: true, rotationSpeed: Math.cos(angle) * 2 }
        : d
    ))
    setPhase("resolving")
    simulatingRef.current = true
  }, [])

  // Select a tazo from hand to launch
  const handleSelectDisc = useCallback((id: string) => {
    if (phase !== "select" && phase !== "aim") return
    setSelectedId(id)
    setPhase("aim")
  }, [phase])

  // ── Render ──
  return (
    <div ref={arenaRef} className="w-full h-full relative select-none" style={{
      background: THEME_COLORS.default.bgGradient,
    }}>
      {/* HUD */}
      <ScoreHUD playerScore={playerScore} opponentScore={opponentScore} />
      <TurnIndicator turn={turn} phase={phase} />

      {/* Hand */}
      {playerHand.length > 0 && (
        <HandDisplay
          discs={playerHand.filter(d => !d.flipped)}
          selectedId={selectedId}
          onSelect={handleSelectDisc}
        />
      )}

      {/* Result overlay */}
      {phase === "result" && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/50">
          <div className="text-center">
            <h2 className="text-4xl font-black text-yellow-400 uppercase tracking-wider mb-4">
              {playerScore >= 5 ? "Victory!" : "Defeat"}
            </h2>
            <p className="text-white/60 text-lg mb-6">
              {playerScore} — {opponentScore}
            </p>
            <button
              onClick={initDemo}
              className="px-8 py-3 bg-yellow-500 text-black font-black uppercase tracking-wider border-3 border-black hover:bg-yellow-400 transition-all"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      {phase === "aim" && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <p className="text-white/40 text-xs font-bold uppercase tracking-wider text-center">
            Drag back to aim · Release to launch
          </p>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, CAMERA_HEIGHT, CAMERA_DISTANCE], fov: 35, near: 0.5, far: 100 }}
        gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping }}
        dpr={[1, 2]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 12, 3]} intensity={0.8} castShadow />
        <pointLight position={[0, 6, 0]} intensity={1.5} color="#FFF5E0" />

        <ArenaFloorV2 />
        <ArenaBorderV2 />

        {/* Discs */}
        {discs.filter(d => !d.ringOut).map(d => (
          <TazoDiscV2
            key={d.id}
            disc={d}
            isSelected={d.id === selectedId}
            isDragging={dragState.active && d.id === selectedId}
          />
        ))}

        {/* Trajectory preview */}
        {trajectory.length > 0 && <TrajectoryLine points={trajectory} />}

        {/* Impact VFX */}
        <ImpactVFX impacts={impacts} />

        {/* Arena shadow */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
          <circleGeometry args={[ARENA_RADIUS + 0.5, 64]} />
          <meshBasicMaterial color="#000" transparent opacity={0.15} />
        </mesh>
      </Canvas>
    </div>
  )
}