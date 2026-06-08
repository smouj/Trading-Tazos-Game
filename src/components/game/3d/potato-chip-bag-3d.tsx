// ============================================================
// Trading Tazos Game — PotatoChipBag3D v2
// Supports: tear-open animation (top seal flies off, bag peels open).
// Exports geometry dims for positioning.
// ============================================================
"use client"

import { useRef, useMemo, useEffect } from "react"
import { useFrame, useLoader } from "@react-three/fiber"
import * as THREE from "three"

// ── Shared canvas textures (programmatic) ──
function makeCrimpTexture(): THREE.Texture {
  const c = document.createElement("canvas")
  c.width = 256; c.height = 32
  const ctx = c.getContext("2d")!
  const g = ctx.createLinearGradient(0, 0, 0, 32)
  g.addColorStop(0, "#b0b0b0"); g.addColorStop(0.2, "#d8d8d8")
  g.addColorStop(0.5, "#e8e8e8"); g.addColorStop(0.8, "#c0c0c0")
  g.addColorStop(1, "#909090")
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 32)
  ctx.strokeStyle = "rgba(0,0,0,0.15)"; ctx.lineWidth = 1
  for (let row = 0; row < 8; row++) {
    ctx.beginPath()
    for (let x = 0; x <= 256; x += 8) {
      const y = 4 + row * 3.5 + Math.sin(x * 0.25 + row) * 1.8
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  ctx.strokeStyle = "rgba(0,0,0,0.08)"
  for (let y = 1; y < 31; y += 5) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke() }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

let _crimpTex: THREE.Texture | null = null
function getCrimpTex(): THREE.Texture {
  if (!_crimpTex) _crimpTex = makeCrimpTexture()
  return _crimpTex
}

// ── Bag dimensions ──
const BAG_W = 0.68
const BAG_H = 0.96
const BAG_D = 0.07
const TOP_CRIMP = 0.12
const BOT_CRIMP = 0.08
const BODY_H = BAG_H - TOP_CRIMP - BOT_CRIMP
const BULGE = 0.025

function makeCurvedFaceGeo(width: number, height: number, bulge: number, segments: number): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(width, height, segments, segments * 2)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i); const y = pos.getY(i)
    pos.setZ(i, pos.getZ(i) + bulge * (1 - Math.pow(Math.abs(x) / (width / 2), 2.5)) * (1 - Math.pow(Math.abs(y) / (height / 2), 4)))
  }
  geo.computeVertexNormals()
  return geo
}

// ── Props ──
interface Props {
  frontUrl: string
  backUrl: string
  autoRotate?: boolean
  rotationSpeed?: number
  scale?: number
  hovered?: boolean
  interactive?: boolean
  onPointerDown?: (e: THREE.Event) => void
  onPointerMove?: (e: THREE.Event) => void
  onPointerUp?: (e: THREE.Event) => void
  /** When true, animate bag tearing open */
  opening?: boolean
  /** 0-1 progress of the opening animation */
  openAnim?: number
}

