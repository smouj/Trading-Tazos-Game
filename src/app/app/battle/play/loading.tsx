import { Loader2, Swords } from "lucide-react"

export default function BattlePlayLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a14]">
      <div className="text-center space-y-6">
        <Swords className="w-12 h-12 text-ttg-yellow/30 mx-auto animate-pulse" />
        <div className="space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-ttg-yellow mx-auto" />
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
            Entering Arena…
          </p>
        </div>
      </div>
    </div>
  )
}
