// ============================================================
// Trading Tazos Game — PotatoChipBag3D v10
//
// SINGLE CLOSED MESH pillow pouch.
// Body wraps front→right→back→left in one continuous surface.
// NO gap between faces, NO separate panels, NO box geometry.
// Top seal is a separate thin mesh for opening animation.
// ============================================================
"use client"

import { useRef, useMemo, useEffect } from "react"
import { useFrame, useLoader } from "@react-three/fiber"
import * as THREE from "three"

// ── Bag dimensions ──
export const BAG_W_TOP = 0.72
export const BAG_W_BOT = 0.64
export const BAG_H = 1.02
const TOP_CRIMP = 0.08
const BOT_CRIMP = 0.06
export const BODY_H = BAG_H - TOP_CRIMP - BOT_CRIMP
const BULGE = 0.17
const SEAM_INSET = 0.012

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
function easeOutBack(t: number) { const c1 = 1.70158; const c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) }
function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3) }

// ── Color helpers ──
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "")
  return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255]
}
function darkenHex(hex: string, factor: number): string {
  const [r, g, b] = hexToRgb(hex)
  return `#${Math.round(Math.max(0, r * factor) * 255).toString(16).padStart(2, "0")}${Math.round(Math.max(0, g * factor) * 255).toString(16).padStart(2, "0")}${Math.round(Math.max(0, b * factor) * 255).toString(16).padStart(2, "0")}`
}
function lightenHex(hex: string, mix: number): string {
  const [r, g, b] = hexToRgb(hex)
  return `#${Math.round(Math.min(255, (r + (1 - r) * mix) * 255)).toString(16).padStart(2, "0")}${Math.round(Math.min(255, (g + (1 - g) * mix) * 255)).toString(16).padStart(2, "0")}${Math.round(Math.min(255, (b + (1 - b) * mix) * 255)).toString(16).padStart(2, "0")}`
}

