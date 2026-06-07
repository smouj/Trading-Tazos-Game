// ============================================================
// Trading Tazos Game — Vertical Slam Controls v3
// Flujo corregido: AIM (reticle + botón) → CHARGE (auto-fill) → TILT + SLAM
// ============================================================
"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Crosshair, Zap, Target, Gauge, ArrowDown } from "lucide-react"

export interface SlamControlsProps {
  phase: "aim" | "charge" | "tilt"
  tazoName: string
  tazoFranchise: string
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
  const { phase, tazoName, tazoFranchise, reticleX, reticleZ, charge, tiltDeg, spinIntensity,
    onReticleMove, onCharge, onChargeComplete, onTilt, onSpin, onRelease, onBack } = props

  const chargeInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  // Store callbacks in refs so the charge effect doesn't restart
  const cbRef = useRef({ onCharge, onChargeComplete })
  cbRef.current = { onCharge, onChargeComplete }

  // Start auto-charge when we enter charge phase (using refs to avoid restart)
  useEffect(() => {
    if (phase === "charge") {
      let level = 0
      cbRef.current.onCharge(0)
      chargeInterval.current = setInterval(() => {
        level = Math.min(1, level + 0.025)
        cbRef.current.onCharge(level)
        if (level >= 1) {
          if (chargeInterval.current) clearInterval(chargeInterval.current)
          chargeInterval.current = null
          cbRef.current.onChargeComplete(level)
        }
      }, 50)

      return () => {
        if (chargeInterval.current) {
          clearInterval(chargeInterval.current)
          chargeInterval.current = null
        }
      }
    } else {
      // Clean up if not in charge phase
      if (chargeInterval.current) {
        clearInterval(chargeInterval.current)
        chargeInterval.current = null
      }
    }
  }, [phase])  // Only depends on phase, not on callbacks

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chargeInterval.current) clearInterval(chargeInterval.current)
    }
  }, [])

  const handlePadMove = useCallback((cx: number, cy: number, rect: DOMRect) => {
    const x = Math.max(0, Math.min(1, (cx - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (cy - rect.top) / rect.height))
    onReticleMove((x - 0.5) * 2, -(y - 0.5) * 2)
  }, [onReticleMove])

  const handleTiltDrag = useCallback((cx: number, cy: number, rect: DOMRect) => {
    const mx = rect.left + rect.width / 2; const my = rect.top + rect.height / 2
    const dx = cx - mx; const dy = cy - my
    const dist = Math.sqrt(dx*dx + dy*dy)
    const angle = Math.atan2(dy, dx) * (180 / Math.PI)
    onTilt(angle, Math.min(1, dist / (rect.width * 0.4)))
  }, [onTilt])

  // Charge quality
  const isPerfect = charge >= 0.6 && charge <= 0.82
  const isOvercharged = charge > 0.82
  const chargeColor = isOvercharged ? "#FF004D" : isPerfect ? "#22C55E" : charge > 0.25 ? "#FFCC00" : "#FFCC0060"
  const chargeLabel = isOvercharged ? "OVERCHARGED!" : isPerfect ? "⚡ PERFECT" : charge > 0.25 ? "Good" : "Charging..."

  return (
    <div className="w-full bg-gradient-to-t from-black/90 via-black/85 to-black/70 backdrop-blur-xl border-t border-white/10">
      {/* ═══ PHASE BAR ═══ */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
        <button onClick={onBack}
          className="text-[10px] font-black text-white/25 hover:text-white/50 uppercase tracking-wider transition-colors">
          ← Back
        </button>

        <div className="flex items-center gap-1.5">
          <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider transition-all ${
            phase === "aim" ? "text-[#FFCC00] border-[#FFCC00]/40 bg-[#FFCC00]/10"
              : phase === "charge" || phase === "tilt" ? "text-[#22C55E]/60 border-[#22C55E]/20 bg-[#22C55E]/5"
              : "text-white/10 border-white/5"
          }`}><Target className="w-3 h-3 inline mr-1" />AIM</span>
          <span className="text-white/8 text-[8px]">→</span>
          <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider transition-all ${
            phase === "charge" ? "text-[#FFCC00] border-[#FFCC00]/40 bg-[#FFCC00]/10 animate-pulse"
              : phase === "tilt" ? "text-[#22C55E]/60 border-[#22C55E]/20 bg-[#22C55E]/5"
              : "text-white/10 border-white/5"
          }`}><Gauge className="w-3 h-3 inline mr-1" />CHARGE</span>
          <span className="text-white/8 text-[8px]">→</span>
          <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider transition-all ${
            phase === "tilt" ? "text-[#FF004D] border-[#FF004D]/40 bg-[#FF004D]/10 animate-pulse"
              : "text-white/10 border-white/5"
          }`}>↗ TILT</span>
          <span className="text-white/8 text-[8px]">→</span>
          <span className="text-[9px] font-black px-2 py-0.5 rounded border border-[#FFCC00]/20 text-[#FFCC00]/30 uppercase tracking-wider">💥 SLAM</span>
        </div>

        <span className="text-[9px] font-black text-white/15 uppercase">{tazoName}</span>
      </div>

      {/* ═══════ AIM PHASE: Reticle pad ═══════ */}
      {phase === "aim" && (
        <div className="p-4 space-y-3">
          <div
            className="relative w-full aspect-[2/1] max-h-[180px] mx-auto bg-black/40 rounded-xl border-2 border-white/10 overflow-hidden cursor-crosshair hover:border-[#FFCC00]/30 transition-colors"
            onMouseMove={(e) => handlePadMove(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect())}
            onClick={(e) => handlePadMove(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect())}
            onTouchStart={(e) => { e.preventDefault(); const t = e.touches[0]; handlePadMove(t.clientX, t.clientY, e.currentTarget.getBoundingClientRect()) }}
            onTouchMove={(e) => { e.preventDefault(); const t = e.touches[0]; handlePadMove(t.clientX, t.clientY, e.currentTarget.getBoundingClientRect()) }}
          >
            {/* Mini arena circles */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border border-white/8 rounded-full" style={{ width: "70%", paddingBottom: "35%" }} />
              <div className="absolute border border-white/5 rounded-full" style={{ width: "50%", paddingBottom: "25%" }} />
              <div className="absolute w-2 h-2 rounded-full bg-white/10" />
            </div>
            {/* Stake position hints */}
            <div className="absolute top-1/2 left-[28%] -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-[#29ADFF]/30 bg-[#29ADFF]/5 pointer-events-none" />
            <div className="absolute top-1/2 left-[72%] -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-[#FF004D]/30 bg-[#FF004D]/5 pointer-events-none" />
            {/* Reticle (follows finger/cursor) */}
            <div className="absolute w-8 h-8 -ml-4 -mt-4 pointer-events-none"
              style={{ left: `${((reticleX + 1) / 2) * 100}%`, top: `${((-reticleZ + 1) / 2) * 100}%` }}>
              <Crosshair className="w-full h-full text-[#FFCC00] drop-shadow-[0_0_8px_rgba(255,204,0,0.7)]" strokeWidth={1.5} />
            </div>
          </div>
          <button
            onClick={onRelease}
            className="w-full py-4 bg-[#FFCC00] hover:bg-[#FFD633] active:bg-[#FFB800] text-[#1a1a1a] font-black text-base uppercase rounded-xl tracking-wider transition-all shadow-[0_4px_15px_rgba(255,204,0,0.3)] hover:shadow-[0_6px_25px_rgba(255,204,0,0.5)] active:scale-[0.98] cursor-pointer"
          >
            ⚡ START CHARGING
          </button>
          <p className="text-center text-[8px] font-bold text-white/20">Tap anywhere to aim, then press START CHARGING</p>
        </div>
      )}

      {/* ═══════ CHARGE PHASE: Auto-filling meter ═══════ */}
      {phase === "charge" && (
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Force</span>
              <span className="text-sm font-black" style={{ color: chargeColor }}>{chargeLabel}</span>
            </div>
            {/* Big charge bar */}
            <div className="relative w-full h-12 bg-black/40 rounded-xl overflow-hidden border-2 border-white/10">
              <div className="absolute inset-0 flex">
                <div className="h-full transition-all duration-75 rounded-l-xl" style={{
                  width: `${charge * 100}%`,
                  background: isOvercharged
                    ? "linear-gradient(90deg, #FF004D44, #FF004D)"
                    : isPerfect
                    ? "linear-gradient(90deg, #22C55E44, #22C55E)"
                    : charge > 0.25
                    ? "linear-gradient(90deg, #FFCC0044, #FFCC00)"
                    : "linear-gradient(90deg, #FFCC0020, #FFCC0050)",
                }} />
              </div>
              {/* Sweet spot zone */}
              <div className="absolute top-0 left-[60%] w-[22%] h-full bg-[#22C55E]/10 border-l-2 border-r-2 border-[#22C55E]/30 pointer-events-none" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-base font-black text-white/40 tracking-widest">
                  {Math.round(charge * 100)}%
                </span>
              </div>
            </div>
            <div className="flex justify-between text-[7px] font-black text-white/15">
              <span>0</span><span>25</span><span className="text-[#22C55E]/40">60</span><span>75</span><span className="text-[#22C55E]/40">82</span><span>100</span>
            </div>
          </div>

          <div className="text-center text-[9px] font-black text-white/30">
            {charge < 0.6 ? "Auto-charging..." : charge < 0.82 ? "⚡ Perfect range! Release soon..." : "⚠ Too much force!"}
          </div>
        </div>
      )}

      {/* ═══════ TILT PHASE: Direction + Spin ═══════ */}
      {phase === "tilt" && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Tilt direction pad */}
            <div className="space-y-1.5">
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Tilt Direction</span>
              <div
                className="relative w-full aspect-square bg-black/40 rounded-xl border-2 border-white/10 cursor-grab active:cursor-grabbing hover:border-white/20 transition-colors"
                onMouseMove={(e) => handleTiltDrag(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect())}
                onTouchMove={(e) => { e.preventDefault(); handleTiltDrag(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget.getBoundingClientRect()) }}
              >
                <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-white/10" strokeWidth={1.5} />
                {/* Tilt arrow */}
                <div className="absolute top-1/2 left-1/2 w-2 h-10 -mt-5 bg-[#FFCC00] rounded-full origin-bottom shadow-[0_0_12px_rgba(255,204,0,0.5)]"
                  style={{ transform: `translateX(-50%) rotate(${tiltDeg}deg)` }} />
                {/* Direction labels */}
                <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[7px] font-black text-white/10">↑</span>
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[7px] font-black text-white/10">↓</span>
                <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[7px] font-black text-white/10">←</span>
                <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[7px] font-black text-white/10">→</span>
              </div>
            </div>
            {/* Spin slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Spin</span>
                <span className="text-[11px] font-black text-[#FFCC00]">{Math.round(spinIntensity * 100)}%</span>
              </div>
              <div className="flex-1 flex flex-col justify-center gap-3">
                <input type="range" min="0" max="100" value={spinIntensity * 100}
                  onChange={(e) => onSpin(Number(e.target.value) / 100)}
                  className="w-full h-3 bg-black/40 rounded-full appearance-none cursor-pointer accent-[#FFCC00]
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FFCC00]
                    [&::-webkit-slider-thumb]:border-3 [&::-webkit-slider-thumb]:border-[#1a1a1a]
                    [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(255,204,0,0.4)]" />
              </div>
              <div className="flex justify-between text-[7px] font-black text-white/10">
                <span>Straight</span><span>Max curve</span>
              </div>
            </div>
          </div>
          <button onClick={onRelease}
            className="w-full py-5 bg-gradient-to-r from-[#FFCC00] to-[#FFD633] hover:from-[#FFD633] hover:to-[#FFE066] text-[#1a1a1a] font-black text-lg uppercase rounded-xl tracking-wider transition-all shadow-[0_4px_20px_rgba(255,204,0,0.4)] hover:shadow-[0_6px_30px_rgba(255,204,0,0.6)] active:scale-[0.97] cursor-pointer">
            <ArrowDown className="w-5 h-5 inline mr-2" />
            SLAM!
          </button>
        </div>
      )}
    </div>
  )
}
