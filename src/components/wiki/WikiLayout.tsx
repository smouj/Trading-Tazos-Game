import { WIKI_SERIES_CONFIG } from "@/lib/wiki-types";
import type { TTGWikiSeries } from "@/lib/wiki-types";

interface WikiLayoutProps {
  children: React.ReactNode;
  series?: TTGWikiSeries;
}

export default function WikiLayout({ children, series }: WikiLayoutProps) {
  const cfg = series ? WIKI_SERIES_CONFIG[series] : null;

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "#FFF9E6" }}
    >
      {/* Subtle halftone background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, ${cfg?.color || "#1a1a1a"} 1px, transparent 1px)`,
          backgroundSize: "12px 12px",
          opacity: 0.03,
        }}
      />

      {/* Navigation bar */}
      <nav className="sticky top-0 z-40 border-b-2 border-[#1a1a1a] bg-white" style={{ boxShadow: "0 2px 0 rgba(0,0,0,0.05)" }}>
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-4 overflow-x-auto">
          <a
            href="/wiki"
            className="text-sm font-black text-[#1a1a1a] uppercase tracking-wider hover:opacity-70 shrink-0"
          >
            Wiki
          </a>
          <span className="text-[#1a1a1a]/20 font-black">|</span>
          {Object.entries(WIKI_SERIES_CONFIG).map(([key, c]) => (
            <a
              key={key}
              href={`/wiki/${c.slug}`}
              className={`text-xs font-bold uppercase tracking-wider shrink-0 transition-colors ${
                series === key
                  ? "text-[#1a1a1a] border-b-2"
                  : "text-[#1a1a1a]/50 hover:text-[#1a1a1a]"
              }`}
              style={{ borderBottomColor: series === key ? c.color : "transparent", paddingBottom: "2px" }}
            >
              {c.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </div>
    </main>
  );
}
