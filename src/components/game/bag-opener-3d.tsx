// ============================================================
// Trading Tazos Game — BagOpener3D (Interactive Tear Edition)
// User drags across the bag to tear it open.
// Proper alpha rendering, dynamic texture cutting, tazo reveal.
// ============================================================
"use client"

import { useRef, useState, useMemo, useEffect, useCallback } from "react"
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber"
import * as THREE from "three"

// ── Bag texture registry ──
const BAG_TEXTURES: Record<string, { front: string[]; back: string[] }> = {
  minimon: {
    front: ["/textures/bags/minimon/bag-minimon-front-01.png", "/textures/bags/minimon/bag-minimon-front-02.png"],
    back: ["/textures/bags/minimon/bag-minimon-back-01.png", "/textures/bags/minimon/bag-minimon-back-02.png"],
  },
  cybermon: {
    front: ["/textures/bags/cybermon/bag-cybermon-front-01.png", "/textures/bags/cybermon/bag-cybermon-front-02.png"],
    back: ["/textures/bags/cybermon/bag-cybermon-back-01.png", "/textures/bags/cybermon/bag-cybermon-back-02.png"],
  },
  dracobell: {
    front: ["/textures/bags/dracobell/bag-dracobell-front-01.png", "/textures/bags/dracobell/bag-dracobell-front-02.png"],
    back: ["/textures/bags/dracobell/bag-dracobell-back-01.png", "/textures/bags/dracobell/bag-dracobell-back-02.png"],
  },
}

function pickBagTexture(franchiseSlug: string | undefined) {
  const slug = franchiseSlug || "minimon"
  const set = BAG_TEXTURES[slug] || BAG_TEXTURES.minimon
  const frontIdx = Math.floor(Math.random() * set.front.length)
  return { url: set.front[frontIdx], franchise: slug }
}

// ── Create torn texture — splits the bag image at tearY ──
function createTornTextures(
  sourceImg: HTMLImageElement,
  tearY: number, // 0-1 normalized Y position
  separation: number // how far apart the halves are (0-1)
): { topHalf: THREE.CanvasTexture; bottomHalf: THREE.CanvasTexture; tearCanvas: HTMLCanvasElement } {
  const sw = sourceImg.width
  const sh = sourceImg.height
  const tearPixelY = Math.floor(tearY * sh)

  // Create a tear mask canvas to apply to the entire bag
  const tearCanvas = document.createElement("canvas")
  tearCanvas.width = sw
  tearCanvas.height = sh
  const tctx = tearCanvas.getContext("2d")!

  // Draw the original image
  tctx.drawImage(sourceImg, 0, 0)

  // Draw the tear line with glow
  const tearAmp = 8 + separation * 20
  tctx.strokeStyle = "#1a1a1a"
  tctx.lineWidth = 3 + separation * 4
  tctx.beginPath()
  tctx.moveTo(0, tearPixelY)
  for (let x = 0; x <= sw; x += 4) {
    const noise = Math.sin(x * 0.015 + separation * 8) * tearAmp
    tctx.lineTo(x, tearPixelY + noise)
  }
  tctx.stroke()

  // Inner glow along tear
  const glowGrad = tctx.createLinearGradient(0, tearPixelY - tearAmp * 2, 0, tearPixelY + tearAmp * 2)
  glowGrad.addColorStop(0, "rgba(255, 204, 0, 0)")
  glowGrad.addColorStop(0.45, "rgba(255, 204, 0, 0.6)")
  glowGrad.addColorStop(0.5, "rgba(255, 180, 0, 0.8)")
  glowGrad.addColorStop(0.55, "rgba(255, 204, 0, 0.6)")
  glowGrad.addColorStop(1, "rgba(255, 204, 0, 0)")
  tctx.fillStyle = glowGrad
  tctx.fillRect(0, tearPixelY - tearAmp * 4, sw, tearAmp * 8)

  // Dark interior "inside the bag" visible in the gap
  const gapSize = separation * 40
  tctx.fillStyle = "rgba(0, 0, 0, 0.7)"
  tctx.fillRect(0, tearPixelY - gapSize, sw, gapSize * 2)

  // Top half texture
  const topCanvas = document.createElement("canvas")
  topCanvas.width = sw
  topCanvas.height = sh
  const tpctx = topCanvas.getContext("2d")!
  tpctx.drawImage(sourceImg, 0, 0, sw, tearPixelY, 0, 0, sw, tearPixelY)

  // Bottom half texture
  const botCanvas = document.createElement("canvas")
  botCanvas.width = sw
  botCanvas.height = sh
  const bpctx = botCanvas.getContext("2d")!
  bpctx.drawImage(sourceImg, 0, tearPixelY, sw, sh - tearPixelY, 0, tearPixelY, sw, sh - tearPixelY)

  const topTex = new THREE.CanvasTexture(topCanvas)
  topTex.colorSpace = THREE.SRGBColorSpace
  topTex.needsUpdate = true

  const botTex = new THREE.CanvasTexture(botCanvas)
  botTex.colorSpace = THREE.SRGBColorSpace
  botTex.needsUpdate = true

  return { topHalf: topTex, bottomHalf: botTex, tearCanvas }
}

