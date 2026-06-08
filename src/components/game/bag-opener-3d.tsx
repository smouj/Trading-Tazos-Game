// ============================================================
// Trading Tazos Game — BagOpener3D v4
//
// Flow: bag faces front (no rotation) → user drags to tear
// → bag peels open → tazo disc rises from inside → reveal.
// All animations smooth, no micro-cuts.
// ============================================================
"use client"

import { useRef, useState, useMemo, useCallback, useEffect, Suspense } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import PotatoChipBag3D, { BAG_W, BAG_H, BAG_D, TOP_CRIMP, BOT_CRIMP, BODY_H } from "./3d/potato-chip-bag-3d"
import { pickBagVariant } from "@/lib/bag-variants"
import { playSFX } from "@/lib/audio/sfx-engine"

// ══════════════════════════════════════════════════════════
// TAZO DISC — rises from inside the opened bag
// ══════════════════════════════════════════════════════════
function TazoDisc({
  active, color, onComplete,
}: {
  active: boolean; color: string; onComplete?: () => void
}) {
  const ref = useRef<THREE.Mesh>(null!)
  const completed = useRef(false)
  const emergeRef = useRef(0)
  const glowRef = useRef<THREE.Mesh>(null!)

  useFrame((_, delta) => {
    if (!active) return
    emergeRef.current = Math.min(1, emergeRef.current + delta * 1.6)

    const t = emergeRef.current
    // Ease-out: fast start, slow land
    const eased = 1 - Math.pow(1 - t, 2.5)

    if (ref.current) {
      // Rises from inside bag center (y: bodyY-BODY_H/2 → bodyY+BODY_H*0.35)
      const bodyY = (TOP_CRIMP - BOT_CRIMP) / 2
      const startY = bodyY - BODY_H * 0.15
      const endY = bodyY + BODY_H * 0.35
      ref.current.position.y = startY + (endY - startY) * eased
      ref.current.position.z = BAG_D * 2 + eased * 0.35
      ref.current.scale.setScalar(0.5 + eased * 0.7)
      ref.current.rotation.y += delta * 1.2
      ref.current.rotation.z = Math.sin(Date.now() * 0.003) * 0.15
    }

    if (glowRef.current) {
      if (!Array.isArray(glowRef.current.material)) {
        glowRef.current.material.opacity = 0.3 + Math.sin(Date.now() * 0.004) * 0.15
      }
    }

    if (t >= 1 && !completed.current) {
      completed.current = true
      setTimeout(() => onComplete?.(), 500)
    }
  })

  if (!active) return null

  return (
    <group>
      {/* Tazo body — shiny cylinder */}
      <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.03, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.15}
          metalness={0.6}
          emissive={color}
          emissiveIntensity={0.4}
        />
      </mesh>
      {/* Glow ring */}
      <mesh ref={glowRef} position={[0, 0, 0]}>
        <ringGeometry args={[0.10, 0.16, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

// ══════════════════════════════════════════════════════════
// PARTICLES
// ══════════════════════════════════════════════════════════
function Particles({ active, color }: { active: boolean; color: string }) {
  const count = 50
  const ref = useRef<THREE.Points>(null!)
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i*3] = (Math.random()-0.5)*1.8
      arr[i*3+1] = (Math.random()-0.5)*2.2
      arr[i*3+2] = (Math.random()-0.5)*1.0
    }
    return arr
  }, [])
  const velocities = useMemo(() => Array.from({ length: count }, () => ({
    vx: (Math.random()-0.5)*0.04,
    vy: 0.015 + Math.random()*0.05,
    vz: (Math.random()-0.5)*0.03,
  })), [])
  const animStarted = useRef(false)

  useFrame(() => {
    if (!ref.current) return
    const attr = ref.current.geometry.attributes.position
    if (active) {
      animStarted.current = true
      for (let i=0; i<count; i++) {
        attr.array[i*3] += velocities[i].vx
        attr.array[i*3+1] += velocities[i].vy
        attr.array[i*3+2] += velocities[i].vz
      }
    } else if (animStarted.current) {
      // Keep drifting
      for (let i=0; i<count; i++) {
        attr.array[i*3] += velocities[i].vx * 0.5
        attr.array[i*3+1] += velocities[i].vy * 0.5
        attr.array[i*3+2] += velocities[i].vz * 0.5
      }
    }
    attr.needsUpdate = true
    const mat = ref.current.material
    if (!Array.isArray(mat)) {
      (mat as any).opacity = THREE.MathUtils.lerp((mat as any).opacity, active ? 0.85 : 0, 0.02)
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.035} transparent opacity={0} depthWrite={false} />
    </points>
  )
}

