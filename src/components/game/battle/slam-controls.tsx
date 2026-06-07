// ============================================================
// Trading Tazos Game — Slam Controls v5: Floating Minimal
// Overlay controls. User can release at any charge level.
// ============================================================
"use client"

import { useCallback, useRef, useEffect } from "react"
import { Crosshair, Zap } from "lucide-react"

export interface SlamControlsProps {
  phase: "aim" | "charge" | "tilt"
  tazoName: string; tazoFranchise: string
  reticleX: number; reticleZ: number
  charge: number
  tiltDeg: number; spinIntensity: number
  onReticleMove: (x: number, z: number) => void
  onCharge: (level: number) => void
  onChargeComplete: (level: number) => void
  onTilt: (degrees: number, intensity: number) => void
  onSpin: (intensity: number) => void
  onRelease: () => void
  onBack: () => void
}

export default function SlamControls(props: SlamControlsProps) {
  const { phase, tazoName, reticleX, reticleZ, charge, tiltDeg, spinIntensity,
    onReticleMove, onCharge, onChargeComplete, onTilt, onSpin, onRelease, onBack } = props

  const chargeInt = useRef<ReturnType<typeof setInterval> | null>(null)
  const cbRef = useRef({ onCharge, onChargeComplete })
  cbRef.current = { onCharge, onChargeComplete }

  // Auto-fill charge meter when entering charge phase
  useEffect(() => {
    if (phase === "charge") {
      let level = 0
      cbRef.current.onCharge(0)
      chargeInt.current = setInterval(() => {
        level = Math.min(1, level + 0.025)
        cbRef.current.onCharge(level)
        if (level >= 1) {
          if (chargeInt.current) clearInterval(chargeInt.current)
          chargeInt.current = null
          cbRef.current.onChargeComplete(level)
        }
      }, 50)
      return () => { if (chargeInt.current) { clearInterval(chargeInt.current); chargeInt.current = null } }
    } else {
      if (chargeInt.current) { clearInterval(chargeInt.current); chargeInt.current = null }
    }
  }, [phase])

  useEffect(() => { return () => { if (chargeInt.current) clearInterval(chargeInt.current) } }, [])

  const padMove = useCallback((cx: number, cy: number, rect: DOMRect) => {
    const x = Math.max(0, Math.min(1, (cx - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (cy - rect.top) / rect.height))
    onReticleMove((x - 0.5) * 2, -(y - 0.5) * 2)
  }, [onReticleMove])

  const tiltDrag = useCallback((cx: number, cy: number, rect: DOMRect) => {
    const mx = rect.left + rect.width / 2; const my = rect.top + rect.height / 2
    const dx = cx - mx; const dy = cy - my
    onTilt(Math.atan2(dy, dx) * (180 / Math.PI), Math.min(1, Math.sqrt(dx * dx + dy * dy) / (rect.width * 0.4)))
  }, [onTilt])

  const isPerfect = charge >= 0.6 && charge <= 0.82
  const isOver = charge > 0.82
  const barColor = isOver ? "#FF004D" : isPerfect ? "#22C55E" : charge > 0.25 ? "#FFCC00" : "#FFCC0060"

  // ═══════ AIM — transparent reticle pad over arena ═══════
  if (phase === "aim") return (
    <>
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8 pb-32">
          <div
            className="relative w-full max-w-[340px] aspect-square bg-black/25 rounded-3xl border border-white/10 backdrop-blur-[2px] overflow-hidden cursor-crosshair pointer-events-auto"
            onMouseMove={(e) => padMove(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect())}
            onClick={(e) => padMove(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect())}
            onTouchStart={(e) => { e.preventDefault(); const t = e.touches[0]; padMove(t.clientX, t.clientY, e.currentTarget.getBoundingClientRect()) }}
            onTouchMove={(e) => { e.preventDefault(); padMove(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget.getBoundingClientRect()) }}
          >
            <div className="absolute inset-4 flex items-center justify-center pointer-events-none">
              <div className="border border-white/8 rounded-full w-full h-full" />
              <div className="absolute border border-white/5 rounded-full w-[70%] h-[70%]" />
              <div className="absolute border border-white/4 rounded-full w-[40%] h-[40%]" />
              <div className="absolute w-2 h-2 rounded-full bg-white/15" />
            </div>
            <div className="absolute top-1/2 left-[30%] -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-[#29ADFF]/30 bg-[#29ADFF]/8 pointer-events-none" />
            <div className="absolute top-1/2 left-[70%] -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-[#FF004D]/30 bg-[#FF004D]/8 pointer-events-none" />
            <div className="absolute w-10 h-10 -ml-5 -mt-5 pointer-events-none"
              style={{ left: `${((reticleX + 1) / 2) * 100}%`, top: `${((-reticleZ + 1) / 2) * 100}%` }}>
              <Crosshair className="w-full h-full text-[#FFCC00] drop-shadow-[0_0_10px_rgba(255,204,0,0.8)]" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 pointer-events-none">
        <button onClick={onBack} className="px-3 py-1.5 text-[10px] font-black text-white/30 hover:text-white/60 bg-black/30 hover:bg-black/50 rounded-full border border-white/10 uppercase tracking-wider pointer-events-auto transition-colors">←</button>
        <div className="text-center">
          <span className="text-[9px] font-black text-white/50 block leading-none">{tazoName}</span>
          <span className="text-[7px] font-black text-[#FFCC00]/60 uppercase tracking-[0.3em]">tap to aim</span>
        </div>
        <button onClick={onRelease}
          className="px-5 py-2.5 bg-[#FFCC00] hover:bg-[#FFD633] text-[#1a1a1a] font-black text-xs uppercase rounded-full tracking-wider shadow-[0_0_20px_rgba(255,204,0,0.4)] hover:shadow-[0_0_30px_rgba(255,204,0,0.6)] active:scale-95 pointer-events-auto transition-all">
          ⚡ CHARGE
        </button>
      </div>
    </>
  )

  // ═══════ CHARGE — meter + release button ═══════
  if (phase === "charge") return (
    <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pointer-events-none">
      <div className="max-w-md mx-auto space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Force</span>
          <span className="text-[11px] font-black" style={{ color: barColor }}>
            {isPerfect ? "⚡ PERFECT" : Math.round(charge * 100) + "%"}
          </span>
        </div>
        <div className="relative w-full h-8 bg-black/40 rounded-full overflow-hidden border border-white/10 backdrop-blur-sm">
          <div className="h-full transition-all duration-75 rounded-full" style={{
            width: `${charge * 100}%`,
            background: `linear-gradient(90deg, ${barColor}33, ${barColor})`,
            boxShadow: isPerfect || isOver ? `0 0 16px ${barColor}55` : undefined,
          }} />
          <div className="absolute top-0 left-[60%] w-[22%] h-full bg-[#22C55E]/10 border-l border-r border-[#22C55E]/25" />
        </div>
        <div className="flex items-center gap-2">
          <span className="flex-1 text-center text-[8px] font-black text-white/20">auto-charging…</span>
          <button onClick={onRelease}
            className="px-5 py-2 bg-[#FFCC00]/80 hover:bg-[#FFCC00] text-[#1a1a1a] font-black text-xs uppercase rounded-full tracking-wider active:scale-95 pointer-events-auto transition-all">
            RELEASE
          </button>
        </div>
      </div>
    </div>
  )

  // ═══════ TILT — direction + spin + SLAM ═══════
  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 p-3 pointer-events-none">
      <div className="max-w-md mx-auto flex items-end gap-3">
        <div className="flex-1 space-y-1">
          <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Tilt</span>
          <div
            className="relative w-full aspect-square max-w-[120px] mx-auto bg-black/35 rounded-2xl border border-white/10 backdrop-blur-sm cursor-grab active:cursor-grabbing pointer-events-auto"
            onMouseMove={(e) => tiltDrag(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect())}
            onTouchMove={(e) => { e.preventDefault(); tiltDrag(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget.getBoundingClientRect()) }}
          >
            <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-white/8" strokeWidth={1.5} />
            <div className="absolute top-1/2 left-1/2 w-1.5 h-8 -mt-4 bg-[#FFCC00] rounded-full origin-bottom shadow-[0_0_10px_rgba(255,204,0,0.5)]"
              style={{ transform: `translateX(-50%) rotate(${tiltDeg}deg)` }} />
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Spin</span>
              <span className="text-[9px] font-black text-[#FFCC00]">{Math.round(spinIntensity * 100)}%</span>
            </div>
            <input type="range" min="0" max="100" value={spinIntensity * 100}
              onChange={(e) => onSpin(Number(e.target.value) / 100)}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#FFCC00] pointer-events-auto
                [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-[#FFCC00] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1a1a1a]" />
          </div>
          <button onClick={onRelease}
            className="w-full py-3 bg-gradient-to-r from-[#FFCC00] to-[#FFD633] hover:from-[#FFD633] hover:to-[#FFE066] text-[#1a1a1a] font-black text-sm uppercase rounded-xl tracking-wider shadow-[0_0_20px_rgba(255,204,0,0.5)] active:scale-95 pointer-events-auto transition-all">
            💥 SLAM!
          </button>
        </div>
      </div>
    </div>
  )
}
