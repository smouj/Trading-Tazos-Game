"use client"

import { useState, useEffect } from "react"
import TazoDiscImage from "@/components/game/tazo-disc-image"
import TazoDetailModal from "@/components/game/tazo-detail-modal"
import type { TazoFinish, TazoCreatureVariant } from "@/lib/battle/game-loop"

interface TazoData {
  id: string
  name: string
  displayName?: string | null
  slug: string
  imageUrl: string
  backImageUrl?: string | null
  finish: TazoFinish
  creatureVariant: TazoCreatureVariant
  shinyImageUrl?: string | null
  wear: number
  franchiseSlug?: string
  franchise?: { slug: string }
  franchiseName?: string
  rarity: string
  condition: string
  attack: number; defense: number; resistance: number
  weight: number; stability: number; spin: number
  control: number; bounce: number; precision: number
  battleWins: number; battleLosses: number
  isOwned: boolean
  number?: number | null
  collectionYear?: number | string | null
}

export function TazoCollectionShowcase({ franchise, color }: { franchise: string; color: string }) {
  const [tazos, setTazos] = useState<TazoData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTazo, setSelectedTazo] = useState<TazoData | null>(null)

  useEffect(() => {
    fetch(`/api/tazos?franchise=${franchise}&publishStatus=published&limit=20`)
      .then(r => r.json())
      .then(d => {
        setTazos((d.tazos || []).map((t: any) => ({
          ...t,
          isOwned: true,
          backImageUrl: t.backImageUrl || `/tazos-artgen/backs/${franchise}-back.png`,
          franchiseSlug: t.franchiseSlug || (typeof t.franchise === "string" ? t.franchise : franchise),
        })))
      })
      .catch(() => setTazos([]))
      .finally(() => setLoading(false))
  }, [franchise])

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-black uppercase tracking-wider text-[#1a1a1a] mb-4">Featured Tazos</h2>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-full bg-[#1a1a1a]/5 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!tazos.length) return null

  const displayTazos = tazos.slice(0, 16)

  return (
    <>
      <div className="mb-8">
        <h2 className="text-lg font-black uppercase tracking-wider text-[#1a1a1a] mb-4 flex items-center gap-2">
          Featured Tazos
          <span className="text-[10px] font-bold px-2 py-0.5 border-2 border-[#1a1a1a]/20 text-[#1a1a1a]/50">{tazos.length} tazos</span>
        </h2>
        <div className="bg-white border-3 border-[#1a1a1a] p-4 sm:p-5 shadow-[4px_4px_0px_#1a1a1a]">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-3">
            {displayTazos.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTazo(t)}
                className="group relative aspect-square rounded-full overflow-hidden border-2 border-[#1a1a1a]/20 hover:border-[#1a1a1a]/80 hover:scale-110 hover:z-10 transition-all bg-white cursor-pointer"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}
                title={t.displayName || t.name}
              >
                <TazoDiscImage
                  src={t.imageUrl}
                  alt={t.displayName || t.name}
                  size="100%"
                  borderWidth={0}
                  franchiseSlug={t.franchiseSlug || franchise}
                  finish={t.finish}
                  creatureVariant={t.creatureVariant}
                  shinyImageUrl={t.shinyImageUrl}
                  wear={t.wear}
                  lazy
                />
              </button>
            ))}
          </div>
          {tazos.length > 16 && (
            <p className="text-[10px] font-bold text-[#1a1a1a]/30 mt-3 text-center uppercase tracking-wider">
              +{tazos.length - 16} more tazos in this collection
            </p>
          )}
        </div>
      </div>

      <TazoDetailModal
        tazo={selectedTazo as any}
        open={!!selectedTazo}
        onClose={() => setSelectedTazo(null)}
      />
    </>
  )
}
