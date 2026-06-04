// ============================================================
// Trading Tazos Game — 3D Scanner Machine
// Magazine-style 3D scanner with rotating beam and tray.
// ============================================================
"use client"

import { Suspense, useRef, useMemo, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import TazoDisc3D from "./tazo-disc-3d"
import * as THREE from "three"

interface ScannerMachine3DProps {
  isScanning?: boolean
  scanProgress?: number // 0-1
  detectedTazo?: {
    name: string
    franchise: string
    color?: string
  } | null
  className?: string
  style?: React.CSSProperties
}

// ─── Scanner body ─────
function ScannerBody() {
  return (
    <group>
      {/* Base platform */}
      <mesh position={[0, -0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.2, 3]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Side pillars */}
      <mesh position={[-1.4, 0.5, 0]} castShadow>
        <boxGeometry args={[0.2, 2.0, 0.2]} />
        <meshStandardMaterial color="#333" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[1.4, 0.5, 0]} castShadow>
        <boxGeometry args={[0.2, 2.0, 0.2]} />
        <meshStandardMaterial color="#333" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Top bar */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[3.2, 0.15, 0.3]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Scan head (slides along top bar) */}
      <mesh position={[0, 1.35, 0]}>
        <boxGeometry args={[0.4, 0.25, 0.5]} />
        <meshStandardMaterial color="#E3350D" roughness={0.2} metalness={0.5} />
      </mesh>

      {/* Tray platform where tazo sits */}
      <mesh position={[0, -0.48, 0]} receiveShadow>
        <cylinderGeometry args={[1.15, 1.15, 0.05, 64]} />
        <meshStandardMaterial
          color="#FFCC00"
          roughness={0.3}
          metalness={0.6}
          emissive="#FFCC00"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Glass dome over tray */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[1.0, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.1}
          metalness={0.1}
          transparent
          opacity={0.15}
        />
      </mesh>
    </group>
  )
}

// ─── Scanning beam ring ─────
function ScanBeam({ isScanning, progress }: { isScanning: boolean; progress: number }) {
  const ringRef = useRef<THREE.Mesh>(null!)
  const beamRef = useRef<THREE.Group>(null!)

  useFrame((_, delta) => {
    if (isScanning && ringRef.current) {
      ringRef.current.rotation.y += delta * 3
      ringRef.current.position.y = -0.5 + Math.sin(Date.now() * 0.005) * 0.15
    }
    if (beamRef.current && isScanning) {
      beamRef.current.rotation.y += delta * 4
      const scale = 0.5 + Math.sin(Date.now() * 0.008) * 0.3
      beamRef.current.scale.setScalar(scale)
    }
  })

  return (
    <group visible={isScanning}>
      {/* Scanning ring */}
      <mesh ref={ringRef} position={[0, -0.5, 0]} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[0.9, 0.03, 16, 64]} />
        <meshStandardMaterial
          color="#00A1E9"
          emissive="#00A1E9"
          emissiveIntensity={1.5}
          roughness={0.1}
          metalness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Laser beam cone */}
      <group ref={beamRef} position={[0, -0.4, 0]}>
        <mesh rotation={[0, 0, 0]}>
          <coneGeometry args={[0.1, 1.2, 16]} />
          <meshStandardMaterial
            color="#00A1E9"
            emissive="#00A1E9"
            emissiveIntensity={2}
            roughness={0.1}
            transparent
            opacity={0.15}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Progress bar ring on floor */}
      <mesh position={[0, -0.52, 0]} rotation={[Math.PI / -2, 0, 0]}>
        <ringGeometry args={[1.1, 1.2, 64, 0, progress * Math.PI * 2]} />
        <meshStandardMaterial
          color="#00A1E9"
          emissive="#00A1E9"
          emissiveIntensity={0.8}
          roughness={0.2}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

// ─── Scanner scene ─────
function ScannerScene({
  isScanning = false,
  scanProgress = 0,
  detectedTazo,
}: ScannerMachine3DProps) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-3, 3, -5]} intensity={0.3} />

      {/* Scanner body */}
      <ScannerBody />

      {/* Scan beam */}
      <ScanBeam isScanning={isScanning} progress={scanProgress} />

      {/* Detected tazo (appears when scan complete) */}
      {detectedTazo && (
        <group position={[0, 0.8, 0]}>
          <TazoDisc3D
            name={detectedTazo.name}
            franchise={detectedTazo.franchise}
            color={detectedTazo.color}
            size={0.7}
            rotationSpeed={1}
            autoRotate={true}
          />
        </group>
      )}

      {/* Empty tray when no tazo */}
      {!detectedTazo && !isScanning && (
        <Text
          position={[0, -0.1, 0]}
          fontSize={0.2}
          color="#1a1a1a"
          anchorX="center"
          anchorY="middle"
          opacity={0.3}
        >
          READY TO SCAN
        </Text>
      )}

      <mesh rotation={[Math.PI / -2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#fffef0" roughness={0.9} />
      </mesh>

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={3}
        maxDistance={10}
        autoRotate={true}
        autoRotateSpeed={0.6}
        target={[0, 0.3, 0]}
      />
    </>
  )
}

export default function ScannerMachine3D(props: ScannerMachine3DProps) {
  return (
    <div
      className={props.className}
      style={{
        width: "100%",
        minHeight: 480,
        background: "linear-gradient(180deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)",
        border: "3px solid #1a1a1a",
        borderRadius: 0,
        ...props.style,
      }}
    >
      <Canvas
        camera={{ position: [0, 1.5, 5], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        shadows
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <ScannerScene {...props} />
        </Suspense>
      </Canvas>
    </div>
  )
}
