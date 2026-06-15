import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const STAT_KEYS = ['attack', 'defense', 'resistance', 'weight', 'stability', 'spin', 'control', 'bounce', 'precision'] as const

export async function GET() {
  try {
    // Single query: find the max value for each stat + join franchise for color
    const results = await db.$queryRawUnsafe<Array<{
      stat_key: string
      tazo_id: string
      tazo_name: string | null
      tazo_display_name: string | null
      tazo_slug: string
      franchise_color: string | null
      franchise_name: string | null
      stat_value: number
    }>>(`
      WITH ranked AS (
        ${STAT_KEYS.map(stat => `
          SELECT '${stat}' as stat_key, t.id as tazo_id, t.name as tazo_name, t."displayName" as tazo_display_name, t.slug as tazo_slug,
                 f.color as franchise_color, f.name as franchise_name, t."${stat}" as stat_value,
                 ROW_NUMBER() OVER (ORDER BY t."${stat}" DESC) as rn
          FROM Tazo t
          LEFT JOIN Franchise f ON t.franchiseId = f.id
          WHERE t.publishStatus = 'published' AND t."${stat}" IS NOT NULL
        `).join(' UNION ALL ')}
      )
      SELECT * FROM ranked WHERE rn = 1
    `)

    const tops: Record<string, { id: string; name: string; slug: string; franchiseColor: string | null; franchiseName: string | null; value: number }> = {}

    for (const row of results) {
      tops[row.stat_key] = {
        id: row.tazo_id,
        name: row.tazo_display_name || row.tazo_name || row.tazo_slug,
        slug: row.tazo_slug,
        franchiseColor: row.franchise_color,
        franchiseName: row.franchise_name,
        value: row.stat_value,
      }
    }

    return NextResponse.json({ tops })
  } catch (error) {
    console.error('Error fetching top stats:', error)
    return NextResponse.json({ error: 'Failed to fetch top stats' }, { status: 500 })
  }
}
