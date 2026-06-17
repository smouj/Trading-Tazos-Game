// ============================================================
// Trading Tazos Game — BagCardMini3D v10
//
// Pillow-pouch bag with 6 separated sub-meshes:
//   FrontPanel (textured)  BackPanel (textured)
//   LeftSeam   (solid)     RightSeam  (solid)
//   TopSeal    (solid)     BottomSeal (solid)
//
// Front/back textures: full UV 0→1, ClampToEdge, no stretch.
// Sides & seals: solid bagColor-derived materials.
// Franchise-specific static rotation for best shop-card angle.
// ============================================================
"use client"

import { useRef, useMemo, useEffect } from "react"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import * as THREE from "three"

// ── Bag dimensions (normalised) ──
const BW_TOP = 0.72
const BW_BOT = 0.64
const BH = 0.94
const BD = 0.16
const SH = 0.055
const SW = 0.028
const SEGS_W = 40
const SEGS_H = 12

// ── Helpers ──
function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

function darkenRgb(hex: string, factor: number): [number, number, number] {
  const h = hex.replace("#", "")
  return [
    Math.max(0, parseInt(h.slice(0, 2), 16) / 255 * factor),
    Math.max(0, parseInt(h.slice(2, 4), 16) / 255 * factor),
    Math.max(0, parseInt(h.slice(4, 6), 16) / 255 * factor),
  ]
}

// ── Geometry builders ──

/** Textured face panel (front or back).
 *  Trapezoid that bulges outward in Z.
 *  UVs: u = 0→1 left→right, v = 0→1 bottom→top. */