// ══════════════════════════════════════════════════════════
// TEAR CUT LINE
// ══════════════════════════════════════════════════════════
function TearCutLine({ points, color }: { points: { x: number; y: number }[]; color: string }) {
  const bodyY = (TOP_CRIMP - BOT_CRIMP) / 2
  const lineGeo = useMemo(() => {
    if (points.length < 2) return new THREE.BufferGeometry()
    const verts: number[] = []
    for (const p of points) {
      verts.push(p.x, bodyY + p.y + BODY_H / 2, BAG_D / 2 + 0.005)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3))
    return geo
  }, [points, bodyY])

  if (points.length < 2) return null

  return (
    <lineSegments geometry={lineGeo}>
      <lineBasicMaterial color={color} linewidth={1.5} transparent opacity={0.9} depthTest={false} />
    </lineSegments>
  )
}

// ══════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════
export interface BagData {
  id: string
  bagType?: string
  preview?: { franchise?: { slug?: string } } | null
}

interface Props {
  bag: BagData | null
  /** Called when bag is fully opened and tazo has emerged */
  onOpen: () => void
  /** Called to skip directly to reveal */
  onSkip: () => void
}

// ══════════════════════════════════════════════════════════
// STAGES: "idle" → "tearing" → "opening" → "reveal"
// ══════════════════════════════════════════════════════════

