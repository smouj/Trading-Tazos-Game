// ============================================================
// Trading Tazos Game — Battle Arena 3D
// Full 3D physics arena with coliseum, animated discs, effects.
// Works on mobile and desktop via R3F + responsive canvas.
// ============================================================
"use client"

import { Suspense, useRef, useMemo, useCallback } from "react"
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber"
import { OrbitControls, Text, ContactShadows } from "@react-three/drei"
import * as THREE from "three"
import type { DiscPhysics, Arena3DConfig } from "@/lib/battle/game-loop"
import TazoDisc3D from "../3d/tazo-disc-3d"

// ─── Colors per franchise for arena ───
const FRANCHISE_GLOW: Record<string, string> = {
  minimon: "#FFCB05",
  cybermon: "#00A1E9",
  dracobell: "#FF6B00",
}

// ─── Stadium Floor ───
function ArenaFloor({ config }: { config: Arena3DConfig }) {
  const floorTex = useMemo(() => {
    const c = document.createElement("canvas")
    c.width = 1024; c.height = 1024
    const ctx = c.getContext("2d")!
    // Gradient base
    const g = ctx.createRadialGradient(512, 512, 100, 512, 512, 512)
    g.addColorStop(0, "#ffffff")
    g.addColorStop(0.85, "#e8e0d0")
    g.addColorStop(1, "#c0b8a8")
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 1024, 1024)
    // Rings
    ctx.strokeStyle = "#FFCC00"; ctx.lineWidth = 16
    ctx.beginPath(); ctx.arc(512, 512, 460, 0, Math.PI * 2); ctx.stroke()
    ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 6
    ctx.beginPath(); ctx.arc(512, 512, 460, 0, Math.PI * 2); ctx.stroke()
    ctx.strokeStyle = "rgba(26,26,26,0.12)"; ctx.lineWidth = 2
    for (let r = 50; r < 450; r += 50) {
      ctx.beginPath(); ctx.arc(512, 512, r, 0, Math.PI * 2); ctx.stroke()
    }
    // Cross hair
    ctx.setLineDash([16, 16])
    ctx.beginPath(); ctx.moveTo(62, 512); ctx.lineTo(962, 512); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(512, 62); ctx.lineTo(512, 962); ctx.stroke()
    // Halftone outside rim
    ctx.setLineDash([])
    ctx.fillStyle = "rgba(0,0,0,0.03)"
    for (let y = 0; y < 1024; y += 14) {
      for (let x = 0; x < 1024; x += 14) {
        if (Math.sqrt((x-512)**2 + (y-512)**2) > 420) {
          ctx.beginPath(); ctx.arc(x + ((y/14)%2)*7, y, 2.5, 0, Math.PI*2); ctx.fill()
        }
      }
    }
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter
    tex.generateMipmaps = true
    return tex
  }, [])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
      <planeGeometry args={[config.radius * 2.8, config.radius * 2.8]} />
      <meshStandardMaterial map={floorTex} roughness={0.75} metalness={0.05} />
    </mesh>
  )
}

// ─── Floating Neon Ring ───
function NeonRing({ config }: { config: Arena3DConfig }) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.2
      ref.current.position.y = 2.2 + Math.sin(Date.now() * 0.0008) * 0.12
    }
  })
  return (
    <mesh ref={ref} position={[0, 2.2, 0]} rotation={[Math.PI / 3, 0, 0]}>
      <torusGeometry args={[config.radius * 1.1, 0.06, 16, 128]} />
      <meshStandardMaterial
        color="#FFCC00" emissive="#FFCC00" emissiveIntensity={0.7}
        roughness={0.2} metalness={0.9} transparent opacity={0.75}
      />
    </mesh>
  )
}

// ─── Coliseum Pillars ───
function ArenaPillars({ config }: { config: Arena3DConfig }) {
  const pillars = useMemo(() => {
    const result: { angle: number; x: number; z: number }[] = []
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      result.push({
        angle,
        x: Math.cos(angle) * config.radius * 1.35,
        z: Math.sin(angle) * config.radius * 1.35,
      })
    }
    return result
  }, [config.radius])

  return (
    <>
      {pillars.map((p, i) => (
        <group key={i} position={[p.x, 1.2, p.z]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.25, 0.3, 2.4, 8]} />
            <meshStandardMaterial color="#d0c8b8" roughness={0.6} metalness={0.2} />
          </mesh>
          {/* Top torch */}
          <mesh position={[0, 1.35, 0]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? "#FF8800" : "#FFCC00"}
              emissive={i % 2 === 0 ? "#FF8800" : "#FFCC00"}
              emissiveIntensity={0.8}
              roughness={0.1}
            />
          </mesh>
        </group>
      ))}
      {/* Outer wall ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <torusGeometry args={[config.radius * 1.4, 0.15, 8, 64]} />
        <meshStandardMaterial color="#b0a898" roughness={0.8} metalness={0.1} />
      </mesh>
    </>
  )
}

// ─── Physics Disc (3D representation) ───
function PhysicsDisc({
  disc, config, onClick, isThrowing, index,
}: {
  disc: DiscPhysics
  config: Arena3DConfig
  onClick?: (id: string) => void
  isThrowing: boolean
  index: number
}) {
  const groupRef = useRef<THREE.Group>(null!)
  const targetPos = useRef(new THREE.Vector3(...disc.position))
  const targetRot = useRef(new THREE.Euler(...disc.rotation))

  useFrame((_, delta) => {
    if (!groupRef.current) return
    // Smooth interpolation for visual
    targetPos.current.set(...disc.position)
    groupRef.current.position.lerp(targetPos.current, 0.3)
    // Spin
    if (disc.state === "sliding" || disc.state === "spinning") {
      groupRef.current.rotation.z += delta * 3
    }
    // Elevation based on state
    const targetY = disc.state === "out_of_bounds" ? 0.5 : 0.04
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.2
    // Fade captured
    if (disc.state === "captured") {
      groupRef.current.scale.lerp(new THREE.Vector3(0.01, 0.01, 0.01), 0.1)
    }
  })

  if (disc.state === "captured") return null

  const franchise = disc.owner === "player" ? "minimon" : 
    index % 3 === 0 ? "minimon" : index % 3 === 1 ? "cybermon" : "dracobell"

  return (
    <group ref={groupRef} position={disc.position}>
      <TazoDisc3D
        name={`#${index + 1}`}
        franchise={franchise}
        size={0.35}
        rotationSpeed={disc.state === "sliding" ? 2 : 0.3}
        autoRotate={true}
        onClick={() => onClick?.(disc.id)}
      />
      {/* Shadow */}
      <mesh position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.38, 32]} />
        <meshBasicMaterial color="#000" transparent opacity={0.15} depthWrite={false} />
      </mesh>
      {/* Highlight ring for throwable */}
      {isThrowing && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.42, 0.03, 8, 32]} />
          <meshBasicMaterial color="#FFCC00" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  )
}

