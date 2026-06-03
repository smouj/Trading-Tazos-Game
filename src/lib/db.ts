import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? [] : ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

/** Helper: current ISO timestamp for explicit DateTime values (avoids SQLite ms-timestamp bug) */
export function isoNow(): string {
  return new Date().toISOString()
}
