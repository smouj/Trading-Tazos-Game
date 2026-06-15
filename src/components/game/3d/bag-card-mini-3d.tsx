// ============================================================
// Trading Tazos Game — BagCardMini3D
// Compact 3D rotating bag for shop cards.
// Auto-rotate, no drag interaction — just a visual preview.
// ============================================================
"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import * as THREE from "three"

// ── Bag geometry (scaled-down potato chip bag) ──
const BAG_W_TOP = 0.72
const BAG_W_BOT = 0.64
const BAG_H = 1.02
const BAG_D = 0.22
const TOP_CRIMP = 0.14
const BOT_CRIMP = 0.10
const BODY_H = BAG_H - TOP_CRIMP - BOT_CRIMP
const BULGE = 0.09

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

function makePillowFaceGeo(wTop: number, wBot: number, h: number, bulge: number, segs: number): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(wTop, h, segs, Math.round(segs * 1.8))
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i)
    const yNorm = y / (h / 2)
    const wAtY = lerp(wBot / 2, wTop / 2, (yNorm + 1) / 2)
    pos.setX(i, x * (wAtY / (wTop / 2)))
    const xN = Math.abs(pos.getX(i)) / wAtY, yN = Math.abs(y) / (h / 2)
    pos.setZ(i, bulge * (1 - Math.pow(xN, 3)) * (1 - Math.pow(yN, 6)) * (1 + 0.4 * Math.sin(xN * Math.PI * 0.85)))
  }
  geo.computeVertexNormals()
  return geo
}

function makeCrimpTexture(): THREE.Texture {
  const c = document.createElement("canvas")
  c.width = 512; c.height = 80
  const ctx = c.getContext("2d")!
  const g = ctx.createLinearGradient(0, 0, 0, 80)
  g.addColorStop(0.0, "#c8c8c8"); g.addColorStop(0.3, "#e8e8e8")
  g.addColorStop(0.5, "#f5f5f5"); g.addColorStop(0.7, "#e0e0e0"); g.addColorStop(1.0, "#c0c0c0")
  ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 80)
  ctx.strokeStyle = "rgba(0,0,0,0.08)"; ctx.lineWidth = 1.5
  for (let row = 0; row < 14; row++) {
    ctx.beginPath()
    const baseY = 5 + row * 5.2
    for (let x = 0; x <= 512; x += 7) {
      const y = baseY + Math.sin(x * 0.14 + row * 0.75) * 1.8
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  tex.minFilter = THREE.LinearMipmapLinearFilter
  tex.magFilter = THREE.LinearFilter
  return tex
}

let _crimpTex: THREE.Texture | null = null
function getCrimpTex(): THREE.Texture {
  if (!_crimpTex) _crimpTex = makeCrimpTexture()
  return _crimpTex
}

// ── Main 3D bag model (mini, auto-rotate only) ──
function MiniBagModel({ frontUrl, backUrl }: { frontUrl: string; backUrl: string }) {
  const groupRef = useRef<THREE.Group>(null!)
  const frontTex = useLoader(THREE.TextureLoader, frontUrl)
  const backTex = useLoader(THREE.TextureLoader, backUrl)
  const crimpTex = useMemo(() => getCrimpTex(), [])
  const pillowGeo = useMemo(() => makePillowFaceGeo(BAG_W_TOP, BAG_W_BOT, BODY_H, BULGE, 18), [])

  useMemo(() => {
    for (const tex of [frontTex, backTex]) {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.minFilter = THREE.LinearMipmapLinearFilter
      tex.magFilter = THREE.LinearFilter
      tex.generateMipmaps = true
    }
  }, [frontTex, backTex])

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.4
  })

  const bodyY = (TOP_CRIMP - BOT_CRIMP) / 2
  const topY = BAG_H / 2 - TOP_CRIMP / 2
  const botY = -BAG_H / 2 + BOT_CRIMP / 2
  const halfD = BAG_D / 2

  return (
    <group ref={groupRef} scale={0.9}>
      <mesh position={[0, botY, 0]}>
        <boxGeometry args={[BAG_W_BOT + 0.015, BOT_CRIMP, BAG_D + 0.015]} />
        <meshStandardMaterial map={crimpTex} roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Front */}
      <mesh position={[0, bodyY, halfD + 0.001]} geometry={pillowGeo}>
        <meshStandardMaterial map={frontTex} roughness={0.25} metalness={0.0} side={THREE.FrontSide} transparent alphaTest={0.01} />
      </mesh>
      {/* Back */}
      <mesh position={[0, bodyY, -halfD - 0.001]} geometry={pillowGeo} rotation={[0, Math.PI, 0]}>
        <meshStandardMaterial map={backTex} roughness={0.25} metalness={0.0} side={THREE.FrontSide} transparent alphaTest={0.01} />
      </mesh>
      {/* Top crimp */}
      <mesh position={[0, topY, 0]}>
        <boxGeometry args={[BAG_W_TOP + 0.015, TOP_CRIMP, BAG_D + 0.025]} />
        <meshStandardMaterial map={crimpTex} roughness={0.5} metalness={0.1} />
      </mesh>
    </group>
  )
}

// ── Export: Compact canvas ──
export default function BagCardMini3D({ frontUrl, backUrl }: { frontUrl: string; backUrl: string }) {
  return (
    <div className="w-full h-[180px] sm:h-[200px]" style={{ background: "transparent" }}>
      <Canvas
        camera={{ position: [0, 0.02, 1.65], fov: 38 }}
        style={{ background: "transparent" }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 2, 3]} intensity={1.5} />
        <directionalLight position={[-1.5, 1, -1.5]} intensity={0.6} color="#ffeecc" />
        <pointLight position={[0, 0.5, 2]} intensity={0.5} color="#FFCC00" />
        <MiniBagModel frontUrl={frontUrl} backUrl={backUrl} />
      </Canvas>
    </div>
  )
}
