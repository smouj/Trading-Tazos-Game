// ============================================================
// Trading Tazos Game — 3D Collection Binder
// Magazine-style 3D view showing owned tazos as discs in a binder.
// ============================================================
"use client"

import { Suspense, useRef, useMemo, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Text, ContactShadows } from "@react-three/drei"
import TazoDisc3D from "./tazo-disc-3d"
import * as THREE from "three"

interface CollectionTazo {
  id: string
  name: string
  displayName: string
  number: string
  imageUrl: string
  rarity: string
  franchise: string
  franchiseSlug: string
  quantity: number
  attack: number
  defense: number
}

interface CollectionBinder3DProps {
  tazos: CollectionTazo[]
  className?: string
  style?: React.CSSProperties
  onTazoClick?: (tazo: CollectionTazo) => void
}

function BinderScene({
  tazos,
  onTazoClick,
}: {
  tazos: CollectionTazo[]
  onTazoClick?: (tazo: CollectionTazo) => void
}) {
  const controlsRef = useRef<any>(null!)

  const grid = useMemo(() => {
    const cols = 6
    return tazos.map((t, i) => {
      const row = Math.floor(i / cols)
      const col = i % cols
      return {
        ...t,
        x: (col - (cols - 1) / 2) * 1.8,
        z: row * 1.8,
      }
    })
  }, [tazos])

  if (tazos.length === 0) {
    return (
      <>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 8, 5]} intensity={0.8} />
        <mesh rotation={[Math.PI / -2, 0, 0]} position={[0, -2, 0]}>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#fffef0" roughness={0.9} />
        </mesh>
        <Text position={[0, 1, 0]} fontSize={0.5} color="#1a1a1a" anchorX="center" anchorY="middle">
          COLLECTION EMPTY
        </Text>
        <OrbitControls ref={controlsRef} />
      </>
    )
  }

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[6, 10, 4]}
        intensity={1.0}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-3, 4, -5]} intensity={0.3} />
      <pointLight position={[0, 4, 0]} intensity={0.5} color="#FFCC00" />

      {/* Ground */}
      <mesh rotation={[Math.PI / -2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#fffef0" roughness={0.9} />
      </mesh>

      {/* Collection tazos on pedestals */}
      {grid.map((tazo) => (
        <CollectionTazoDisc
          key={tazo.id}
          tazo={tazo}
          position={[tazo.x, 0, tazo.z]}
          onClick={() => onTazoClick?.(tazo)}
        />
      ))}

      <ContactShadows position={[0, -1.25, 0]} opacity={0.15} scale={15} blur={2} />
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.3}
        minDistance={3}
        maxDistance={25}
        autoRotate={true}
        autoRotateSpeed={0.2}
        target={[0, 0, (grid.length / 6) * 0.9]}
      />
    </>
  )
}

function CollectionTazoDisc({
  tazo,
  position,
  onClick,
}: {
  tazo: CollectionTazo
  position: [number, number, number]
  onClick?: () => void
}) {
  const groupRef = useRef<THREE.Group>(null!)
  const [hovered, setHovered] = useState(false)

  useFrame((_, delta) => {
    if (groupRef.current) {
      const targetY = hovered ? position[1] + 0.4 : position[1]
      groupRef.current.position.lerp(new THREE.Vector3(position[0], targetY, position[2]), 0.1)
    }
  })

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Quantity badge as a floating cube */}
      {tazo.quantity > 1 && (
        <group position={[0.65, 0.55, 0]}>
          <mesh>
            <boxGeometry args={[0.25, 0.25, 0.05]} />
            <meshStandardMaterial color="#FFCC00" roughness={0.3} />
          </mesh>
          <Text
            position={[0, 0, 0.03]}
            fontSize={0.15}
            color="#1a1a1a"
            anchorX="center"
            anchorY="middle"
          >
            {`x${tazo.quantity}`}
          </Text>
        </group>
      )}

      {/* Pedestal */}
      <mesh position={[0, -0.55, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 0.25, 32]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Tazo disc */}
      <TazoDisc3D
        name={tazo.name}
        franchise={tazo.franchiseSlug}
        size={0.55}
        rotationSpeed={0.5}
        autoRotate={true}
        onClick={onClick}
      />
    </group>
  )
}

export default function CollectionBinder3D({
  tazos,
  className,
  style,
  onTazoClick,
}: CollectionBinder3DProps) {
  return (
    <div
      className={className}
      style={{
        width: "100%",
        minHeight: 480,
        background: "linear-gradient(180deg, #fffef0 0%, #f5edda 100%)",
        border: "3px solid #1a1a1a",
        ...style,
      }}
    >
      <Canvas
        camera={{ position: [0, 6, 8], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
        shadows
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <BinderScene tazos={tazos} onTazoClick={onTazoClick} />
        </Suspense>
      </Canvas>
    </div>
  )
}
