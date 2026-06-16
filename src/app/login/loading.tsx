// Auth page loading skeleton — magazine theme
export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#FFF9E6" }}>
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(circle, #1a1a1a 1px, transparent 1px)", backgroundSize: "6px 6px" }} />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full bg-[#FFCC00]/15 animate-ping" />
          <div className="absolute inset-0 rounded-full bg-[#FFCC00]/10 animate-pulse" style={{ animationDuration: "2s" }} />
        </div>
        <div className="w-10 h-10 rounded-full border-[3px] border-[#1a1a1a]/10 border-t-[#FFCC00] animate-spin" />
        <p className="text-xs font-black text-[#1a1a1a]/25 uppercase tracking-[0.3em] animate-pulse">
          Loading
        </p>
      </div>
    </div>
  )
}
