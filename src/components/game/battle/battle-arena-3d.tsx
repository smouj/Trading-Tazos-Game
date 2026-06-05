// ============================================================
// Trading Tazos Game — Battle Arena 3D
// Coliseum arena with real tazo image discs, animated physics,
// aim trajectory preview, and cinematic camera.
// ============================================================
"use client"

import { Suspense, useRef, useMemo, useCallback } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import * as THREE from "three"
import type { DiscPhysics, Arena3DConfig } from "@/lib/battle/game-loop"
import TazoDisc3D from "../3d/tazo-disc-3d"

// ─── Preload image to texture ───
const textureCache = new Map<string, THREE.Texture>()
function getTexture(url: string): THREE.Texture {
  if (textureCache.has(url)) return textureCache.get(url)!
  const tex = new THREE.TextureLoader().load(url)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.minFilter = THREE.LinearMipmapLinearFilter
  tex.magFilter = THREE.LinearFilter
  textureCache.set(url, tex)
  return tex
}

// ─── Stadium Floor ───
function ArenaFloor({ config }: { config: Arena3DConfig }) {
  const floorTex = useMemo(() => {
    const c = document.createElement("canvas")
    c.width = 1024; c.height = 1024
    const ctx = c.getContext("2d")!
    // Base
    const g = ctx.createRadialGradient(512, 512, 60, 512, 512, 530)
    g.addColorStop(0, "#f5f0e8")
    g.addColorStop(0.8, "#d8cebc")
    g.addColorStop(1, "#a89880")
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1024, 1024)
    // Outer ring
    ctx.strokeStyle = "#FFCC00"; ctx.lineWidth = 18
    ctx.beginPath(); ctx.arc(512, 512, 470, 0, Math.PI * 2); ctx.stroke()
    ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 4
    ctx.beginPath(); ctx.arc(512, 512, 470, 0, Math.PI * 2); ctx.stroke()
    // Concentric guide rings
    ctx.strokeStyle = "rgba(26,26,26,0.08)"; ctx.lineWidth = 1.5
    for (let r = 60; r < 450; r += 60) {
      ctx.beginPath(); ctx.arc(512, 512, r, 0, Math.PI * 2); ctx.stroke()
    }
    // Center dot
    ctx.fillStyle = "rgba(255,204,0,0.3)"
    ctx.beginPath(); ctx.arc(512, 512, 14, 0, Math.PI * 2); ctx.fill()
    // Crosshair
    ctx.setLineDash([20, 20]); ctx.strokeStyle = "rgba(0,0,0,0.06)"; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(42, 512); ctx.lineTo(982, 512); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(512, 42); ctx.lineTo(512, 982); ctx.stroke()
    ctx.setLineDash([])
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter
    tex.generateMipmaps = true
    return tex
  }, [])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
      <planeGeometry args={[config.radius * 2.8, config.radius * 2.8]} />
      <meshStandardMaterial map={floorTex} roughness={0.8} metalness={0.02} />
    </mesh>
  )
}

// ─── Neon Hover Ring ───
function HoverRing({ config, phase }: { config: Arena3DConfig; phase: string }) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta * 0.15
    const pulse = (Math.sin(Date.now() * 0.002) + 1) * 0.5
    const mat = ref.current.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = 0.3 + pulse * 0.6
    if (phase.startsWith("player_")) {
      mat.color.set("#FFCC00")
      mat.emissive.set("#FFCC00")
    } else if (phase === "opponent_turn") {
      mat.color.set("#E3350D")
      mat.emissive.set("#E3350D")
    } else {
      mat.color.set("#FFCC00")
      mat.emissive.set("#FFCC00")
    }
  })

  return (
    <mesh ref={ref} position={[0, 2.4, 0]} rotation={[Math.PI / 2.8, 0, 0]}>
      <torusGeometry args={[config.radius * 1.12, 0.04, 16, 128]} />
      <meshStandardMaterial
        color="#FFCC00" emissive="#FFCC00" emissiveIntensity={0.5}
        roughness={0.15} metalness={0.9} transparent opacity={0.7}
      />
    </mesh>
  )
}

// ─── Pillars ───
function Pillars({ config }: { config: Arena3DConfig }) {
  const positions = useMemo(() => {
    const r: { angle: number; x: number; z: number }[] = []
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      r.push({ angle: a, x: Math.cos(a) * config.radius * 1.35, z: Math.sin(a) * config.radius * 1.35 })
    }
    return r
  }, [config.radius])

  return (
    <>
      {positions.map((p, i) => (
        <group key={i} position={[p.x, 1.0, p.z]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.2, 0.25, 2.0, 8]} />
            <meshStandardMaterial color="#c8c0b0" roughness={0.7} metalness={0.15} />
          </mesh>
          <mesh position={[0, 1.1, 0]}>
            <sphereGeometry args={[0.15, 6, 6]} />
            <meshStandardMaterial
              color="#FF8800" emissive="#FF8800" emissiveIntensity={0.6}
              roughness={0.1}
            />
          </mesh>
        </group>
      ))}
    </>
  )
}

