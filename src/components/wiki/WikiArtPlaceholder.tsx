"use client";
import { Disc3 } from "lucide-react";

interface WikiArtPlaceholderProps {
  name: string;
  series: "minimon" | "cybermon" | "draco_bell";
  status: "created" | "pending" | "unconfirmed";
  size?: number;
}

const SERIES_COLORS = {
  minimon: { ring: "#2E7D32", bg: "#E8F5E9" },
  cybermon: { ring: "#1565C0", bg: "#E3F2FD" },
  draco_bell: { ring: "#E65100", bg: "#FFF3E0" },
};

const STATUS_LABELS: Record<string, string> = {
  created: "Arte creado",
  pending: "Arte pendiente",
  unconfirmed: "Arte no confirmado",
};

const STATUS_COLORS: Record<string, string> = {
  created: "bg-green-100 text-green-800 border-green-300",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  unconfirmed: "bg-gray-100 text-gray-500 border-gray-300",
};

export default function WikiArtPlaceholder({
  name,
  series,
  status,
  size = 160,
}: WikiArtPlaceholderProps) {
  const colors = SERIES_COLORS[series];
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col items-center gap-2" role="img" aria-label={`Placeholder para ${name}`}>
      <div
        className="rounded-full flex items-center justify-center relative border-4"
        style={{
          width: size,
          height: size,
          backgroundColor: colors.bg,
          borderColor: colors.ring,
          boxShadow: `3px 3px 0 ${colors.ring}40`,
        }}
      >
        {/* Halftone dots background */}
        <div
          className="absolute inset-0 rounded-full opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle, ${colors.ring} 1px, transparent 1px)`,
            backgroundSize: "6px 6px",
          }}
        />
        {status === "created" ? (
          <Disc3
            className="relative z-10"
            size={size * 0.35}
            style={{ color: colors.ring }}
            strokeWidth={1.5}
          />
        ) : (
          <span
            className="relative z-10 font-black"
            style={{
              fontSize: size * 0.25,
              color: colors.ring,
              opacity: 0.6,
            }}
          >
            {initials}
          </span>
        )}
      </div>
      <span
        className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${STATUS_COLORS[status]}`}
        style={{ boxShadow: "1px 1px 0 rgba(0,0,0,0.1)" }}
      >
        {STATUS_LABELS[status] || "Sin estado"}
      </span>
    </div>
  );
}
