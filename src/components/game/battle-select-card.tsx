'use client'

import { Tazo, RARITY_CONFIG, CONDITION_CONFIG } from '@/lib/game/types'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BattleSelectCardProps {
  tazo: Tazo
  selected: boolean
  onSelect: (id: string) => void
  disabled?: boolean
}

const FRANCHISE_COLORS: Record<string, string> = {
  pokemon: '#FFCB05',
  digimon: '#00A1E9',
  dbz: '#FF6B00',
}

const COMBAT_TYPE_COLORS: Record<string, string> = {
  fire: '#F08030',
  water: '#6890F0',
  grass: '#78C850',
  electric: '#F8D030',
  psychic: '#F85888',
  ghost: '#705898',
  dragon: '#7038F8',
  normal: '#A8A878',
  vaccine: '#4FC3F7',
  virus: '#E040FB',
  data: '#66BB6A',
  saiyan: '#FFD700',
  namekian: '#4CAF50',
  android: '#78909C',
  majin: '#E91E63',
  frieza: '#9C27B0',
}

export function BattleSelectCard({ tazo, selected, onSelect, disabled }: BattleSelectCardProps) {
  const rarity = RARITY_CONFIG[tazo.rarity]
  const condition = CONDITION_CONFIG[tazo.condition]
  const franchiseColor = FRANCHISE_COLORS[tazo.franchise?.slug || ''] || '#888'
  const combatColor = COMBAT_TYPE_COLORS[tazo.combatType || ''] || '#888'

  const statBars = [
    { label: 'ATK', value: tazo.attack, color: 'bg-red-500' },
    { label: 'DEF', value: tazo.defense, color: 'bg-blue-500' },
    { label: 'SPN', value: tazo.spin, color: 'bg-green-500' },
    { label: 'WGT', value: tazo.weight, color: 'bg-amber-600' },
    { label: 'AUR', value: tazo.aura, color: 'bg-purple-500' },
    { label: 'CTR', value: tazo.control, color: 'bg-cyan-500' },
  ]

  return (
    <button
      onClick={() => !disabled && onSelect(tazo.id)}
      disabled={disabled}
      className={cn(
        'relative group border-3 border-black p-3 transition-all duration-200 text-left w-full',
        'hover:scale-[1.03] active:scale-[0.97]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2',
        selected
          ? 'bg-yellow-300 shadow-[3px_3px_0_0_#000] ring-2 ring-yellow-500'
          : 'bg-white shadow-[2px_2px_0_0_#000] hover:shadow-[3px_3px_0_0_#000]',
        disabled && 'opacity-40 cursor-not-allowed hover:scale-100 hover:shadow-[2px_2px_0_0_#000]'
      )}
    >
      {/* Selection checkmark - magazine sticker style */}
      {selected && (
        <div className="absolute -top-2 -right-2 z-10 bg-red-500 border-2 border-black rounded-full w-6 h-6 flex items-center justify-center shadow-[2px_2px_0_0_#000] animate-in zoom-in duration-200">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Header: Name + Franchise */}
      <div className="flex items-start justify-between gap-1 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-sm truncate leading-tight text-black">{tazo.name}</h3>
          <p className="text-[10px] text-black/50 font-bold truncate">{tazo.franchise?.name}</p>
        </div>
        <div
          className="w-4 h-4 rounded-full shrink-0 mt-0.5 border-2 border-black"
          style={{ backgroundColor: franchiseColor }}
        />
      </div>

      {/* Badges */}
      <div className="flex items-center gap-1 mb-2 flex-wrap">
        <Badge
          variant="outline"
          className={cn('text-[9px] px-1.5 py-0 h-4 font-black border-2', rarity.color, rarity.bgColor, rarity.borderColor)}
        >
          {rarity.label}
        </Badge>
        {tazo.combatType && (
          <Badge
            variant="outline"
            className="text-[9px] px-1.5 py-0 h-4 text-white border-2 border-black font-bold"
            style={{ backgroundColor: combatColor }}
          >
            {tazo.combatType}
          </Badge>
        )}
        <span className="text-[9px]" title={condition.effect}>{condition.icon}</span>
      </div>

      {/* Mini stat bars */}
      <div className="grid grid-cols-3 gap-x-2 gap-y-1">
        {statBars.map((stat) => (
          <div key={stat.label} className="flex items-center gap-1">
            <span className="text-[7px] text-black/50 font-black w-6">{stat.label}</span>
            <div className="flex-1 h-1.5 bg-black/10 border border-black/20 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', stat.color)}
                style={{ width: `${stat.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Skill */}
      {tazo.skill && (
        <p className="text-[9px] text-black/50 mt-1.5 truncate italic font-bold">
          {tazo.skill}
        </p>
      )}
    </button>
  )
}
