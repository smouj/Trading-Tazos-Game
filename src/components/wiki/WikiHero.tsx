import { WIKI_SERIES_CONFIG } from "@/lib/wiki-types";
import type { TTGWikiSeries } from "@/lib/wiki-types";

interface WikiHeroProps {
  series?: TTGWikiSeries;
  title: string;
  subtitle?: string;
  total?: number;
}

export default function WikiHero({ series, title, subtitle, total }: WikiHeroProps) {
  const cfg = series ? WIKI_SERIES_CONFIG[series] : null;

  return (
    <div
      className="relative overflow-hidden border-2 border-[#1a1a1a] mb-8"
      style={{
        backgroundColor: cfg?.bgColor || "#FFF9E6",
        boxShadow: "4px 4px 0 #1a1a1a",
      }}
    >
      {/* Halftone dots background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, ${cfg?.color || "#1a1a1a"} 1px, transparent 1px)`,
          backgroundSize: "8px 8px",
          opacity: 0.08,
        }}
      />

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none">
        <div
          className="absolute top-0 left-0 w-full h-1"
          style={{ backgroundColor: cfg?.color || "#1a1a1a" }}
        />
        <div
          className="absolute top-0 left-0 w-1 h-full"
          style={{ backgroundColor: cfg?.color || "#1a1a1a" }}
        />
      </div>
      <div className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none">
        <div
          className="absolute bottom-0 right-0 w-full h-1"
          style={{ backgroundColor: cfg?.color || "#1a1a1a" }}
        />
        <div
          className="absolute bottom-0 right-0 w-1 h-full"
          style={{ backgroundColor: cfg?.color || "#1a1a1a" }}
        />
      </div>

      <div className="relative px-6 py-8 sm:px-10 sm:py-12">
        <h1 className="text-2xl sm:text-4xl font-black text-[#1a1a1a] uppercase tracking-[0.05em] leading-none">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm sm:text-base font-bold text-[#1a1a1a]/60 max-w-2xl">
            {subtitle}
          </p>
        )}
        {total !== undefined && (
          <div className="mt-4 flex items-center gap-2">
            <span
              className="text-xs font-black text-white px-3 py-1.5 border-2 border-[#1a1a1a]"
              style={{
                backgroundColor: cfg?.color || "#1a1a1a",
                boxShadow: "2px 2px 0 #1a1a1a",
              }}
            >
              {total} TAZOS
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
