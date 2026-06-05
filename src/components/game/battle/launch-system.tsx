// ============================================================
// Trading Tazos Game — Launch System
// Professional throw controls: aim (drag/swipe), power (timing),
// spin selector. Mobile-first with keyboard fallbacks on desktop.
// ============================================================
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { SpinType } from "@/lib/battle/game-loop"
import { Crosshair, Zap, Disc3, Target, RotateCw } from "lucide-react"

interface LaunchSystemProps {
  phase: "aim" | "power" | "spin"
  onAimLock: (x: number, y: number, accuracy: number) => void
  onPowerLock: (power: number, accuracy: number) => void
  onSpinLock: (spin: SpinType) => void
  throwingTazoName: string
  throwingTazoFranchise: string
}

export default function LaunchSystem({
  phase, onAimLock, onPowerLock, onSpinLock,
  throwingTazoName, throwingTazoFranchise,
}: LaunchSystemProps) {
  // ─── AIM State ───
  const [aimX, setAimX] = useState(0.5)
  const [aimY, setAimY] = useState(0.5)
  const aimAnimRef = useRef<number>(0)
  const aimDirRef = useRef({ x: 1, y: 1 })
  const [aimLocked, setAimLocked] = useState(false)

  // ─── POWER State ───
  const [power, setPower] = useState(0.5)
  const powerAnimRef = useRef<number>(0)
  const powerDirRef = useRef(-1)
  const [powerLocked, setPowerLocked] = useState(false)

  // ─── SPIN State ───
  const [spin, setSpin] = useState<SpinType>("none")

  // ─── Scope sight animation (aim) ───
  useEffect(() => {
    if (phase !== "aim" || aimLocked) return
    let running = true
    const tick = () => {
      if (!running) return
      setAimX(prev => {
        let next = prev + aimDirRef.current.x * 0.004
        if (next >= 0.85) aimDirRef.current.x = -1
        if (next <= 0.15) aimDirRef.current.x = 1
        return next
      })
      setAimY(prev => {
        let next = prev + aimDirRef.current.y * 0.0065
        if (next >= 0.85) aimDirRef.current.y = -1
        if (next <= 0.15) aimDirRef.current.y = 1
        return next
      })
      aimAnimRef.current = requestAnimationFrame(tick)
    }
    aimAnimRef.current = requestAnimationFrame(tick)
    return () => { running = false; cancelAnimationFrame(aimAnimRef.current) }
  }, [phase, aimLocked])

  // ─── Power pulsing animation ───
  useEffect(() => {
    if (phase !== "power" || powerLocked) return
    let running = true
    const tick = () => {
      if (!running) return
      setPower(prev => {
        let next = prev + powerDirRef.current * 0.008
        if (next >= 0.92) { powerDirRef.current = -1; return 0.92 }
        if (next <= 0.08) { powerDirRef.current = 1; return 0.08 }
        return next
      })
      powerAnimRef.current = requestAnimationFrame(tick)
    }
    powerAnimRef.current = requestAnimationFrame(tick)
    return () => { running = false; cancelAnimationFrame(powerAnimRef.current) }
  }, [phase, powerLocked])

  // ─── Lock aim ───
  const handleLockAim = useCallback(() => {
    if (phase !== "aim" || aimLocked) return
    cancelAnimationFrame(aimAnimRef.current)
    setAimLocked(true)
    const accuracy = 1 - (Math.abs(aimX - 0.5) + Math.abs(aimY - 0.5)) * 0.8
    onAimLock(aimX * 2 - 1, aimY * 2 - 1, Math.max(0.1, accuracy))
  }, [phase, aimLocked, aimX, aimY, onAimLock])

  // ─── Lock power ───
  const handleLockPower = useCallback(() => {
    if (phase !== "power" || powerLocked) return
    cancelAnimationFrame(powerAnimRef.current)
    setPowerLocked(true)
    // Power accuracy: higher power = less accurate
    const accuracy = 1 - power * 0.5
    onPowerLock(power, accuracy)
  }, [phase, powerLocked, power, onPowerLock])

  // ─── Lock spin ───
  const handleLockSpin = useCallback(() => {
    if (phase !== "spin") return
    onSpinLock(spin)
  }, [phase, spin, onSpinLock])

  // ─── Keyboard bindings ───
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault()
        if (phase === "aim") handleLockAim()
        else if (phase === "power") handleLockPower()
        else if (phase === "spin") handleLockSpin()
      }
      if (phase === "spin") {
        if (e.key === "1") setSpin("topspin")
        if (e.key === "2") setSpin("backspin")
        if (e.key === "3") setSpin("sidespin")
        if (e.key === "0") setSpin("none")
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [phase, handleLockAim, handleLockPower, handleLockSpin])

  // ─── Reset locks when phase changes ───
  useEffect(() => { setAimLocked(false); setPowerLocked(false) }, [phase])

  const franchiseColor = throwingTazoFranchise === "minimon" ? "#FFCB05"
    : throwingTazoFranchise === "cybermon" ? "#00A1E9" : "#FF6B00"

  // ─── AIM Phase ───
  if (phase === "aim") {
    return (
      <div className="p-4 bg-white border-3 border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-[#E3350D]" />
          <span className="font-black text-sm uppercase text-[#1a1a1a]">Aim Throw</span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded border" style={{ color: franchiseColor, borderColor: franchiseColor }}>
          {throwingTazoName}
        </span>
      </div>

      {/* Crosshair display */}
      <div className="relative h-36 sm:h-48 bg-[#0a0a1a] border-2 border-[#1a1a1a] rounded overflow-hidden">
        {/* Grid */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        {/* Moving crosshair */}
        <div className="absolute transition-none pointer-events-none"
          style={{
            left: `${aimX * 100}%`,
            top: `${aimY * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="relative">
            <Crosshair className="w-8 h-8 text-[#FFCC00]" style={{ filter: "drop-shadow(0 0 6px #FFCC00)" }} />
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-[#FFCC00]/50" />
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 h-12 w-0.5 bg-[#FFCC00]/50" />
          </div>
        </div>
      </div>

      <div className="text-center text-xs font-bold text-[#1a1a1a]/40">
        Tap screen or press SPACE to lock aim
      </div>

      <button
        onClick={handleLockAim}
        className="w-full py-3 font-black text-sm uppercase tracking-wider bg-[#FFCC00] text-[#1a1a1a] border-3 border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
      >
        <Target className="w-4 h-4 inline mr-2" />
        Lock Aim
      </button>
    </div>
    )
  }

  // ─── POWER Phase ───
  if (phase === "power") {
    const powerPct = Math.round(power * 100)
    const risk = power > 0.7 ? "Risky!" : power > 0.45 ? "Good" : "Safe"
    const riskColor = power > 0.7 ? "#E3350D" : power > 0.45 ? "#F59E0B" : "#22C55E"

    return (
      <div className="p-4 bg-white border-3 border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#F59E0B]" />
          <span className="font-black text-sm uppercase text-[#1a1a1a]">Throw Power</span>
        </div>

        {/* Power circle */}
        <div className="flex items-center justify-center py-2">
          <div className="relative w-40 h-40 sm:w-48 sm:h-48">
            <div className="absolute inset-0 rounded-full border-4 border-[#1a1a1a] bg-[#0a0a1a]" />
            {/* Expanding/contracting circle */}
            <div
              className="absolute rounded-full transition-none border-3 border-[#1a1a1a]"
              style={{
                width: `${power * 100}%`,
                height: `${power * 100}%`,
                top: `${(1 - power) * 50}%`,
                left: `${(1 - power) * 50}%`,
                background: power > 0.7
                  ? "radial-gradient(circle, #E3350D, #FF6B00)"
                  : power > 0.45
                  ? "radial-gradient(circle, #F59E0B, #FFCC00)"
                  : "radial-gradient(circle, #22C55E, #78C850)",
              }}
            />
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl sm:text-4xl font-black text-white"
                style={{ textShadow: "2px 2px 0px #1a1a1a" }}
              >
                {powerPct}%
              </span>
              <span className="text-xs font-bold mt-1" style={{ color: riskColor }}>
                {risk}
              </span>
            </div>
          </div>
        </div>

        {/* Power bar visual */}
        <div className="w-full h-3 bg-zinc-200 border-2 border-[#1a1a1a] rounded overflow-hidden">
          <div
            className="h-full transition-none"
            style={{
              width: `${power * 100}%`,
              background: `linear-gradient(90deg, #22C55E, #F59E0B 50%, #E3350D)`,
            }}
          />
        </div>

        <div className="text-center text-xs font-bold text-[#1a1a1a]/40">
          Press SPACE to lock power &amp; throw!
        </div>

        <button
          onClick={handleLockPower}
          className="w-full py-3 font-black text-sm uppercase tracking-wider bg-[#E3350D] text-white border-3 border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
        >
          <Zap className="w-4 h-4 inline mr-2" />
          LAUNCH TAZO!
        </button>
      </div>
    )
  }

  // ─── SPIN Phase ───
  if (phase === "spin") {
    const spins: { type: SpinType; label: string; desc: string; icon: React.ReactNode }[] = [
      { type: "topspin", label: "Topspin", desc: "Extra damage, low bounce", icon: <RotateCw className="w-5 h-5" /> },
      { type: "backspin", label: "Backspin", desc: "Defensive, stays in zone", icon: <RotateCw className="w-5 h-5 rotate-180" /> },
      { type: "sidespin", label: "Sidespin", desc: "Curve, unpredictable path", icon: <Disc3 className="w-5 h-5" /> },
      { type: "none", label: "No Spin", desc: "Straight, simple throw", icon: <Target className="w-5 h-5" /> },
    ]

    return (
      <div className="p-4 bg-white border-3 border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] space-y-4">
        <div className="flex items-center gap-2">
          <Disc3 className="w-5 h-5 text-[#A855F7]" />
          <span className="font-black text-sm uppercase text-[#1a1a1a]">Select Spin</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {spins.map(s => (
            <button
              key={s.type}
              onClick={() => setSpin(s.type)}
              className={`p-3 border-2 text-left transition-all ${
                spin === s.type
                  ? "border-[#A855F7] bg-[#A855F710] shadow-[2px_2px_0px_#A855F7]"
                  : "border-[#1a1a1a]/20 hover:border-[#1a1a1a]/60"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={spin === s.type ? "text-[#A855F7]" : "text-[#1a1a1a]/50"}>
                  {s.icon}
                </span>
                <div className="font-black text-xs uppercase text-[#1a1a1a]">{s.label}</div>
              </div>
              <div className="text-[10px] text-[#1a1a1a]/40 ml-7">{s.desc}</div>
            </button>
          ))}
        </div>

        <button
          onClick={handleLockSpin}
          className="w-full py-3 font-black text-sm uppercase tracking-wider bg-[#A855F7] text-white border-3 border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
        >
          <Disc3 className="w-4 h-4 inline mr-2" />
          Throw with {spin}
        </button>
      </div>
    )
  }

  return null
}