export default function BagOpener3D({ bag, onOpen, onSkip }: Props) {
  const { frontUrl, backUrl, franchise } = useMemo(() => {
    const slug = bag?.preview?.franchise?.slug
    return pickBagVariant(slug)
  }, [bag])

  const [stage, setStage] = useState<"idle" | "tearing" | "opening" | "done">("idle")
  const [tearProgress, setTearProgress] = useState(0)
  const tearPaths = useRef<{ x: number; y: number }[]>([])
  const tearing = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasHeight, setCanvasHeight] = useState(480)

  // Responsive height
  useEffect(() => {
    const update = () => {
      const w = containerRef.current?.clientWidth || 500
      setCanvasHeight(Math.min(560, Math.max(380, w * 0.85)))
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  const franchiseColor = useMemo(() => {
    const colors: Record<string, string> = { minimon: "#FFCC00", cybermon: "#3B82F6", dracobell: "#F97316" }
    return colors[franchise] || "#FFCC00"
  }, [franchise])

  // ── Tear handlers ──
  const handlePointerDown = useCallback(() => {
    if (stage === "opening" || stage === "done") return
    tearing.current = true
    tearPaths.current = []
    setStage("tearing")
    setTearProgress(0)
    playSFX('bag_tear', { volume: 0.3 })
  }, [stage])

  const handlePointerMove = useCallback((e: THREE.Event) => {
    if (!tearing.current || stage !== "tearing") return
    const uv = (e as any).uv
    if (!uv) return
    tearPaths.current.push({ x: (uv.x - 0.5) * BAG_W, y: (uv.y - 0.5) * BAG_H })
    const pts = tearPaths.current
    if (pts.length >= 3) {
      const xspan = Math.max(...pts.map(p => p.x)) - Math.min(...pts.map(p => p.x))
      const yspan = Math.max(...pts.map(p => p.y)) - Math.min(...pts.map(p => p.y))
      const coverage = xspan * 2.2 + yspan * 0.5
      const p = Math.min(1, coverage)
      setTearProgress(p)
      if (p >= 0.95) {
        tearing.current = false
        setTearProgress(1)
        playSFX('bag_open', { volume: 0.5 })
        // Smooth transition: keep bag visible → open animation
        setTimeout(() => setStage("opening"), 200)
      }
    }
  }, [stage])

  const handlePointerUp = useCallback(() => {
    tearing.current = false
    if (tearPaths.current.length < 3 && stage === "tearing") {
      setTearProgress(0)
      setStage("idle")
    }
  }, [stage])

  // ── When stage transitions to "done", notify parent ──
  const handleTazoComplete = useCallback(() => {
    setTimeout(() => onOpen(), 600)
  }, [onOpen])

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none touch-none overflow-hidden"
      style={{ height: canvasHeight, background: "#0a0805" }}
    >
      <Canvas
        camera={{ position: [0, 0.05, 1.75], fov: 42 }}
        gl={{ antialias: true, alpha: true, premultipliedAlpha: false }}
        style={{ background: "#0a0805" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x0a0805, 0)
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        }}
      >
        <ambientLight intensity={0.7} />
        <spotLight position={[3, 2, 4]} intensity={3.0} angle={0.4} penumbra={0.5} color="#fffef5" />
        <spotLight position={[-2, 1.5, -3]} intensity={1.6} angle={0.35} penumbra={0.6} color="#fffef5" />
        <pointLight position={[0, -1.5, 3]} intensity={0.6} color="#FFCC00" />

        <Suspense fallback={null}>
          <PotatoChipBag3D
            frontUrl={frontUrl}
            backUrl={backUrl}
            autoRotate={stage === "idle" && tearing.current === false}
            rotationSpeed={0.35}
            scale={1.1}
            interactive={stage === "idle" || stage === "tearing"}
            opening={stage === "opening" || stage === "done"}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />

          {/* Tazo disc emerges when bag is opening */}
          <TazoDisc
            active={stage === "opening" || stage === "done"}
            color={franchiseColor}
            onComplete={handleTazoComplete}
          />
        </Suspense>

        {/* Visible tear cut line */}
        {stage === "tearing" && tearPaths.current.length > 1 && (
          <TearCutLine points={tearPaths.current} color={franchiseColor} />
        )}

        <Particles active={stage === "opening" || stage === "done"} color={franchiseColor} />
      </Canvas>

      {/* ── UI Overlay ── */}
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3 z-10">
        {/* Idle: prompt to start tearing */}
        {stage === "idle" && (
          <div className="flex flex-col items-center gap-1.5">
            <div
              className="px-7 py-3 font-black text-sm uppercase tracking-wider border-3 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              style={{
                backgroundColor: franchiseColor,
                color: "#fff",
                borderColor: "#1a1a1a",
                boxShadow: "4px 4px 0px #1a1a1a",
              }}
            >
              DRAG ACROSS BAG TO OPEN!
            </div>
            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.25em]">
              drag horizontally across the bag
            </span>
          </div>
        )}

        {/* Tearing: show progress + skip */}
        {stage === "tearing" && (
          <div className="flex items-center gap-3">
            <div className="flex-1 max-w-[180px]">
              <div className="h-2.5 bg-black/70 rounded-full overflow-hidden border border-white/20">
                <div
                  className="h-full rounded-full transition-all duration-100"
                  style={{ width: `${Math.round(tearProgress * 100)}%`, backgroundColor: franchiseColor }}
                />
              </div>
            </div>
            <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.15em]">
              {Math.round(tearProgress * 100)}%
            </span>
            <button
              onClick={() => {
                tearing.current = false
                setTearProgress(1)
                setStage("opening")
                playSFX('bag_open', { volume: 0.5 })
              }}
              className="px-3 py-1.5 bg-black/60 border border-white/20 text-white/70 text-[10px] font-black uppercase hover:bg-black/80 transition-colors"
            >
              Skip
            </button>
          </div>
        )}

        {/* Opening: animated message */}
        {stage === "opening" && (
          <div className="px-6 py-2 bg-[#FFCC00]/90 border-3 border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] animate-pulse">
            <span className="font-black text-sm text-[#1a1a1a] uppercase tracking-wider">
              Opening...
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
