"use client"

import { useEffect, useRef, useCallback } from "react"

/**
 * Re-fetches data when the browser tab/window becomes visible again.
 * @param fetchFn - async function to refetch
 * @param options.enabled - defaults to true
 */
export function useVisibilityRefresh(
  fetchFn: () => Promise<void>,
  options: { enabled?: boolean } = {}
) {
  const enabled = options.enabled ?? true
  const lastFetchRef = useRef(0)
  const MIN_INTERVAL_MS = 5000 // Don't refetch more than once every 5s

  const safeFetch = useCallback(async () => {
    const now = Date.now()
    if (now - lastFetchRef.current < MIN_INTERVAL_MS) return
    lastFetchRef.current = now
    await fetchFn()
  }, [fetchFn])

  useEffect(() => {
    if (!enabled) return

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        safeFetch()
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => document.removeEventListener("visibilitychange", onVisibilityChange)
  }, [enabled, safeFetch])
}