// ── 3D Bag with Interactive Tear ──
function InteractiveBag({
  frontUrl, onTearProgress, onTearComplete,
}: {
  frontUrl: string
  onTearProgress: (progress: number) => void
  onTearComplete: () => void
}) {
  const { camera, gl } = useThree()
  const texture = useLoader(THREE.TextureLoader, frontUrl)
  const groupRef = useRef<THREE.Group>(null!)
  const bagMeshRef = useRef<THREE.Mesh>(null!)
  const topRef = useRef<THREE.Mesh>(null!)
  const botRef = useRef<THREE.Mesh>(null!)
  
  const [tearState, setTearState] = useState<{
    active: boolean
    tearY: number
    separation: number
    points: { x: number; y: number }[]
  }>({ active: false, tearY: 0.45, separation: 0, points: [] })

  const tearing = useRef(false)
  const tearComplete = useRef(false)
  const sourceImage = useRef<HTMLImageElement | null>(null)
  const [topTex, setTopTex] = useState<THREE.CanvasTexture | null>(null)
  const [botTex, setBotTex] = useState<THREE.CanvasTexture | null>(null)

  // Load source image for canvas manipulation
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      sourceImage.current = img
    }
    img.src = frontUrl
  }, [frontUrl])

  // Configure texture
  useEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace
      texture.minFilter = THREE.LinearMipmapLinearFilter
      texture.magFilter = THREE.LinearFilter
    }
  }, [texture])

  // Pointer handlers for interactive tearing
  const getBagUV = useCallback((clientX: number, clientY: number): { x: number; y: number } | null => {
    if (!bagMeshRef.current) return null
    const rect = gl.domElement.getBoundingClientRect()
    const mouse = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    )
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObject(bagMeshRef.current)
    if (intersects.length > 0) {
      const uv = intersects[0].uv!
      return { x: uv.x, y: 1 - uv.y } // invert Y for top-down
    }
    return null
  }, [camera, gl])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (tearComplete.current) return
    const uv = getBagUV(e.clientX, e.clientY)
    if (uv && uv.y > 0.1 && uv.y < 0.9) {
      tearing.current = true
      setTearState(s => ({
        active: true,
        tearY: uv.y,
        separation: s.separation,
        points: [{ x: uv.x, y: uv.y }],
      }))
    }
  }, [getBagUV])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!tearing.current || tearComplete.current) return
    const uv = getBagUV(e.clientX, e.clientY)
    if (uv) {
      setTearState(s => {
        const newPoints = [...s.points, { x: uv.x, y: uv.y }]
        const avgY = newPoints.reduce((sum, p) => sum + p.y, 0) / newPoints.length
        // Progress: how far across the bag (x spread) + how many points
        const xSpread = Math.max(...newPoints.map(p => p.x)) - Math.min(...newPoints.map(p => p.x))
        const separation = Math.min(1, xSpread * 1.5 + newPoints.length * 0.008)
        
        onTearProgress(Math.min(1, separation))
        
        // Generate torn textures
        if (sourceImage.current && separation > 0.05) {
          const { topHalf, bottomHalf } = createTornTextures(sourceImage.current, avgY, separation)
          setTopTex(topHalf)
          setBotTex(bottomHalf)
        }

        // Check if tear is complete (enough horizontal spread)
        if (separation >= 1 && !tearComplete.current) {
          tearComplete.current = true
          tearing.current = false
          setTimeout(() => onTearComplete(), 300)
        }

        return { active: true, tearY: avgY, separation, points: newPoints.slice(-50) }
      })
    }
  }, [getBagUV, onTearProgress, onTearComplete])

  const handlePointerUp = useCallback(() => {
    tearing.current = false
  }, [])

  // Float animation
  useFrame((_, delta) => {
    if (!groupRef.current) return
    const s = tearState.separation
    
    if (s > 0 && topRef.current && botRef.current) {
      // Separate the halves
      topRef.current.position.y = s * 0.3
      topRef.current.rotation.z = -s * 0.08
      botRef.current.position.y = -s * 0.3
      botRef.current.rotation.z = s * 0.05
    } else {
      // Idle float
      groupRef.current.position.y = Math.sin(Date.now() * 0.0015) * 0.12
      groupRef.current.rotation.y = Math.sin(Date.now() * 0.0008) * 0.1
    }
  })

  const bagGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1.6, 2.2, 32, 32)
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const bulge = 0.05 * (1 - Math.abs(x) * 1.5) * (1 - Math.abs(y) * 1.3)
      pos.setZ(i, bulge)
    }
    geo.computeVertexNormals()
    return geo
  }, [])

  const separation = tearState.separation

  return (
    <group ref={groupRef}>
      {/* Whole bag — shown before tearing */}
      {separation < 0.15 && (
        <mesh ref={bagMeshRef} geometry={bagGeo}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <meshBasicMaterial 
            map={texture} 
            side={THREE.FrontSide}
            transparent={false}
          />
        </mesh>
      )}

      {/* Torn halves — shown during/after tearing */}
      {separation >= 0.15 && topTex && botTex && (
        <>
          {/* Top half */}
          <mesh ref={topRef} geometry={bagGeo}>
            <meshBasicMaterial map={topTex} side={THREE.FrontSide} transparent />
          </mesh>
          {/* Bottom half */}
          <mesh ref={botRef} geometry={bagGeo}>
            <meshBasicMaterial map={botTex} side={THREE.FrontSide} transparent />
          </mesh>
          {/* Interactive overlay for continued tearing */}
          <mesh geometry={bagGeo}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <meshBasicMaterial visible={false} />
          </mesh>
        </>
      )}

      {/* Edge seals */}
      <mesh position={[0, 1.12, 0.02]}>
        <boxGeometry args={[1.62, 0.04, 0.04]} />
        <meshStandardMaterial color="#999" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[0, -1.12, 0.02]}>
        <boxGeometry args={[1.62, 0.04, 0.04]} />
        <meshStandardMaterial color="#999" roughness={0.6} metalness={0.2} />
      </mesh>
    </group>
  )
}

