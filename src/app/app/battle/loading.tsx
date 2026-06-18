// App route loading skeleton — fullscreen dark magazine theme
export default function AppRouteLoading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-6 relative" style={{ background: "var(--ttg-black)" }}>
      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
      }} />
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full bg-ttg-yellow/10 animate-ping" />
        <div className="absolute inset-0 rounded-full bg-ttg-yellow/5 animate-pulse" style={{ animationDuration: "2s" }} />
      </div>
      <div className="w-10 h-10 rounded-full border-[3px] border-white/10 border-t-ttg-yellow animate-spin relative z-10" />
      <p className="text-xs font-black text-white/20 uppercase tracking-[0.3em] animate-pulse relative z-10">
        Loading…
      </p>
    </div>
  )
}
