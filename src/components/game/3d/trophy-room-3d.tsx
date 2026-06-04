// ============================================================
// Trading Tazos Game — 3D Trophy Room
// Magazine-style 3D display for player stats and achievements.
// ============================================================
"use client"

import { Suspense, useRef, useMemo, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, ContactShadows } from "@react-three/drei"
import * as THREE from "three"

interface TrophyRoom3DProps {
  totalTazos?: number
  totalTazosMax?: number
  decks?: number
  credits?: number
  wins?: number
  losses?: number
  className?: string
  style?: React.CSSProperties
}

// ─── Magazine-style pedestal for a trophy ─────
function TrophyPedestal({
  position,
  label,
  value,
  color,
  icon,
}: {
  position: [number, number, number]
  label: string
  value: number | string
  color: string
  icon: string
}) {
  const glowRef = useRef<THREE.Mesh>(null!)

  useFrame((_, delta) => {
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.002) * 0.05)
    }
  })

  return (
    <group position={position}>
      {/* Base pedestal */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.25, 0.8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.25, 0.6]} />
        <meshStandardMaterial color="#333" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.25, 0.4]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.5} />
      </mesh>

      {/* Value display on sphere */}
      <mesh ref={glowRef} position={[0, 1.1, 0]} castShadow>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>

      {/* Value text */}
      <Text
        position={[0, 1.1, 0.21]}
        fontSize={0.22}
        color="#1a1a1a"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Geist-Bold.ttf"
      >
        {String(value)}
      </Text>

      {/* Label text floating above */}
      <Text
        position={[0, 1.6, 0]}
        fontSize={0.12}
        color={color}
        anchorX="center"
        anchorY="bottom"
        font="/fonts/Geist-Bold.ttf"
        outlineWidth={0.005}
        outlineColor="#1a1a1a"
      >
        {label}
      </Text>
    </group>
  )
}

// ─── Big center podium ─────
function CenterPodium({
  totalTazos = 0,
  totalTazosMax = 319,
  wins = 0,
  losses = 0,
}: {
  totalTazos: number
  totalTazosMax: number
  wins: number
  losses: number
}) {
  const ringRef = useRef<THREE.Group>(null!)
  const percent = Math.round((totalTazos / Math.max(totalTazosMax, 1)) * 100)

  useFrame((_, delta) => {
    if (ringRef.current) ringRef.current.rotation.y += delta * 0.3
  })

  return (
    <group>
      {/* Large podium */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.0, 1.2, 0.6, 64]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Top disc */}
      <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.9, 0.9, 0.1, 64]} />
        <meshStandardMaterial color="#FFCC00" roughness={0.2} metalness={0.5} emissive="#FFCC00" emissiveIntensity={0.2} />
      </mesh>

      {/* Center sphere — collection % */}
      <mesh position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.5, 64, 64]} />
        <meshStandardMaterial
          color="#E3350D"
          roughness={0.1}
          metalness={0.2}
          emissive="#E3350D"
          emissiveIntensity={0.4}
        />
      </mesh>

      <Text
        position={[0, 1.1, 0.51]}
        fontSize={0.6}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Geist-Bold.ttf"
        outlineWidth={0.02}
        outlineColor="#1a1a1a"
      >
        {`${percent}%`}
      </Text>

      <Text
        position={[0, 1.8, 0]}
        fontSize={0.14}
        color="#FFCC00"
        anchorX="center"
        anchorY="bottom"
        font="/fonts/Geist-Bold.ttf"
        outlineWidth={0.005}
        outlineColor="#1a1a1a"
      >
        COLLECTION COMPLETE
      </Text>

      {/* Orbiting rings */}
      <group ref={ringRef}>
        <mesh rotation={[Math.PI / 6, 0, 0]}>
          <torusGeometry args={[1.2, 0.03, 16, 64]} />
          <meshStandardMaterial color="#FFCC00" roughness={0.2} metalness={0.9} emissive="#FFCC00" emissiveIntensity={0.3} />
        </mesh>
        <mesh rotation={[Math.PI / -6, 0, 0]}>
          <torusGeometry args={[1.2, 0.03, 16, 64]} />
          <meshStandardMaterial color="#E3350D" roughness={0.2} metalness={0.9} emissive="#E3350D" emissiveIntensity={0.2} />
        </mesh>
      </group>

      {/* W/L ratio label */}
      <Text
        position={[0, -0.3, 0]}
        fontSize={0.1}
        color="#1a1a1a"
        anchorX="center"
        anchorY="top"
        font="/fonts/Geist-Bold.ttf"
        opacity={0.5}
      >
        {`W: ${wins} / L: ${losses}`}
      </Text>
    </group>
  )
}

// ─── Floor ─────
function TrophyFloor() {
  return (
    <mesh rotation={[Math.PI / -2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
      <planeGeometry args={[16, 16]} />
      <meshStandardMaterial color="#fffef0" roughness={0.9} />
    </mesh>
  )
}

// ─── Scene ─────
function TrophyScene({
  totalTazos = 0,
  totalTazosMax = 319,
  decks = 0,
  credits = 0,
  wins = 0,
  losses = 0,
}: TrophyRoom3DProps) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 8, 5]} intensity={1.0} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <directionalLight position={[-3, 3, -3]} intensity={0.3} />
      <pointLight position={[0, 3, 0]} intensity={0.8} color="#FFCC00" />
      <spotLight position={[0, 5, 0]} angle={0.4} penumbra={0.5} intensity={1.5} color="#FFCC00" castShadow />

      <TrophyFloor />

      {/* Center podium — collection progress */}
      <CenterPodium totalTazos={totalTazos} totalTazosMax={totalTazosMax} wins={wins} losses={losses} />

      {/* Side trophies */}
      <TrophyPedestal position={[-3, 0, 1]} label="TAZOS" value={totalTazos} color="#E3350D" icon="disc" />
      <TrophyPedestal position={[3, 0, 1]} label="DECKS" value={decks} color="#3B4CCA" icon="layers" />
      <TrophyPedestal position={[-3, 0, -1]} label="CREDITS" value={credits} color="#F59E0B" icon="coins" />
      <TrophyPedestal position={[3, 0, -1]} label="WINS" value={wins} color="#22C55E" icon="trophy" />

      <ContactShadows position={[0, -0.8, 0]} opacity={0.2} scale={12} blur={2} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.3}
        minDistance={5}
        maxDistance={15}
        autoRotate={true}
        autoRotateSpeed={0.4}
        target={[0, 0.5, 0]}
      />
    </>
  )
}

export default function TrophyRoom3D(props: TrophyRoom3DProps) {
  return (
    <div
      className={props.className}
      style={{
        width: "100%",
        minHeight: 460,
        background: "linear-gradient(180deg, #fffef0 0%, #f5edda 50%, #e8d8b0 100%)",
        border: "3px solid #1a1a1a",
        boxShadow: "4px 4px 0px #1a1a1a",
        ...props.style,
      }}
    >
      <Canvas
        camera={{ position: [0, 4, 8], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
        shadows
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <TrophyScene {...props} />
        </Suspense>
      </Canvas>
    </div>
  )
}