// ── Main export ──
export default function PotatoChipBag3D({
  frontUrl, backUrl,
  autoRotate = true, rotationSpeed = 0.4, scale = 1,
  hovered = false, interactive = false,
  onPointerDown, onPointerMove, onPointerUp,
  opening = false, openAnim = 0,
}: Props) {
  const groupRef = useRef<THREE.Group>(null!)
  const topSealRef = useRef<THREE.Group>(null!)
  const frontRef = useRef<THREE.Group>(null!)
  const backRef = useRef<THREE.Group>(null!)
  const openRef = useRef(0)

  const frontTex = useLoader(THREE.TextureLoader, frontUrl)
  const backTex = useLoader(THREE.TextureLoader, backUrl)
  const crimpTex = useMemo(() => getCrimpTex(), [])
  const curvedGeo = useMemo(() => makeCurvedFaceGeo(BAG_W, BODY_H, BULGE, 16), [])

  useEffect(() => {
    for (const tex of [frontTex, backTex]) {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.minFilter = THREE.LinearMipmapLinearFilter
      tex.magFilter = THREE.LinearFilter
    }
  }, [frontTex, backTex])

  const bodyY = (TOP_CRIMP - BOT_CRIMP) / 2
  const topY = BAG_H / 2 - TOP_CRIMP / 2
  const botY = -BAG_H / 2 + BOT_CRIMP / 2

  // Smooth animation frame
  useFrame((_, delta) => {
    if (!groupRef.current) return
    const g = groupRef.current

    // Rotation
    if (autoRotate) {
      g.rotation.y += rotationSpeed * delta
      g.position.y = Math.sin(Date.now() * 0.0012) * 0.06
    } else {
      // Face front during tear/open
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, 0, 4 * delta)
      g.position.y = THREE.MathUtils.lerp(g.position.y, 0, 4 * delta)
    }

    // Opening animation: lerp toward target
    openRef.current = THREE.MathUtils.lerp(openRef.current, opening ? 1 : 0, 3 * delta)
    const p = Math.max(0, openRef.current)

    if (topSealRef.current) {
      // Top seal flies up and tilts back
      topSealRef.current.position.y = topY + p * 0.45
      topSealRef.current.position.z = p * 0.12
      topSealRef.current.rotation.x = p * -0.55
    }
    if (frontRef.current) {
      // Front face peels open (top edge rotates outward)
      frontRef.current.rotation.x = p * 0.28
      frontRef.current.position.z = BAG_D / 2 + 0.001 + p * 0.03
    }
    if (backRef.current) {
      backRef.current.rotation.x = p * -0.22
      backRef.current.position.z = -BAG_D / 2 - 0.001 - p * 0.03
    }
  })

  return (
    <group ref={groupRef} scale={scale}>
      {/* ── Bottom crimp (stays put) ── */}
      <mesh position={[0, botY, 0]}>
        <boxGeometry args={[BAG_W + 0.005, BOT_CRIMP, BAG_D + 0.005]} />
        <meshStandardMaterial map={crimpTex} roughness={0.4} metalness={0.5} />
      </mesh>

      {/* ── Front face (interactive for tear) ── */}
      <group ref={frontRef}>
        <mesh geometry={curvedGeo} position={[0, bodyY, BAG_D / 2 + 0.001]}
          onPointerDown={interactive ? onPointerDown : undefined}
          onPointerMove={interactive ? onPointerMove : undefined}
          onPointerUp={interactive ? onPointerUp : undefined}
        >
          <meshStandardMaterial map={frontTex} roughness={0.35} metalness={0.05} side={THREE.FrontSide} transparent alphaTest={0.01} />
        </mesh>
      </group>

      {/* ── Back face ── */}
      <group ref={backRef}>
        <mesh geometry={curvedGeo} position={[0, bodyY, -BAG_D / 2 - 0.001]} rotation={[0, Math.PI, 0]}>
          <meshStandardMaterial map={backTex} roughness={0.35} metalness={0.05} side={THREE.FrontSide} transparent alphaTest={0.01} />
        </mesh>
      </group>

      {/* ── Left edge ── */}
      <mesh position={[-BAG_W / 2, bodyY, 0]}>
        <boxGeometry args={[0.02, BODY_H, BAG_D]} />
        <meshStandardMaterial color="#b8b8b8" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* ── Right edge ── */}
      <mesh position={[BAG_W / 2, bodyY, 0]}>
        <boxGeometry args={[0.02, BODY_H, BAG_D]} />
        <meshStandardMaterial color="#b8b8b8" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* ── Top crimp seal (flies off during opening) ── */}
      <group ref={topSealRef}>
        <mesh position={[0, topY, 0]}>
          <boxGeometry args={[BAG_W + 0.005, TOP_CRIMP, BAG_D + 0.005]} />
          <meshStandardMaterial map={crimpTex} roughness={0.4} metalness={0.5} />
        </mesh>
        {/* Tear notch */}
        <mesh position={[BAG_W / 2 + 0.01, topY - TOP_CRIMP / 2 - 0.01, 0]}>
          <boxGeometry args={[0.03, 0.06, BAG_D]} />
          <meshStandardMaterial color="#E3350D" roughness={0.3} />
        </mesh>
        <mesh position={[BAG_W / 2 + 0.015, topY - TOP_CRIMP / 2 - 0.03, 0]}>
          <boxGeometry args={[0.02, 0.025, BAG_D + 0.005]} />
          <meshStandardMaterial color="#E3350D" roughness={0.3} />
        </mesh>
      </group>

      {/* ── Hover glow ── */}
      {hovered && (
        <mesh position={[0, bodyY, BAG_D / 2 + 0.02]}>
          <planeGeometry args={[BAG_W + 0.06, BODY_H + 0.06]} />
          <meshBasicMaterial color="#FFCC00" transparent opacity={0.12} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  )
}

export { BAG_W, BAG_H, BAG_D, TOP_CRIMP, BOT_CRIMP, BODY_H }
