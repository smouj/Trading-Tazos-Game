// ============================================================
// Trading Tazos Game — 3D Scene Wrapper
// Common lighting, camera, and environment for 3D components.
// ============================================================
"use client"

import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { Environment, ContactShadows, OrbitControls, Stage } from "@react-three/drei"

interface Scene3DProps {
  children: React.ReactNode
  cameraPosition?: [number, number, number]
  controls?: boolean
  autoRotate?: boolean
  className?: string
  style?: React.CSSProperties
}

export default function Scene3D({
  children,
  cameraPosition = [0, 0, 4],
  controls = true,
  autoRotate = true,
  className,
  style,
}: Scene3DProps) {
  return (
    <div className={className} style={{ minHeight: 300, ...style }}>
      <Canvas
        camera={{ position: cameraPosition, fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={512}
            shadow-mapSize-height={512}
          />
          <directionalLight position={[-3, 2, -3]} intensity={0.5} />
          <pointLight position={[2, 1, 3]} intensity={0.4} color="#FFCC00" />
          
          {children}
          
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.4}
            scale={5}
            blur={2.5}
          />
          
          {controls && (
            <OrbitControls
              enableZoom={true}
              enablePan={false}
              autoRotate={autoRotate}
              autoRotateSpeed={1}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 1.8}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  )
}
