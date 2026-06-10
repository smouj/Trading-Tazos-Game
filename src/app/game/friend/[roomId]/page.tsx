"use client"

// Friend Battle — PvP with room code
import { useParams } from "next/navigation"
import BattleView from "@/components/game/battle-view"

export default function FriendPage() {
  const params = useParams()
  const roomId = params.roomId as string

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <BattleView />
      {/* Room code display for sharing */}
      <div className="fixed top-4 right-4 z-50 px-3 py-1.5 bg-[#FFCC00] border-2 border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a]">
        <span className="text-[9px] font-black text-[#1a1a1a]/40 uppercase tracking-wider">Room</span>
        <span className="ml-1.5 text-xs font-black text-[#1a1a1a] uppercase tracking-[0.1em]">{roomId}</span>
      </div>
    </div>
  )
}
