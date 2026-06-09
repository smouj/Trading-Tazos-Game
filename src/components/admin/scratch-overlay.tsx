"use client";

import { useMemo } from "react";

// Seeded random for deterministic scratch patterns
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

interface ScratchLine {
  x1: number; y1: number; x2: number; y2: number;
  width: number; opacity: number;
}

function generateScratches(wearPct: number, seed: number, size: number): ScratchLine[] {
  const rng = seededRandom(seed);
  const count = Math.floor(wearPct * 1.5); // max ~150 scratches at 100%
  const scratches: ScratchLine[] = [];

  for (let i = 0; i < count; i++) {
    // Clusters: some scratches group together
    const cx = rng() * size;
    const cy = rng() * size;
    const clusterSize = Math.floor(rng() * 4) + 1;

    for (let j = 0; j < clusterSize && scratches.length < count; j++) {
      const angle = rng() * Math.PI * 2;
      const length = size * (0.02 + rng() * 0.25);
      const spread = rng() * 30;

      const x1 = cx + Math.cos(angle - 0.3) * spread + (rng() - 0.5) * size * 0.1;
      const y1 = cy + Math.sin(angle - 0.3) * spread + (rng() - 0.5) * size * 0.1;
      const x2 = x1 + Math.cos(angle) * length;
      const y2 = y1 + Math.sin(angle) * length;

      scratches.push({
        x1, y1, x2, y2,
        width: 0.3 + rng() * 1.5,
        opacity: 0.15 + rng() * 0.5 * (wearPct / 100),
      });
    }
  }

  return scratches;
}

// Edge wear: little nicks around the border
function generateEdgeWear(wearPct: number, seed: number, _size: number, radius: number) {
  const rng = seededRandom(seed + 9999);
  const count = Math.floor(wearPct * 0.6);
  const nicks: { angle: number; depth: number; width: number; opacity: number }[] = [];

  for (let i = 0; i < count; i++) {
    nicks.push({
      angle: rng() * Math.PI * 2,
      depth: radius * (0.01 + rng() * 0.04) * (wearPct / 100),
      width: radius * (0.01 + rng() * 0.03),
      opacity: 0.1 + rng() * 0.5 * (wearPct / 100),
    });
  }

  return nicks;
}

interface ScratchOverlayProps {
  wearLevel: number; // 0-100
  tazoSlug?: string; // for deterministic seed
  size: number; // px
  className?: string;
}

export default function ScratchOverlay({ wearLevel, tazoSlug = "default", size, className }: ScratchOverlayProps) {
  const seed = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < tazoSlug.length; i++) {
      hash = ((hash << 5) - hash) + tazoSlug.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }, [tazoSlug]);

  const radius = size / 2;
  const scratches = useMemo(() => generateScratches(wearLevel, seed, size), [wearLevel, seed, size]);
  const edgeNicks = useMemo(() => generateEdgeWear(wearLevel, seed, size, radius), [wearLevel, seed, size, radius]);

  if (wearLevel === 0) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`absolute inset-0 pointer-events-none ${className || ""}`}
      style={{ mixBlendMode: "screen" }}
    >
      <defs>
        <clipPath id={`disc-clip-${seed}`}>
          <circle cx={size / 2} cy={size / 2} r={radius} />
        </clipPath>
      </defs>

      <g clipPath={`url(#disc-clip-${seed})`}>
        {/* Surface scratches */}
        {scratches.map((s, i) => (
          <line
            key={`s-${i}`}
            x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
            stroke={`rgba(180,180,190,${s.opacity.toFixed(3)})`}
            strokeWidth={s.width}
            strokeLinecap="round"
          />
        ))}

        {/* Edge nicks */}
        {edgeNicks.map((n, i) => {
          const cx = size / 2 + Math.cos(n.angle) * radius;
          const cy = size / 2 + Math.sin(n.angle) * radius;
          const ex = cx + Math.cos(n.angle) * n.depth;
          const ey = cy + Math.sin(n.angle) * n.depth;
          return (
            <line
              key={`e-${i}`}
              x1={cx} y1={cy} x2={ex} y2={ey}
              stroke={`rgba(160,160,170,${n.opacity.toFixed(3)})`}
              strokeWidth={n.width * 20}
              strokeLinecap="round"
            />
          );
        })}

        {/* General fade/dulling (overall opacity) */}
        {wearLevel > 30 && (
          <rect
            x={0} y={0} width={size} height={size}
            fill={`rgba(200,200,210,${((wearLevel - 30) * 0.002).toFixed(3)})`}
          />
        )}

        {/* Edge fading */}
        {wearLevel > 50 && (
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={`rgba(180,180,180,${((wearLevel - 50) * 0.004).toFixed(3)})`}
            strokeWidth={wearLevel * 0.3}
          />
        )}
      </g>

      {/* Unclipped edge damage */}
      {edgeNicks.filter(() => wearLevel > 40).slice(0, Math.floor(wearLevel * 0.3)).map((n, i) => {
        const cx = size / 2 + Math.cos(n.angle) * (radius - 1);
        const cy = size / 2 + Math.sin(n.angle) * (radius - 1);
        const ex = cx + Math.cos(n.angle) * n.depth * 3;
        const ey = cy + Math.sin(n.angle) * n.depth * 3;
        return (
          <line
            key={`ue-${i}`}
            x1={cx} y1={cy} x2={ex} y2={ey}
            stroke={`rgba(150,150,160,${(n.opacity * 0.6).toFixed(3)})`}
            strokeWidth={n.width * 15}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}
