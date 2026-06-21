const globalForAsyncLocks = globalThis as unknown as {
  ttgAsyncLocks?: Map<string, Promise<void>>
}

const locks = globalForAsyncLocks.ttgAsyncLocks ?? new Map<string, Promise<void>>()

if (process.env.NODE_ENV !== "production") {
  globalForAsyncLocks.ttgAsyncLocks = locks
}

export async function withAsyncLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const previous = locks.get(key) ?? Promise.resolve()
  let release!: () => void
  const current = new Promise<void>((resolve) => {
    release = resolve
  })
  const next = previous.then(() => current, () => current)

  locks.set(key, next)

  await previous
  try {
    return await fn()
  } finally {
    release()
    if (locks.get(key) === next) {
      locks.delete(key)
    }
  }
}
