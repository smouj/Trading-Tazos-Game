// ============================================================
// Trading Tazos Game — Battle Tube Preview
// CSS 2.5D physical tube visualization for deck builder
// ============================================================
"use client"

import TazoDiscImage from "@/components/game/tazo-disc-image"

interface TubeTazo {
  id: string
  name: string
  displayName?: string
  imageUrl: string | null
  finish?: string | null
  creatureVariant?: string | null
  shinyImageUrl?: string | null
  franchiseSlug?: string
  franchise?: string
}

interface BattleTubePreviewProps {
  name?: string
  color?: string
  count?: number
  maxCount?: number
  tazos?: TubeTazo[]
  starters?: string[]
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  showCap?: boolean
  className?: string
}

export default function BattleTubePreview({
  name, color = "#E3350D", count = 0, maxCount = 20,
  tazos = [], starters = [],
  size = "md", showLabel = true, showCap = true,
  className = "",
}: BattleTubePreviewProps) {
  const sizes = {
    sm: { width: 64, capH: 10, labelH: 14, discSize: 10, maxDiscs: 10 },
    md: { width: 120, capH: 18, labelH: 22, discSize: 16, maxDiscs: 14 },
    lg: { width: 200, capH: 28, labelH: 36, discSize: 24, maxDiscs: 18 },
  }
  const s = sizes[size]
  const fillPct = Math.min(100, maxCount > 0 ? (count / maxCount) * 100 : 0)
  const displayTazos = tazos.slice(0, s.maxDiscs)
  const labelText = name ? name.toUpperCase() : "EMPTY TUBE"

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* ═══ CAP ═══ */}
      <div
        className="relative border-3 border-[#1a1a1a] flex-shrink-0"
        style={{
          width: s.width + 8,
          height: s.capH,
          background: `linear-gradient(180deg, ${lighten(color, 20)} 0%, ${color} 40%, ${darken(color, 15)} 100%)`,
          borderBottom: "none",
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
          boxShadow: `inset 0 2px 0 ${lighten(color, 30)}40, 3px 0 0 #1a1a1a`,
        }}
      >
        {/* Cap ridge lines */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1a1a1a]/20" />
        <div className="absolute bottom-[5px] left-0 right-0 h-[2px] bg-[#1a1a1a]/15" />
      </div>

      {/* ═══ TUBE BODY ═══ */}
      <div
        className="relative border-3 border-[#1a1a1a] overflow-hidden flex-shrink-0"
        style={{
          width: s.width + 8,
          height: size === "lg" ? 260 : size === "md" ? 170 : 100,
          borderTop: "none",
          background: `linear-gradient(90deg, 
            rgba(255,254,240,0.7) 0%, rgba(255,254,240,0.95) 15%, 
            rgba(255,254,240,0.98) 50%, 
            rgba(255,254,240,0.95) 85%, rgba(255,254,240,0.7) 100%)`,
          boxShadow: `inset 0 0 20px rgba(26,26,26,0.06), 
            inset 3px 0 8px rgba(255,255,255,0.4),
            inset -3px 0 8px rgba(26,26,26,0.05)`,
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 4,
        }}
      >
        {/* Glass reflections */}
        <div className="absolute left-0 top-0 bottom-0 w-[25%] pointer-events-none"
          style={{
            background: "linear-gradient(90deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)",
            borderRight: "1px solid rgba(255,255,255,0.2)",
          }} />
        <div className="absolute right-[10%] top-[20%] w-1 h-[30%] rounded-full bg-white/20 pointer-events-none" />

        {/* ═══ STACKED DISCS ═══ */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col-reverse items-center"
          style={{ paddingBottom: size === "lg" ? 36 : size === "md" ? 22 : 14 }}>
          {displayTazos.map((tazo, i) => {
            const isStarter = starters.includes(tazo.id)
            const offsetFromBottom = i * (s.discSize * 0.38)
            const layerOpacity = 1 - (i * 0.01)
            return (
              <div
                key={tazo.id}
                className="absolute rounded-full overflow-hidden border-2 border-[#1a1a1a]/40"
                style={{
                  width: s.discSize + 6,
                  height: s.discSize + 6,
                  bottom: (size === "lg" ? 36 : size === "md" ? 22 : 14) + offsetFromBottom,
                  opacity: layerOpacity,
                  transform: `translateX(${Math.sin(i * 1.7) * 4}px)`,
                  zIndex: i + 1,
                  background: "#1a1a1a",
                  boxShadow: isStarter ? `0 0 6px ${color}80` : "none",
                }}
              >
                <TazoDiscImage
                  src={tazo.imageUrl}
                  alt={tazo.displayName || tazo.name || ""}
                  size="100%"
                  borderWidth={0}
                  franchiseSlug={tazo.franchiseSlug || tazo.franchise || "minimon"}
                  finish={(tazo.finish as any) || "normal"}
                  creatureVariant={(tazo.creatureVariant as any) || "standard"}
                  shinyImageUrl={tazo.shinyImageUrl}
                  lazy
                />
              </div>
            )
          })}

          {/* Fill indicators for empty slots */}
          {count > displayTazos.length && (
            <div className="absolute left-1/2 -translate-x-1/2 flex flex-col gap-[1px] items-center"
              style={{ bottom: size === "lg" ? 28 : size === "md" ? 16 : 10 }}>
              {Array.from({ length: Math.min(count - displayTazos.length, 6) }).map((_, i) => (
                <div key={`fill-${i}`}
                  className="rounded-full border border-[#1a1a1a]/15"
                  style={{
                    width: s.discSize - 4,
                    height: 2,
                    background: `${color}30`,
                  }} />
              ))}
            </div>
          )}
        </div>

        {/* Fill meter bar */}
        <div className="absolute left-2 top-2 bottom-2 w-[3px] rounded-full bg-[#1a1a1a]/8 overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-500"
            style={{
              height: `${fillPct}%`,
              background: count >= maxCount
                ? `linear-gradient(180deg, #22C55E 0%, #16A34A 100%)`
                : `linear-gradient(180deg, ${color} 0%, ${darken(color, 10)} 100%)`,
            }} />
        </div>
      </div>

      {/* ═══ LABEL / STICKER ═══ */}
      {showLabel && (
        <div
          className="relative -mt-1 border-2 border-[#1a1a1a] flex-shrink-0"
          style={{
            width: s.width + 14,
            padding: "4px 6px",
            background: `repeating-linear-gradient(
              -30deg, transparent, transparent 3px,
              rgba(255,255,255,0.3) 3px, rgba(255,255,255,0.3) 6px
            ), linear-gradient(135deg, ${color} 0%, ${darken(color, 5)} 100%)`,
            boxShadow: `2px 2px 0 #1a1a1a`,
          }}
        >
          <p className="text-[8px] font-black text-white text-center uppercase tracking-[0.12em] leading-tight truncate"
            style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.3)" }}>
            {labelText}
          </p>
          <p className="text-[7px] font-black text-white/70 text-center leading-tight">
            {count}/{maxCount} TAZOS
          </p>
        </div>
      )}

      {/* Seal indicator */}
      {count >= maxCount && (
        <div className="mt-1 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] border border-[#1a1a1a]/30" />
          <span className="text-[7px] font-black text-[#22C55E] uppercase tracking-[0.2em]">Sealed</span>
        </div>
      )}
    </div>
  )
}

// ── Color helpers ────────────────────────────────────
function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16)
  const r = Math.min(255, (num >> 16) + amount)
  const g = Math.min(255, ((num >> 8) & 0xff) + amount)
  const b = Math.min(255, (num & 0xff) + amount)
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`
}
function darken(hex: string, amount: number): string {
  return lighten(hex, -amount)
}
