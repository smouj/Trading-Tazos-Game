// ============================================================
// Trading Tazos Game — TubeCylinder3D
// Real 3D cylindrical battle tube with texture-wrapped label
// Like a Pringles can / collectible storage tube
// ============================================================
"use client"

import { useRef, useMemo, Suspense } from "react"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import * as THREE from "three"
import { OrbitControls } from "@react-three/drei"

// ── Tube dimensions ──────────────────────────────
const TUBE_RADIUS = 0.40
const TUBE_HEIGHT = 1.40
const CAP_HEIGHT = 0.10
const CAP_RADIUS = TUBE_RADIUS + 0.02

interface TubeCylinderProps {
  textureUrl: string
  color: string          // Franchise color for the cap
  rotationSpeed?: number  // Auto-rotation speed (default 0.15)
  showTazos?: boolean     // Show tazo stack inside
  tazoImageUrls?: string[] // Front tazo images to show inside
}

function TubeModel({ textureUrl, color, rotationSpeed = 0.15, showTazos = false, tazoImageUrls = [] }: TubeCylinderProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const texture = useLoader(THREE.TextureLoader, textureUrl)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping

  // Auto-rotation
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += rotationSpeed * delta
    }
  })

  // Cap material
  const capMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    metalness: 0.6,
    roughness: 0.25,
  }), [color])

  // Metallic ring material
  const ringMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color("#888"),
    metalness: 0.9,
    roughness: 0.2,
  }), [])

  // Tube body material with texture
  const bodyMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    map: texture,
    metalness: 0.05,
    roughness: 0.4,
  }), [texture])

  // Glass window material (transparent section)
  const glassMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#ffffff"),
    metalness: 0,
    roughness: 0.1,
    transparent: true,
    opacity: 0.3,
    clearcoat: 0.2,
  }), [])

  return (
    <group ref={groupRef}>
      {/* ═══ TOP CAP ═══ */}
      <mesh position={[0, TUBE_HEIGHT / 2 + CAP_HEIGHT / 2, 0]} material={capMaterial}>
        <cylinderGeometry args={[CAP_RADIUS, CAP_RADIUS, CAP_HEIGHT, 48]} />
      </mesh>
      {/* Top cap rim */}
      <mesh position={[0, TUBE_HEIGHT / 2, 0]} material={ringMaterial}>
        <torusGeometry args={[CAP_RADIUS, 0.015, 16, 48]} />
      </mesh>

      {/* ═══ TUBE BODY ═══ */}
      <mesh position={[0, 0, 0]} material={bodyMaterial}>
        <cylinderGeometry args={[TUBE_RADIUS, TUBE_RADIUS, TUBE_HEIGHT, 64, 1, true]} />
      </mesh>

      {/* ═══ TRANSPARENT WINDOW (front of tube, showing tazos inside) ═══ */}
      {showTazos && (
        <>
          {/* Glass window on front */}
          <mesh position={[0, 0.05, TUBE_RADIUS * 0.88]} material={glassMaterial}>
            <planeGeometry args={[TUBE_RADIUS * 1.2, TUBE_HEIGHT * 0.55]} />
          </mesh>
          {/* Tazo stack visible through window */}
          {tazoImageUrls.slice(0, 3).map((url, i) => (
            <Suspense key={i} fallback={null}>
              <TazoDiscInTube url={url} index={i} />
            </Suspense>
          ))}
        </>
      )}

      {/* ═══ BOTTOM CAP ═══ */}
      <mesh position={[0, -TUBE_HEIGHT / 2 - CAP_HEIGHT / 2, 0]} material={capMaterial}>
        <cylinderGeometry args={[CAP_RADIUS, CAP_RADIUS, CAP_HEIGHT, 48]} />
      </mesh>
      <mesh position={[0, -TUBE_HEIGHT / 2, 0]} material={ringMaterial}>
        <torusGeometry args={[CAP_RADIUS, 0.015, 16, 48]} />
      </mesh>

    </group>
  )
}

// ── Small tazo disc flat inside the tube ──────────
function TazoDiscInTube({ url, index }: { url: string; index: number }) {
  const texture = useLoader(THREE.TextureLoader, url)
  texture.colorSpace = THREE.SRGBColorSpace

  // Stack horizontally: lowest tazo at bottom, each one 0.10 higher
  const yOffset = -0.25 + index * 0.10

  return (
    <mesh
      position={[0, yOffset, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <circleGeometry args={[TUBE_RADIUS * 0.85, 32]} />
      <meshStandardMaterial
        map={texture}
        side={THREE.DoubleSide}
        transparent
        opacity={0.85}
        roughness={0.3}
      />
    </mesh>
  )
}

// ── Outer Canvas wrapper ────────────────────────────
interface TubeCylinder3DProps extends TubeCylinderProps {
  className?: string
  style?: React.CSSProperties
}

export default function TubeCylinder3D({ className = "", style, ...props }: TubeCylinder3DProps) {
  return (
    <div className={className} style={style}>
      <Canvas
        camera={{ position: [0, 0.2, 3.0], fov: 40 }}
        style={{ background: "transparent" }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 4, 5]} intensity={1.2} />
        <directionalLight position={[-2, 1, -2]} intensity={0.4} color="#aaccff" />
        <pointLight position={[0, TUBE_HEIGHT / 2, 1.5]} intensity={0.6} color="#ffffff" />
        <Suspense fallback={null}>
          <TubeModel {...props} />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          minPolarAngle={Math.PI * 0.3}
          maxPolarAngle={Math.PI * 0.7}
        />
      </Canvas>
    </div>
  )
}

// ── TubeCylinder3DStatic — for grid/card views (no interaction) ──
export function TubeCylinder3DStatic({ className = "", style, ...props }: TubeCylinder3DProps) {
  return (
    <div className={className} style={style}>
      <Canvas
        camera={{ position: [0, 0.2, 3.0], fov: 40 }}
        style={{ background: "transparent" }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 4, 5]} intensity={1.2} />
        <directionalLight position={[-2, 1, -2]} intensity={0.4} color="#aaccff" />
        <pointLight position={[0, TUBE_HEIGHT / 2, 1.5]} intensity={0.6} color="#ffffff" />
        <Suspense fallback={null}>
          <TubeModel {...props} rotationSpeed={0.3} />
        </Suspense>
      </Canvas>
    </div>
  )
}
