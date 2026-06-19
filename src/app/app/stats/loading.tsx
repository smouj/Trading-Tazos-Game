import { Loader2 } from "lucide-react"

export default function StatsLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-ttg-yellow mx-auto" />
        <p className="text-[10px] font-black text-ttg-black/20 uppercase tracking-[0.3em]">
          Loading Stats…
        </p>
      </div>
    </div>
  )
}