// ════════════════════════════════════════════════════════
// PILLOW BODY — single closed mesh wrapping around
//
// Cross-section per ring (top-down view, clockwise from front-left):
//   Front face (segsFace vertices) — inflates +Z
//   → Right seam (segsSide vertices) — tight curve, Z goes +→−  
//   → Back face (segsFace vertices) — inflates −Z
//   → Left seam (segsSide vertices) — tight curve, Z goes −→+
//
// Material groups:
//   0 = front face (front texture)
//   1 = back face (back texture)
//   2 = side seams (bag color)
// ════════════════════════════════════════════════════════
function makePillowBodyGeo(
  wTop: number, wBot: number,
  h: number, bulge: number,
  segsFace: number, segsSide: number, segsH: number
): THREE.BufferGeometry {
  const faceVerts = segsFace
  const sideVerts = segsSide
  const vertsPerRing = faceVerts + sideVerts + faceVerts + sideVerts

  // ── Vertex positions ──
  const positions: number[] = []
  const uvs: number[] = []

  for (let yi = 0; yi <= segsH; yi++) {
    const t = yi / segsH
    const y = (t - 0.5) * h
    const yNorm = Math.abs(y) / (h / 2)
    const wAtY = lerp(wBot / 2, wTop / 2, t)

    // Bulge factor at this height (less at top/bottom, max at center)
    const heightFalloff = Math.pow(1 - Math.pow(yNorm, 5), 2.5)

    // ── Section 1: FRONT FACE (left → right) ──
    for (let xi = 0; xi < faceVerts; xi++) {
      const xNorm = (xi / (faceVerts - 1) - 0.5) * 2  // -1 to 1
      const x = wAtY * xNorm
      // Pillow bulge
      const bulgeFalloff = Math.pow(1 - Math.pow(Math.abs(xNorm), 3), 2)
      const z = bulge * bulgeFalloff * heightFalloff
      positions.push(x, y, z)
      // UV: U from left to right, V from bottom to top
      uvs.push((xNorm + 1) / 2, t)
    }

    // ── Section 2: RIGHT SEAM (front → back) ──
    for (let si = 0; si < sideVerts; si++) {
      const sNorm = (si + 1) / (sideVerts + 1)  // 0..1, avoids exact endpoints
      const rx = wAtY - SEAM_INSET
      // Z smoothly transitions from +bulge to -bulge
      const frontZ = bulge * heightFalloff  // Z at front edge
      const z = frontZ * (1 - 2 * sNorm)  // goes from +bulge to -bulge
      positions.push(rx, y, z)
      uvs.push(sNorm, t)
    }

    // ── Section 3: BACK FACE (right → left) ──
    for (let xi = 0; xi < faceVerts; xi++) {
      const xNorm = (xi / (faceVerts - 1) - 0.5) * 2
      const x = wAtY * (1 - 2 * (xi / (faceVerts - 1)) + (xi / (faceVerts - 1)))  // right to left
      const xPos = wAtY * (1 - (xi / (faceVerts - 1)) * 2)  // from +wAtY to -wAtY
      const bulgeFalloff = Math.pow(1 - Math.pow(Math.abs(xNorm), 3), 2)
      const z = -bulge * bulgeFalloff * heightFalloff
      positions.push(xPos, y, z)
      // UV: U from 0 to 1 (left to right when viewed from back)
      uvs.push(xi / (faceVerts - 1), t)
    }

    // ── Section 4: LEFT SEAM (back → front) ──
    for (let si = 0; si < sideVerts; si++) {
      const sNorm = (si + 1) / (sideVerts + 1)
      const lx = -wAtY + SEAM_INSET
      const backZ = -bulge * heightFalloff
      const z = backZ * (1 - 2 * sNorm) + bulge * heightFalloff * 2 * sNorm
      // Actually: from -bulge to +bulge
      const zFromBack = -bulge * heightFalloff
      const zToFront = bulge * heightFalloff
      const zActual = zFromBack + (zToFront - zFromBack) * sNorm
      positions.push(lx, y, zActual)
      uvs.push(sNorm, t)
    }
  }

  // ── Triangle indices ──
  const indices: number[] = []
  const frontIndices: number[] = []
  const backIndices: number[] = []
  const sideIndices: number[] = []

  const rings = segsH + 1
  for (let yi = 0; yi < segsH; yi++) {
    const r0 = yi * vertsPerRing
    const r1 = (yi + 1) * vertsPerRing

    for (let vi = 0; vi < vertsPerRing; vi++) {
      const vNext = (vi + 1) % vertsPerRing
      const a = r0 + vi, b = r1 + vi, c = r0 + vNext, d = r1 + vNext

      // Determine section for this triangle
      let section: "front" | "back" | "side" = "side"
      if (vi < faceVerts - 1 && vNext < faceVerts) {
        section = "front"
      } else if (vi >= faceVerts + sideVerts && vi < faceVerts + sideVerts + faceVerts - 1) {
        section = "back"
      }

      const target = section === "front" ? frontIndices : section === "back" ? backIndices : sideIndices
      indices.push(a, b, c); target.push(a, b, c)
      indices.push(b, d, c); target.push(b, d, c)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()

  // Material groups: front=0, back=1, sides=2
  geo.clearGroups()
  if (frontIndices.length > 0) geo.addGroup(0, frontIndices.length, 0)
  if (backIndices.length > 0) geo.addGroup(frontIndices.length, backIndices.length, 1)
  if (sideIndices.length > 0) geo.addGroup(frontIndices.length + backIndices.length, sideIndices.length, 2)

  return geo
}

// ════════════════════════════════════════════════════════
// CRIMP SEAL — thin strip for top/bottom
// ════════════════════════════════════════════════════════
function makeCrimpGeo(w: number, h: number, segsW: number): THREE.BufferGeometry {
  const vertices: number[] = []
  const indices: number[] = []
  const uvs: number[] = []
  const overhang = 0.018
  const w2 = w / 2 + overhang
  const rowsW = segsW + 1
  const rowsH = 3
  const depth = 0.006  // Very thin

  for (let yi = 0; yi < rowsH; yi++) {
    const y = (yi / (rowsH - 1) - 0.5) * h
    const wave = Math.sin(yi * 2.5) * 0.004
    for (let xi = 0; xi < rowsW; xi++) {
      const x = (xi / (rowsW - 1) - 0.5) * w2 * 2
      vertices.push(x, y + wave, depth, x, y + wave, -depth)
      uvs.push(xi / (rowsW - 1), yi / (rowsH - 1), xi / (rowsW - 1), yi / (rowsH - 1))
    }
  }

  for (let yi = 0; yi < rowsH - 1; yi++) {
    for (let xi = 0; xi < rowsW - 1; xi++) {
      const a = yi * rowsW * 2 + xi * 2, b = a + 2, c = a + rowsW * 2, d = c + 2
      indices.push(a, c, b, b, c, d)
      indices.push(a + 1, b + 1, c + 1, c + 1, b + 1, d + 1)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3))
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

// ════════════════════════════════════════════════════════
// EDGE TEXTURE — procedural foil crimp
// ════════════════════════════════════════════════════════
function makeEdgeTexture(bagColor: string): THREE.Texture {
  const seamColor = darkenHex(bagColor, 0.65)
  const crimpColor = darkenHex(bagColor, 0.48)
  const highlightColor = lightenHex(bagColor, 0.42)
  const c = document.createElement("canvas")
  c.width = 256; c.height = 64
  const ctx = c.getContext("2d")!
  ctx.fillStyle = seamColor; ctx.fillRect(0, 0, 256, 64)
  for (let i = 0; i < 90; i++) {
    const x = i * 2.84 + Math.sin(i * 0.45) * 1.8
    ctx.strokeStyle = `rgba(255,255,255,${(0.02 + Math.random() * 0.05).toFixed(3)})`
    ctx.lineWidth = 0.5 + Math.random() * 1.1
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 64); ctx.stroke()
  }
  ctx.strokeStyle = crimpColor; ctx.lineWidth = 3
  for (let row = 0; row < 4; row++) {
    const y = 8 + row * 16
    ctx.beginPath()
    for (let x = 0; x < 256; x += 6) {
      const notch = Math.sin(x * 1.2 + row * 2.1) * 3.5
      if (x === 0) ctx.moveTo(x, y + notch); else ctx.lineTo(x, y + notch)
    }
    ctx.stroke()
  }
  ctx.strokeStyle = highlightColor; ctx.globalAlpha = 0.35; ctx.lineWidth = 1.5
  for (let row = 0; row < 4; row++) {
    const y = 6.5 + row * 16
    ctx.beginPath()
    for (let x = 0; x < 256; x += 6) {
      const notch = Math.sin(x * 1.2 + row * 2.1) * 3.5
      if (x === 0) ctx.moveTo(x, y + notch); else ctx.lineTo(x, y + notch)
    }
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  tex.minFilter = THREE.LinearMipmapLinearFilter
  tex.magFilter = THREE.LinearFilter
  return tex
}
const _etc: Record<string, THREE.Texture> = {}
function getEdgeTex(c: string): THREE.Texture { if (!_etc[c]) _etc[c] = makeEdgeTexture(c); return _etc[c] }

// ════════════════════════════════════════════════════════
// PROPS
// ════════════════════════════════════════════════════════
interface Props {
  frontUrl: string; backUrl: string; bagColor?: string; scale?: number
  interactive?: boolean
  onPointerDown?: (e: THREE.Event) => void
  onPointerMove?: (e: THREE.Event) => void
  onPointerUp?: (e: THREE.Event) => void
  opening?: boolean
}

export default function PotatoChipBag3D({
  frontUrl, backUrl, bagColor = "#d4d0c8",
  scale = 1, interactive = false,
  onPointerDown, onPointerMove, onPointerUp, opening = false,
}: Props) {
  const groupRef = useRef<THREE.Group>(null!)
  const topSealRef = useRef<THREE.Group>(null!)
  const bodyRef = useRef<THREE.Mesh>(null!)
  const interiorRef = useRef<THREE.Mesh>(null!)
  const interiorGlowRef = useRef<THREE.PointLight>(null!)
  const openRef = useRef(0)
  const popRef = useRef(0)
  const wasOpening = useRef(false)

  const frontTex = useLoader(THREE.TextureLoader, frontUrl)
  const backTex = useLoader(THREE.TextureLoader, backUrl)
  const edgeTex = useMemo(() => getEdgeTex(bagColor), [bagColor])
  const seamColorHex = useMemo(() => darkenHex(bagColor, 0.65), [bagColor])

  // ═══ GEOMETRIES ═══
  const bodyGeo = useMemo(
    () => makePillowBodyGeo(BAG_W_TOP, BAG_W_BOT, BODY_H, BULGE, 30, 3, 20),
    []
  )
  const topCrimpGeo = useMemo(() => makeCrimpGeo(BAG_W_TOP, TOP_CRIMP, 10), [])
  const botCrimpGeo = useMemo(() => makeCrimpGeo(BAG_W_BOT, BOT_CRIMP, 10), [])

  // Materials for multi-material body
  const bodyMaterials = useMemo(() => [
    new THREE.MeshStandardMaterial({ map: frontTex, roughness: 0.18, metalness: 0.0, side: THREE.FrontSide }),
    new THREE.MeshStandardMaterial({ map: backTex, roughness: 0.18, metalness: 0.0, side: THREE.FrontSide }),
    new THREE.MeshStandardMaterial({ color: seamColorHex, roughness: 0.5, metalness: 0.04, side: THREE.FrontSide }),
  ], [frontTex, backTex, seamColorHex])

  useEffect(() => {
    for (const tex of [frontTex, backTex]) {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.minFilter = THREE.LinearMipmapLinearFilter
      tex.magFilter = THREE.LinearFilter
      tex.generateMipmaps = true
    }
  }, [frontTex, backTex])

  const bodyY = (TOP_CRIMP - BOT_CRIMP) / 2
  const topY = BAG_H / 2 - TOP_CRIMP / 2
  const botY = -BAG_H / 2 + BOT_CRIMP / 2
  const baseScale = scale

  // ── Opening animation: tear top seal off, body pulses ──
  useFrame((_, delta) => {
    const g = groupRef.current
    if (!g) return
    if (opening && !wasOpening.current) popRef.current = 1.0
    wasOpening.current = opening
    popRef.current = Math.max(0, popRef.current - delta * 5)
    openRef.current = THREE.MathUtils.lerp(openRef.current, opening ? 1 : 0, 3.0 * delta)
    const p = Math.max(0, Math.min(1, openRef.current))
    const popEnvelope = Math.sin(popRef.current * Math.PI) * (1 - popRef.current * 0.3)
    g.scale.setScalar(baseScale * (1 + popRef.current * 0.06 * popEnvelope))

    // Top seal: tear off upward
    if (topSealRef.current) {
      const t = easeOutBack(Math.min(1, p / 0.25))
      topSealRef.current.position.y = topY + t * 0.8
      topSealRef.current.position.z = t * 0.4
      topSealRef.current.rotation.x = t * -1.8
      topSealRef.current.rotation.z = t * 0.25
      topSealRef.current.rotation.y = t * Math.sin(Date.now() * 0.004) * 0.4
      if (p > 0.6) {
        topSealRef.current.position.y += (p - 0.6) * delta * 25
        topSealRef.current.rotation.z += delta * 2.5
      }
    }

    // Body: slight squish/pulse, then gap at top
    if (bodyRef.current) {
      const t = easeOutCubic(Math.min(1, Math.max(0, (p - 0.06) / 0.65)))
      // Subtle body response — no splitting needed
      bodyRef.current.scale.y = 1 - t * 0.03
      bodyRef.current.position.y = bodyY - t * 0.015
    }

    // Interior glow
    if (interiorRef.current) {
      const t = easeOutCubic(Math.min(1, Math.max(0, (p - 0.15) / 0.55)))
      interiorRef.current.scale.setScalar(0.3 + t * 0.7)
      if (!Array.isArray(interiorRef.current.material)) interiorRef.current.material.opacity = t * 0.85
    }
    if (interiorGlowRef.current) {
      const t = easeOutCubic(Math.min(1, Math.max(0, (p - 0.2) / 0.5)))
      interiorGlowRef.current.intensity = t * 1.4
      interiorGlowRef.current.intensity *= 1 + Math.sin(Date.now() * 0.008) * 0.3 * t
    }
  })

  return (
    <group ref={groupRef} scale={scale} rotation={[0, -0.04, 0.02]}>
      {/* ── BOTTOM SEAL ── */}
      <mesh geometry={botCrimpGeo} position={[0, botY, 0]}>
        <meshStandardMaterial map={edgeTex} roughness={0.55} metalness={0.06} side={THREE.DoubleSide} />
      </mesh>

      {/* ── BODY — single closed mesh, 3 materials ── */}
      <mesh ref={bodyRef} geometry={bodyGeo} position={[0, bodyY, 0]} material={bodyMaterials}
        onPointerDown={interactive ? onPointerDown : undefined}
        onPointerMove={interactive ? onPointerMove : undefined}
        onPointerUp={interactive ? onPointerUp : undefined}
      />

      {/* ── INTERIOR CAVITY ── */}
      <mesh ref={interiorRef} position={[0, bodyY, 0]}>
        <boxGeometry args={[BAG_W_BOT * 0.5, BODY_H * 0.35, 0.02]} />
        <meshStandardMaterial color="#050302" roughness={0.95} metalness={0} transparent opacity={0} depthWrite />
      </mesh>
      <pointLight ref={interiorGlowRef} position={[0, bodyY + BODY_H * 0.25, 0]} intensity={0} color="#ffdd55" distance={1.5} decay={2} />

      {/* ── TOP SEAL — detachable for opening ── */}
      <group ref={topSealRef} position={[0, topY, 0]}>
        <mesh geometry={topCrimpGeo}>
          <meshStandardMaterial map={edgeTex} roughness={0.55} metalness={0.06} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  )
}
