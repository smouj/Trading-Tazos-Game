// ============================================================
// Trading Tazos Game — 3D Tazo Gallery (Album View)
// Magazine-styled 3D gallery grid with orbiting tazo discs.
// ============================================================
"use client"

import { Suspense, useRef, useState, useMemo, useCallback } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Text, ContactShadows, PerspectiveCamera } from "@react-three/drei"
import TazoDisc3D from "./tazo-disc-3d"
import * as THREE from "three"

// ─── Tazo data shape ─────
export interface GalleryTazo {
  id: string
  name: string
  displayName: string
  number: string
  imageUrl: string
  rarity: string
  franchise: string
  franchiseSlug: string
  attack: number
  defense: number
  speed?: number
}

interface TazoGallery3DProps {
  tazos: GalleryTazo[]
  selectedFranchise: string
  className?: string
  style?: React.CSSProperties
  onTazoClick?: (tazo: GalleryTazo) => void
}

// ─── Ground plane with magazine crease lines ─────
function MagazineGround() {
  return (
    <mesh rotation={[Math.PI / -2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial
        color="#fffef0"
        roughness={0.9}
        metalness={0}
        side={THREE.FrontSide}
      />
    </mesh>
  )
}

// ─── Colored section strip on the floor ─────
function SectionStrip({
  color,
  position,
  width,
}: {
  color: string
  position: [number, number, number]
  width: number
}) {
  return (
    <mesh position={position} rotation={[Math.PI / -2, 0, 0]} receiveShadow>
      <planeGeometry args={[width, 0.15]} />
      <meshStandardMaterial
        color={color}
        roughness={0.3}
        metalness={0.6}
        side={THREE.FrontSide}
        emissive={color}
        emissiveIntensity={0.3}
      />
    </mesh>
  )
}

// ─── Floating label for franchise section ─────
function FranchiseLabel({
  text,
  color,
  position,
}: {
  text: string
  color: string
  position: [number, number, number]
}) {
  return (
    <Text
      position={position}
      fontSize={0.4}
      color={color}
      font="/fonts/Geist-Bold.ttf"
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.02}
      outlineColor="#1a1a1a"
    >
      {text}
    </Text>
  )
}

// ─── Tazo disc on a pedestal ─────
function GalleryTazoDisc({
  tazo,
  position,
  onClick,
}: {
  tazo: GalleryTazo
  position: [number, number, number]
  onClick?: (tazo: GalleryTazo) => void
}) {
  const groupRef = useRef<THREE.Group>(null!)
  const [hovered, setHovered] = useState(false)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.5 * delta
      // Hover float
      const targetY = hovered ? position[1] + 0.3 : position[1]
      groupRef.current.position.lerp(
        new THREE.Vector3(position[0], targetY, position[2]),
        0.1
      )
    }
  })

  const rarityGlow: Record<string, string> = {
    common: "#9CA3AF",
    uncommon: "#22C55E",
    rare: "#3B82F6",
    "ultra-rare": "#A855F7",
    legendary: "#F59E0B",
  }

  const glowColor = rarityGlow[tazo.rarity] || "#9CA3AF"

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onClick={() => onClick?.(tazo)}
    >
      {/* Pedestal */}
      <mesh position={[0, -0.6, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.35, 0.3, 32]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Pedestal base glow ring */}
      {hovered && (
        <mesh position={[0, -0.45, 0]} rotation={[Math.PI / -2, 0, 0]}>
          <torusGeometry args={[0.38, 0.04, 16, 32]} />
          <meshStandardMaterial
            color={glowColor}
            roughness={0.2}
            metalness={0.1}
            emissive={glowColor}
            emissiveIntensity={0.8}
          />
        </mesh>
      )}

      {/* Tazo disc */}
      <TazoDisc3D
        name={tazo.name}
        franchise={tazo.franchiseSlug}
        size={0.6}
        rotationSpeed={0.7}
        autoRotate={true}
        onClick={() => onClick?.(tazo)}
      />
    </group>
  )
}

