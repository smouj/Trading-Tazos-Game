// ============================================================
// Trading Tazos Game — 3D Potato Chip Bag Model
// Realistic chip bag with crinkles, color, and opening animation.
// ============================================================
"use client"

import { useRef, useMemo, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { Text } from "@react-three/drei"

interface ChipBag3DProps {
  color?: string
  brand?: string
  isOpen?: boolean
  tearProgress?: number // 0-1, controlled externally
  onClick?: () => void
  size?: number
}

export default function ChipBag3D({
  color = "#FFCC00",
  brand = "TAZOS",
  isOpen = false,
  tearProgress = 0,
  onClick,
  size = 1.2,
}: ChipBag3DProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const [hovered, setHovered] = useState(false)
  const wiggleRef = useRef(0)

  const bagWidth = size
  const bagHeight = size * 1.6
  const bagDepth = size * 0.25
  const wrinkleCount = 8

  // ─── Bag texture ─────
  const bagTexture = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 512
    canvas.height = 768
    const ctx = canvas.getContext("2d")!

    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, 768)
    grad.addColorStop(0, color)
    grad.addColorStop(0.3, lightenColor(color, 20))
    grad.addColorStop(0.5, color)
    grad.addColorStop(0.7, lightenColor(color, -10))
    grad.addColorStop(1, darkenColor(color, 30))
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 512, 768)

    // Crinkles / stripes
    ctx.strokeStyle = "rgba(255,255,255,0.08)"
    ctx.lineWidth = 2
    for (let i = 0; i < 20; i++) {
      const y = i * 40 + (Math.sin(i * 0.7) * 10)
      ctx.beginPath()
      ctx.moveTo(0, y)
      for (let x = 0; x < 512; x += 10) {
        ctx.lineTo(x, y + Math.sin(x * 0.05 + i) * 3)
      }
      ctx.stroke()
    }

    // Brand text
    ctx.fillStyle = "#fff"
    ctx.font = "bold 80px 'Geist', 'Impact', sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(brand, 256, 200)

    // "PATATAS" subtitle
    ctx.font = "bold 32px 'Geist', sans-serif"
    ctx.fillStyle = "rgba(255,255,255,0.8)"
    ctx.fillText("PATATAS", 256, 260)

    // "1 TAZO SORPRESA" badge
    ctx.fillStyle = "#fff"
    ctx.font = "bold 28px 'Geist', sans-serif"
    const badgeY = 460
    ctx.fillStyle = "rgba(0,0,0,0.3)"
    ctx.fillRect(76, badgeY - 35, 360, 70)
    ctx.fillStyle = "#fff"
    ctx.fillText("🥔 1 TAZO SORPRESA", 256, badgeY + 15)

    // Decorative tazo icon circles
    for (let i = 0; i < 5; i++) {
      const x = 100 + i * 85
      ctx.strokeStyle = "rgba(255,255,255,0.15)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, 570, 30, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillStyle = ["#FFCB05", "#FF6B00", "#00A1E9", "#E3350D", "#22C55E"][i]
      ctx.beginPath()
      ctx.arc(x, 570, 24, 0, Math.PI * 2)
      ctx.fill()
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.minFilter = THREE.LinearMipmapLinearFilter
    tex.magFilter = THREE.LinearFilter
    tex.generateMipmaps = true
    return tex
  }, [color, brand])

  // ─── Wrinkle deformation ─────
  const bagGeometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(bagWidth, bagHeight, bagDepth, 8, 16, 2)
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const z = pos.getZ(i)
      // Add subtle bulge
      const bulgeZ = z + Math.sin(y * 2.5) * 0.04 + Math.sin(x * 3) * 0.03
      pos.setZ(i, bulgeZ)
    }
    geo.computeVertexNormals()
    return geo
  }, [bagWidth, bagHeight, bagDepth])

  // ─── Tear geometry (top portion that opens) ─────
  const tearHeight = bagHeight * 0.15
  const tearY = bagHeight / 2 - tearHeight / 2
  const tearOpen = isOpen ? 0.8 * tearProgress : 0

  useFrame((_, delta) => {
    if (groupRef.current) {
      // Gentle float
      wiggleRef.current += delta
      const float = Math.sin(wiggleRef.current * 1.5) * 0.05
      groupRef.current.position.y = float
      
      // Hover scale
      const targetScale = hovered ? 1.05 : 1
      groupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      )
    }
  })

  return (
    <group
      ref={groupRef}
      onClick={onClick}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Main bag body */}
      <mesh geometry={bagGeometry} position={[0, 0, 0]}>
        <meshStandardMaterial
          map={bagTexture}
          roughness={0.6}
          metalness={0.05}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Tear flap — top portion peeling back */}
      {tearProgress > 0 && (
        <mesh
          position={[0, tearY, 0.15]}
          rotation={[THREE.MathUtils.degToRad(-30 * tearProgress), 0, 0]}
        >
          <planeGeometry args={[bagWidth * 0.9, tearHeight * 0.8]} />
          <meshStandardMaterial
            map={bagTexture}
            roughness={0.6}
            metalness={0.05}
            side={THREE.DoubleSide}
            transparent
            opacity={tearProgress}
          />
        </mesh>
      )}

      {/* Serrated top edge */}
      <mesh position={[0, bagHeight / 2, 0]}>
        <planeGeometry args={[bagWidth * 0.9, 0.05]} />
        <meshStandardMaterial
          color="#333"
          roughness={0.4}
          metalness={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// Color helpers
function lightenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16)
  const r = Math.min(255, ((num >> 16) & 0xFF) + amount)
  const g = Math.min(255, ((num >> 8) & 0xFF) + amount)
  const b = Math.min(255, (num & 0xFF) + amount)
  return `rgb(${r},${g},${b})`
}

function darkenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16)
  const r = Math.max(0, ((num >> 16) & 0xFF) - amount)
  const g = Math.max(0, ((num >> 8) & 0xFF) - amount)
  const b = Math.max(0, (num & 0xFF) - amount)
  return `rgb(${r},${g},${b})`
}
