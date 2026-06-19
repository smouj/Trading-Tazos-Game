import { Loader2 } from "lucide-react"

export default function BattlePracticeLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-ttg-yellow mx-auto" />
        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
          Loading Practice Arena…
        </p>
      </div>
    </div>
  )
}