// ─── Aim Line (trajectory preview) ───
function AimLine({ start, direction, power }: {
  start: [number, number, number]
  direction: [number, number, number]
  power: number
}) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = []
    const speed = 2 + power * 8
    let x = start[0], z = start[2]
    const dx = direction[0] * speed, dz = direction[2] * speed
    for (let i = 0; i < 40; i++) {
      x += dx * 0.016
      z += dz * 0.016
      pts.push(new THREE.Vector3(x, 0.05, z))
    }
    return pts
  }, [start, direction, power])

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#FFCC00" transparent opacity={0.4} linewidth={1} />
    </line>
  )
}

// ─── Camera Animator ───
function CameraAnimator({ phase }: { phase: string }) {
  const { camera } = useThree()
  const target = useRef(new THREE.Vector3(0, 8, 10))
  
  useFrame(() => {
    if (phase === "intro") {
      target.current.set(
        Math.sin(Date.now() * 0.0003) * 6,
        7 + Math.sin(Date.now() * 0.0005) * 1.5,
        Math.cos(Date.now() * 0.0003) * 6
      )
    } else {
      target.current.set(0, 8, 10)
    }
    camera.position.lerp(target.current, 0.02)
    camera.lookAt(0, 0, 0)
  })

  return null
}

// ─── Battle Scene ───
interface BattleArena3DProps {
  config: Arena3DConfig
  playerDiscs: DiscPhysics[]
  opponentDiscs: DiscPhysics[]
  gamePhase: string
  aimDirection?: [number, number, number]
  aimPower?: number
  onDiscClick?: (id: string) => void
  onArenaClick?: (x: number, z: number) => void
  className?: string
  style?: React.CSSProperties
  compact?: boolean
}

function BattleScene({
  config, playerDiscs, opponentDiscs, gamePhase,
  aimDirection, aimPower, onDiscClick, onArenaClick,
}: BattleArena3DProps) {
  const { camera } = useThree()

  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    const point = e.point
    onArenaClick?.(point.x, point.z)
  }, [onArenaClick])

  const allDiscs = [...playerDiscs, ...opponentDiscs]

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 12, 3]} intensity={0.9} castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024}
      />
      <directionalLight position={[-4, 5, -4]} intensity={0.25} />
      <spotLight position={[0, 10, 0]} angle={0.55} penumbra={0.5}
        intensity={2.5} color="#FFF8E0" castShadow
      />
      <pointLight position={[-5, 3, 4]} intensity={0.4} color="#E3350D" />
      <pointLight position={[5, 3, -4]} intensity={0.4} color="#3B4CCA" />

      {/* Arena elements */}
      <ArenaFloor config={config} />
      <NeonRing config={config} />
      <ArenaPillars config={config} />

      {/* Physics discs */}
      {allDiscs.map((disc, i) => (
        <PhysicsDisc
          key={disc.id}
          disc={disc}
          config={config}
          index={i}
          isThrowing={false}
          onClick={onDiscClick}
        />
      ))}

      {/* Aim trajectory preview */}
      {aimDirection && aimPower !== undefined && gamePhase === "player_aim" && (
        <AimLine start={[0, 0.05, config.radius * 0.5]} direction={aimDirection} power={aimPower} />
      )}

      {/* Ground interaction plane for arena clicks */}
      <mesh
        position={[0, 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={handlePointerDown}
        visible={false}
      >
        <planeGeometry args={[config.radius * 3, config.radius * 3]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <ContactShadows position={[0, -0.04, 0]} opacity={0.3} scale={12} blur={2.5} />
      <CameraAnimator phase={gamePhase} />
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI / 2.8}
        minDistance={5}
        maxDistance={14}
        autoRotate={gamePhase === "intro"}
        autoRotateSpeed={0.5}
        target={[0, 0.3, 0]}
      />
    </>
  )
}

// ─── Exported Wrapper (responsive + mobile-friendly) ───
export default function BattleArena3D(props: BattleArena3DProps) {
  return (
    <div
      className={props.className}
      style={{
        width: "100%",
        minHeight: props.compact ? 280 : 420,
        background: "radial-gradient(ellipse at center, #fff8e8 0%, #e8dcc0 60%, #c0b090 100%)",
        borderRadius: 4,
        overflow: "hidden",
        ...props.style,
      }}
    >
      <Canvas
        camera={{ position: [0, 8, 10], fov: 42 }}
        gl={{ antialias: true, alpha: false, preserveDrawingBuffer: false }}
        shadows
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={null}>
          <BattleScene {...props} />
        </Suspense>
      </Canvas>
    </div>
  )
}