// ─── Ambient particles (dust motes in magazine light) ─────
function DustParticles({ count = 80 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null!)
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20
      pos[i * 3 + 1] = Math.random() * 8 - 1
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return pos
  }, [count])

  useFrame((_, delta) => {
    if (pointsRef.current) {
      const pos = pointsRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] += delta * 0.05
        if (pos[i * 3 + 1] > 8) pos[i * 3 + 1] = -1
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#FFCC00"
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

// ─── Scene content ─────
function GalleryScene({
  tazos,
  selectedFranchise,
  onTazoClick,
}: {
  tazos: GalleryTazo[]
  selectedFranchise: string
  onTazoClick?: (tazo: GalleryTazo) => void
}) {
  const controlsRef = useRef<any>(null!)

  const { sections, layout } = useMemo(() => {
    const franchiseColors: Record<string, string> = {
      minimon: "#FFCB05",
      dracobell: "#FF6B00",
      cybermon: "#00A1E9",
    }
    const sections: {
      franchise: string
      color: string
      tazos: GalleryTazo[]
    }[] = []

    const allFranchises = ["minimon", "dracobell", "cybermon"]
    for (const f of allFranchises) {
      const ft = tazos.filter((t) => t.franchiseSlug === f)
      if (ft.length > 0 && (selectedFranchise === "all" || selectedFranchise === f)) {
        sections.push({ franchise: f, color: franchiseColors[f] || "#888", tazos: ft })
      }
    }

    return { sections, layout: sections }
  }, [tazos, selectedFranchise])

  const handleTazoClick = useCallback(
    (tazo: GalleryTazo) => onTazoClick?.(tazo),
    [onTazoClick]
  )

  if (sections.length === 0) {
    return (
      <>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 5]} intensity={0.8} castShadow />
        <Text
          position={[0, 1, 0]}
          fontSize={0.6}
          color="#1a1a1a"
          anchorX="center"
          anchorY="middle"
        >
          NO TAZOS FOUND
        </Text>
        <MagazineGround />
        <ContactShadows position={[0, -1.2, 0]} opacity={0.2} scale={15} blur={2} />
        <OrbitControls ref={controlsRef} enablePan={true} enableZoom={true} />
        <DustParticles />
      </>
    )
  }

  // Spread sections horizontally
  const sectionSpacing = 5
  const discsPerRow = 5
  const discSpacing = 1.8

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[8, 12, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={30}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-5}
      />
      <directionalLight position={[-4, 4, -3]} intensity={0.4} />
      <pointLight position={[0, 3, 0]} intensity={0.6} color="#FFCC00" />
      <pointLight position={[-3, 2, 4]} intensity={0.3} color="#E3350D" />

      {/* Ground */}
      <MagazineGround />

      {/* Franchise sections */}
      {sections.map((section, si) => {
        const sectionCenterX = (si - (sections.length - 1) / 2) * sectionSpacing

        return (
          <group key={section.franchise}>
            {/* Section strip on ground */}
            <SectionStrip
              color={section.color}
              position={[sectionCenterX, -1.2, 0]}
              width={discsPerRow * discSpacing * 0.7}
            />

            {/* Franchise label floating above */}
            <FranchiseLabel
              text={section.franchise.toUpperCase()}
              color={section.color}
              position={[sectionCenterX, 1.5, -0.5]}
            />

            {/* Tazo discs in rows */}
            {section.tazos.map((tazo, ti) => {
              const row = Math.floor(ti / discsPerRow)
              const col = ti % discsPerRow
              const offX = sectionCenterX + (col - (discsPerRow - 1) / 2) * discSpacing
              const offZ = row * discSpacing
              const pos: [number, number, number] = [offX, 0, offZ]
              return (
                <GalleryTazoDisc
                  key={tazo.id}
                  tazo={tazo}
                  position={pos}
                  onClick={handleTazoClick}
                />
              )
            })}
          </group>
        )
      })}

      <ContactShadows position={[0, -1.25, 0]} opacity={0.15} scale={20} blur={2} />
      <DustParticles />
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={3}
        maxDistance={20}
        autoRotate={true}
        autoRotateSpeed={0.3}
        target={[0, -0.2, 0]}
      />
    </>
  )
}

// ─── Exported wrapper with Canvas + Loading ─────
export default function TazoGallery3D({
  tazos,
  selectedFranchise,
  className,
  style,
  onTazoClick,
}: TazoGallery3DProps) {
  return (
    <div
      className={className}
      style={{
        width: "100%",
        minHeight: 500,
        background: "linear-gradient(180deg, #fffef0 0%, #f5f0e0 100%)",
        ...style,
      }}
    >
      <Canvas
        camera={{ position: [0, 5, 10], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
        shadows
        dpr={[1, 2]}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <GalleryScene
            tazos={tazos}
            selectedFranchise={selectedFranchise}
            onTazoClick={onTazoClick}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