// ── Particle burst on reveal ──
function Particles({ active }: { active: boolean }) {
  const count = 30
  const ref = useRef<THREE.Points>(null!)
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 2
      arr[i * 3 + 1] = (Math.random() - 0.5) * 2
      arr[i * 3 + 2] = (Math.random() - 0.5) * 1
    }
    return arr
  }, [])
  useFrame(() => {
    if (!ref.current || !active) return
    ref.current.rotation.y += 0.015
    const attr = ref.current.geometry.attributes.position
    for (let i = 0; i < count; i++) {
      attr.array[i * 3 + 1] += 0.015
      attr.array[i * 3] += (Math.random() - 0.5) * 0.015
    }
    attr.needsUpdate = true
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#FFCC00" size={0.04} transparent opacity={0.8} depthWrite={false} />
    </points>
  )
}

// ── Types ──
export interface BagData {
  id: string
  bagType?: string
  preview?: { franchise?: { slug?: string } } | null
}

interface BagOpener3DProps {
  bag: BagData | null
  opening: boolean
  progress: number
  onOpen: () => void
  onSkip: () => void
}

// ── Main ──
export default function BagOpener3D({ bag, opening, progress, onOpen, onSkip }: BagOpener3DProps) {
  const { url, franchise } = useMemo(() => {
    const slug = bag?.preview?.franchise?.slug
    return pickBagTexture(slug)
  }, [bag])

  const [tearProgress, setTearProgress] = useState(progress)
  const [revealed, setRevealed] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const franchiseColor = useMemo(() => {
    const colors: Record<string, string> = { minimon: "#22C55E", cybermon: "#3B82F6", dracobell: "#F97316" }
    return colors[franchise] || "#FFCC00"
  }, [franchise])

  const handleTearProgress = useCallback((p: number) => {
    setTearProgress(p)
  }, [])

  const handleTearComplete = useCallback(() => {
    setRevealed(true)
    onOpen()
  }, [onOpen])

  return (
    <div ref={containerRef} className="relative w-full h-[420px] sm:h-[480px] select-none touch-none"
      style={{ background: "radial-gradient(ellipse at center, #1a1810 0%, #0a0805 100%)" }}
    >
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 40 }}
        gl={{
          antialias: true,
          alpha: false,
          premultipliedAlpha: false,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
        }}
      >
        <color attach="background" args={[0x000000]} />
        <ambientLight intensity={1.0} />
        <spotLight position={[3, 2, 4]} intensity={2.2} angle={0.5} penumbra={0.5} color="#fffef0" />
        <spotLight position={[-2, 1, -3]} intensity={1.0} angle={0.4} penumbra={0.6} color="#fffef0" />
        <pointLight position={[0, -2, 2]} intensity={0.6} color="#FFCC00" />

        <InteractiveBag
          frontUrl={url}
          onTearProgress={handleTearProgress}
          onTearComplete={handleTearComplete}
        />
        
        <Particles active={revealed} />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3 z-10">
        {!opening && tearProgress < 0.02 && (
          <button
            onClick={() => {
              // Trigger tear by simulating a click-and-drag via the pointer events
              // Instead, just tell them to drag
            }}
            className="px-8 py-3 font-black text-sm uppercase tracking-wider border-3 animate-pulse cursor-pointer"
            style={{
              backgroundColor: franchiseColor,
              color: "#fff",
              borderColor: "#1a1a1a",
              boxShadow: "4px 4px 0px #1a1a1a",
            }}
          >
            ✂️ Drag across bag to tear open!
          </button>
        )}

        {tearProgress > 0.02 && tearProgress < 1 && (
          <div className="flex items-center gap-3">
            <div className="flex-1 max-w-[180px]">
              <div className="h-2.5 bg-black/70 rounded-full overflow-hidden border border-white/20">
                <div
                  className="h-full rounded-full transition-all duration-100"
                  style={{
                    width: `${Math.round(tearProgress * 100)}%`,
                    backgroundColor: franchiseColor,
                  }}
                />
              </div>
            </div>
            <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.15em]">
              {Math.round(tearProgress * 100)}%
            </span>
            <button
              onClick={onSkip}
              className="px-3 py-1.5 bg-black/60 border border-white/20 text-white/70 text-[10px] font-black uppercase hover:bg-black/80 hover:text-white transition-colors"
            >
              Skip
            </button>
          </div>
        )}

        {revealed && (
          <div className="px-6 py-2 bg-[#FFCC00] border-3 border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a]">
            <span className="font-black text-sm text-[#1a1a1a] uppercase tracking-wider">✨ Tazo Revealed!</span>
          </div>
        )}
      </div>
    </div>
  )
}