// ─── Rendered Physics Disc ───
function ArenaDisc({ disc, index }: { disc: DiscPhysics; index: number }) {
  const groupRef = useRef<THREE.Group>(null!)
  const targetPos = useRef(new THREE.Vector3(...disc.position))

  useFrame((_, delta) => {
    if (!groupRef.current) return
    targetPos.current.set(...disc.position)
    groupRef.current.position.lerp(targetPos.current, 0.25)
    if (disc.state === "sliding" || disc.state === "spinning") {
      groupRef.current.rotation.z += delta * 2.5
    }
    const ty = disc.state === "captured" ? 4 : disc.state === "out_of_bounds" ? 2 : 0.06
    groupRef.current.position.y += (ty - groupRef.current.position.y) * 0.15
    // Fade out captured
    if (disc.state === "captured") {
      groupRef.current.scale.lerp(new THREE.Vector3(0.01, 0.01, 0.01), 0.08)
    }
  })

  if (disc.state === "captured") return null

  return (
    <group ref={groupRef} position={disc.position}>
      <TazoDisc3D
        name={disc.tazoName}
        franchise={disc.franchise}
        imageUrl={disc.imageUrl}
        backImageUrl={disc.backImageUrl}
        size={0.42}
        rotationSpeed={0.4 + index * 0.08}
        autoRotate={true}
      />
    </group>
  )
}

// ─── Aim Line ───
function AimLine({ start, direction, power }: {
  start: [number, number, number]
  direction: [number, number, number]
  power: number
}) {
  const pts = useMemo(() => {
    const r: THREE.Vector3[] = []
    const speed = 2 + power * 8
    let x = start[0], z = start[2]
    const dx = direction[0] * speed, dz = direction[2] * speed
    for (let i = 0; i < 50; i++) {
      x += dx * 0.012; z += dz * 0.012
      r.push(new THREE.Vector3(x, 0.06, z))
    }
    return r
  }, [start, direction, power])

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={pts.length}
          array={new Float32Array(pts.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#FFCC00" transparent opacity={0.35} />
    </line>
  )
}

// ─── Camera ───
function ArenaCamera({ phase }: { phase: string }) {
  useFrame(({ camera }) => {
    if (phase === "intro") {
      const t = Date.now() * 0.0003
      camera.position.lerp(
        new THREE.Vector3(Math.sin(t) * 7, 7.5 + Math.sin(t * 1.7) * 1.2, Math.cos(t) * 7),
        0.02
      )
    } else {
      camera.position.lerp(new THREE.Vector3(0, 8.5, 9), 0.03)
    }
    camera.lookAt(0, 0, 0)
  })
  return null
}

// ─── Props ───
interface BattleArena3DProps {
  config: Arena3DConfig
  playerDiscs: DiscPhysics[]
  opponentDiscs: DiscPhysics[]
  gamePhase: string
  aimDirection?: [number, number, number]
  aimPower?: number
  onDiscClick?: (id: string) => void
  compact?: boolean
  className?: string
  style?: React.CSSProperties
}

function BattleScene(props: BattleArena3DProps) {
  const { config, playerDiscs, opponentDiscs, gamePhase, aimDirection, aimPower } = props
  const allDiscs = useMemo(
    () => [...playerDiscs, ...opponentDiscs],
    [playerDiscs, opponentDiscs]
  )

  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 14, 3]} intensity={0.85} castShadow
        shadow-mapSize-width={512} shadow-mapSize-height={512}
      />
      <directionalLight position={[-4, 6, -5]} intensity={0.2} />
      <spotLight position={[0, 11, 0]} angle={0.55} penumbra={0.6}
        intensity={3} color="#FFF8E0" castShadow
      />

      {/* Arena */}
      <ArenaFloor config={config} />
      <HoverRing config={config} phase={gamePhase} />
      <Pillars config={config} />

      {/* Discs */}
      {allDiscs.map((d, i) => (
        <ArenaDisc key={d.id} disc={d} index={i} />
      ))}

      {/* Aim preview */}
      {aimDirection && aimPower !== undefined && gamePhase === "player_aim" && (
        <AimLine start={[0, 0.06, config.radius * 0.5]} direction={aimDirection} power={aimPower} />
      )}

      <ArenaCamera phase={gamePhase} />
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2.6}
        minDistance={4}
        maxDistance={14}
        autoRotate={gamePhase === "intro"}
        autoRotateSpeed={0.4}
        target={[0, 0.3, 0]}
      />
    </>
  )
}

export default function BattleArena3D(props: BattleArena3DProps) {
  return (
    <div
      className={props.className}
      style={{
        width: "100%",
        minHeight: props.compact ? 300 : 480,
        background: "radial-gradient(ellipse at 50% 60%, #fff8e8, #d4c8b0 70%, #a89880)",
        borderRadius: 6,
        overflow: "hidden",
        ...props.style,
      }}
    >
      <Canvas
        camera={{ position: [0, 8.5, 9], fov: 40, near: 0.5, far: 50 }}
        gl={{ antialias: true, alpha: false }}
        shadows
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <BattleScene {...props} />
        </Suspense>
      </Canvas>
    </div>
  )
}
