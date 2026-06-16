// App route loading skeleton — magazine theme
export default function AppRouteLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full bg-[#FFCC00]/10 animate-ping" />
        <div className="absolute inset-0 rounded-full bg-[#FFCC00]/5 animate-pulse" style={{ animationDuration: "2s" }} />
      </div>
      <div className="w-10 h-10 rounded-full border-[3px] border-[#1a1a1a]/10 border-t-[#FFCC00] animate-spin" />
      <p className="text-xs font-black text-[#1a1a1a]/20 uppercase tracking-[0.3em] animate-pulse">
        Loading
      </p>
    </div>
  )
}
