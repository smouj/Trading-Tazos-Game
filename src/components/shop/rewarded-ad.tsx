"use client"

import { useState, useEffect, useCallback } from "react"
import { MAX_REWARDED_ADS_PER_DAY, REWARDED_AD_CREDITS, REWARDED_AD_COOLDOWN_SECONDS } from "@/lib/monetization"

interface RewardedAdButtonProps {
  isAuthenticated: boolean
  onRewardClaimed?: (newBalance: number) => void
}

interface AdStatus {
  used: number
  remaining: number
  dailyLimit: number
  reward: number
  cooldownRemaining: number
}

export function RewardedAdButton({ isAuthenticated, onRewardClaimed }: RewardedAdButtonProps) {
  const [status, setStatus] = useState<AdStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [claimed, setClaimed] = useState(false)

  const fetchStatus = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const res = await fetch("/api/credits/rewarded-ad")
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
      }
    } catch {
      // Silently fail — user can still try
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  // Cooldown countdown
  useEffect(() => {
    if (!status?.cooldownRemaining) return
    const timer = setInterval(() => {
      setStatus((prev) =>
        prev ? { ...prev, cooldownRemaining: Math.max(0, prev.cooldownRemaining - 1) } : null
      )
    }, 1000)
    return () => clearInterval(timer)
  }, [status?.cooldownRemaining])

  const handleWatchAd = async () => {
    if (!isAuthenticated || loading) return
    setLoading(true)
    setError("")
    setClaimed(false)

    try {
      // In a real implementation, this would show an actual AdSense rewarded ad.
      // For now, we simulate the ad completion and call the API.
      //
      // Production flow:
      // 1. Load AdSense rewarded ad via google.ads.slot or Ad Manager
      // 2. On ad completion, call POST /api/credits/rewarded-ad
      // 3. Grant credits server-side with rate limiting

      const res = await fetch("/api/credits/rewarded-ad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adProvider: "adsense" }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Could not claim reward")
        return
      }

      setClaimed(true)
      onRewardClaimed?.(data.credits)
      // Refresh status
      fetchStatus()

      // Reset claimed message after 3s
      setTimeout(() => setClaimed(false), 3000)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) return null

  const canWatch =
    status && status.remaining > 0 && status.cooldownRemaining === 0 && !loading

  return (
    <div className="rewarded-ad">
      <div className="rewarded-header">
        <span className="rewarded-icon">🎬</span>
        <div>
          <strong>Watch & Earn</strong>
          <p>Watch a short ad to earn free credits</p>
        </div>
      </div>

      <div className="rewarded-info">
        <span className="reward-num">+{REWARDED_AD_CREDITS} credits</span>
        <span className="reward-divider">·</span>
        <span className="reward-limit">
          {status ? `${status.remaining}/${status.dailyLimit} remaining today` : "Loading..."}
        </span>
      </div>

      {error && <div className="ad-error">{error}</div>}
      {claimed && <div className="ad-success">✅ +{REWARDED_AD_CREDITS} credits earned!</div>}

      <button
        className="watch-ad-button"
        onClick={handleWatchAd}
        disabled={!canWatch}
      >
        {loading
          ? "Loading ad..."
          : status?.cooldownRemaining
          ? `Wait ${status.cooldownRemaining}s`
          : status?.remaining === 0
          ? "Come back tomorrow"
          : "🎬 Watch Ad"}
      </button>

      {status?.remaining === 0 && (
        <p className="resets-note">Resets at midnight (CEST).</p>
      )}

      <style jsx>{`
        .rewarded-ad {
          background: linear-gradient(135deg, #FEF3C7, #FFFBEB);
          border: 2px solid #FFCC00;
          border-radius: 12px;
          padding: 16px 20px;
          max-width: 400px;
        }
        .rewarded-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }
        .rewarded-icon {
          font-size: 1.8rem;
        }
        .rewarded-header strong {
          display: block;
          font-size: 1rem;
          color: #1a1a1a;
        }
        .rewarded-header p {
          margin: 2px 0 0;
          font-size: 0.8rem;
          color: #666;
        }
        .rewarded-info {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          font-size: 0.85rem;
        }
        .reward-num {
          font-weight: 700;
          color: #E3350D;
        }
        .reward-divider {
          color: #ccc;
        }
        .reward-limit {
          color: #888;
        }
        .ad-error {
          background: #FEE2E2;
          color: #991B1B;
          padding: 6px 10px;
          border-radius: 6px;
          margin-bottom: 10px;
          font-size: 0.8rem;
        }
        .ad-success {
          background: #D1FAE5;
          color: #065F46;
          padding: 6px 10px;
          border-radius: 6px;
          margin-bottom: 10px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .watch-ad-button {
          width: 100%;
          padding: 10px;
          background: #1a1a1a;
          color: #FFCC00;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s;
        }
        .watch-ad-button:hover:not(:disabled) {
          background: #333;
        }
        .watch-ad-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .resets-note {
          text-align: center;
          color: #aaa;
          font-size: 0.75rem;
          margin: 8px 0 0;
        }
      `}</style>
    </div>
  )
}