function buildPanelGeo(front: boolean): THREE.BufferGeometry {
  const zSign = front ? 1 : -1
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  for (let yi = 0; yi <= SEGS_H; yi++) {
    const t = yi / SEGS_H
    const y = (t - 0.5) * BH
    const halfW = lerp(BW_BOT / 2, BW_TOP / 2, t)
    const depthFactor = Math.pow(1 - Math.pow(Math.abs(y) / (BH / 2), 6), 3)
    const bulgeZ = BD * depthFactor

    for (let xi = 0; xi <= SEGS_W; xi++) {
      const u = xi / SEGS_W
      const x = lerp(-halfW, halfW, u)
      const xNorm = x / halfW
      const z = bulgeZ * Math.pow(1 - Math.pow(Math.abs(xNorm), 2.5), 1 / 2.5) * zSign

      positions.push(x, y, z)
      uvs.push(u, t)
    }
  }

  const rowLen = SEGS_W + 1
  for (let yi = 0; yi < SEGS_H; yi++) {
    for (let xi = 0; xi < SEGS_W; xi++) {
      const a = yi * rowLen + xi
      const b = a + 1
      const c = a + rowLen
      const d = c + 1
      if (front) { indices.push(a, b, c, b, d, c) }
      else       { indices.push(a, c, b, b, c, d) }
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

/** Seal strip (top or bottom crimp) — thin slab with front/back/edges. */
function buildSealGeo(top: boolean): THREE.BufferGeometry {
  const yBody = top ? BH / 2 : -BH / 2
  const yOuter = top ? BH / 2 + SH : -BH / 2 - SH
  const halfW = top ? BW_TOP / 2 : BW_BOT / 2
  const dz = 0.01
  const segsV = 4

  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  // Front face (z=+dz)
  for (let yi = 0; yi <= segsV; yi++) {
    const t = yi / segsV
    const y = lerp(yBody, yOuter, t)
    for (let xi = 0; xi <= SEGS_W; xi++) {
      const u = xi / SEGS_W
      positions.push(lerp(-halfW, halfW, u), y, dz)
      uvs.push(u, t)
    }
  }
  const rowLen = SEGS_W + 1
  const frontCount = (segsV + 1) * rowLen

  // Back face (z=-dz)
  for (let yi = 0; yi <= segsV; yi++) {
    const t = yi / segsV
    const y = lerp(yBody, yOuter, t)
    for (let xi = 0; xi <= SEGS_W; xi++) {
      const u = xi / SEGS_W
      positions.push(lerp(-halfW, halfW, u), y, -dz)
      uvs.push(u, t)
    }
  }

  // Front triangles
  for (let yi = 0; yi < segsV; yi++) {
    for (let xi = 0; xi < SEGS_W; xi++) {
      const a = yi * rowLen + xi, b = a + 1, c = a + rowLen, d = c + 1
      indices.push(a, b, c, b, d, c)
    }
  }
  // Back triangles
  for (let yi = 0; yi < segsV; yi++) {
    for (let xi = 0; xi < SEGS_W; xi++) {
      const a = frontCount + yi * rowLen + xi, b = a + 1, c = a + rowLen, d = c + 1
      indices.push(a, c, b, b, c, d)
    }
  }
  // Top & bottom caps connecting front↔back
  for (let xi = 0; xi < SEGS_W; xi++) {
    const fTop = segsV * rowLen + xi
    const bTop = frontCount + segsV * rowLen + xi
    indices.push(fTop, bTop, fTop + 1, fTop + 1, bTop, bTop + 1)
    const fBot = xi
    const bBot = frontCount + xi
    indices.push(fBot, fBot + 1, bBot, fBot + 1, bBot + 1, bBot)
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

/** Side seam strip — runs vertically along left or right folded edge. */
function buildSideSeamGeo(right: boolean): THREE.BufferGeometry {
  const xSign = right ? 1 : -1
  const segsD = 8

  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  for (let yi = 0; yi <= SEGS_H; yi++) {
    const t = yi / SEGS_H
    const y = (t - 0.5) * BH
    const halfW = lerp(BW_BOT / 2, BW_TOP / 2, t)
    const depthFactor = Math.pow(1 - Math.pow(Math.abs(y) / (BH / 2), 6), 3)
    const bulgeZ = BD * depthFactor

    for (let di = 0; di <= segsD; di++) {
      const dt = di / segsD
      const angle = Math.PI / 2 + dt * Math.PI
      const cosA = Math.cos(angle)
      const sinA = Math.sin(angle)

      const xEdge = xSign * halfW + cosA * SW
      const zEdge = sinA * (bulgeZ + SW * 0.55)

      positions.push(xEdge, y, zEdge)
      uvs.push(dt, t)
    }
  }

  const rowLen = segsD + 1
  for (let yi = 0; yi < SEGS_H; yi++) {
    for (let di = 0; di < segsD; di++) {
      const a = yi * rowLen + di, b = a + 1, c = a + rowLen, d = c + 1
      indices.push(a, b, c, b, d, c)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

// ── Franchise rotations ──
const FRANCHISE_ROT_Y: Record<string, number> = {
  minimon: -0.25,
  cybermon: 0.15,
  dracobell: 0.25,
}
const TILT_X = -0.09

// ── Inner model ──
function MiniBagModel({ frontUrl, backUrl, bagColor, franchiseSlug }: {
  frontUrl: string; backUrl: string; bagColor: string; franchiseSlug?: string
}) {
  const groupRef = useRef<THREE.Group>(null!)
  const frontTex = useLoader(THREE.TextureLoader, frontUrl)
  const backTex = useLoader(THREE.TextureLoader, backUrl)

  const rotY = FRANCHISE_ROT_Y[franchiseSlug || ""] ?? -0.15

  const [sr, sg, sb] = useMemo(() => darkenRgb(bagColor, 0.55), [bagColor])
  const sealColor = useMemo(() => new THREE.Color(sr, sg, sb), [sr, sg, sb])
  const sideColor = useMemo(() => {
    const [r, g, b] = darkenRgb(bagColor, 0.42)
    return new THREE.Color(r, g, b)
  }, [bagColor])

  const frontGeo = useMemo(() => buildPanelGeo(true), [])
  const backGeo = useMemo(() => buildPanelGeo(false), [])
  const topSealGeo = useMemo(() => buildSealGeo(true), [])
  const bottomSealGeo = useMemo(() => buildSealGeo(false), [])
  const leftSeamGeo = useMemo(() => buildSideSeamGeo(false), [])
  const rightSeamGeo = useMemo(() => buildSideSeamGeo(true), [])

  const fMat = useMemo(() => new THREE.MeshStandardMaterial({
    map: frontTex, roughness: 0.15, metalness: 0, side: THREE.FrontSide,
  }), [frontTex])
  const bMat = useMemo(() => new THREE.MeshStandardMaterial({
    map: backTex, roughness: 0.15, metalness: 0, side: THREE.FrontSide,
  }), [backTex])
  const sealMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: sealColor, roughness: 0.55, metalness: 0.02, side: THREE.FrontSide,
  }), [sealColor])
  const sideMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: sideColor, roughness: 0.45, metalness: 0.03, side: THREE.FrontSide,
  }), [sideColor])

  useEffect(() => {
    for (const tex of [frontTex, backTex]) {
      tex.wrapS = THREE.ClampToEdgeWrapping
      tex.wrapT = THREE.ClampToEdgeWrapping
      tex.colorSpace = THREE.SRGBColorSpace
      tex.minFilter = THREE.LinearMipmapLinearFilter
      tex.magFilter = THREE.LinearFilter
      tex.generateMipmaps = true
      tex.repeat.set(1, 1)
      tex.offset.set(0, 0)
      tex.needsUpdate = true
    }
  }, [frontTex, backTex])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = rotY + Math.sin(Date.now() * 0.0008) * 0.06
    }
  })

  return (
    <group ref={groupRef} scale={0.92} rotation={[TILT_X, rotY, 0]}>
      <mesh geometry={frontGeo} material={fMat} />
      <mesh geometry={backGeo} material={bMat} />
      <mesh geometry={topSealGeo} material={sealMat} />
      <mesh geometry={bottomSealGeo} material={sealMat} />
      <mesh geometry={leftSeamGeo} material={sideMat} />
      <mesh geometry={rightSeamGeo} material={sideMat} />
    </group>
  )
}

// ── Public component ──
export default function BagCardMini3D({ frontUrl, backUrl, bagColor = "#d4d0c8", franchiseSlug }: {
  frontUrl: string; backUrl: string; bagColor?: string; franchiseSlug?: string
}) {
  return (
    <div className="w-full h-[180px] sm:h-[200px]" style={{ background: "transparent" }}>
      <Canvas
        camera={{ position: [0, 0.05, 1.7], fov: 40 }}
        style={{ background: "transparent" }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.65} />
        <directionalLight position={[3, 2.5, 4]} intensity={1.6} />
        <directionalLight position={[-2, 1.5, -2]} intensity={0.5} color="#ffeecc" />
        <pointLight position={[0, 0.8, 2.5]} intensity={0.4} color="#FFCC00" />
        <MiniBagModel
          frontUrl={frontUrl}
          backUrl={backUrl}
          bagColor={bagColor}
          franchiseSlug={franchiseSlug}
        />
      </Canvas>
    </div>
  )
}
