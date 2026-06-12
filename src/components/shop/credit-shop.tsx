"use client"

import { useState } from "react"
import { CREDIT_PACKAGES, formatPrice, formatCredits } from "@/lib/monetization"

interface CreditShopProps {
  userCredits: number
  isAuthenticated: boolean
  onPurchase?: (packageId: string) => void
}

export function CreditShop({ userCredits, isAuthenticated, onPurchase }: CreditShopProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const handlePurchase = async (packageId: string) => {
    if (!isAuthenticated) return
    setLoading(packageId)
    setError("")
    setSuccessMsg("")

    try {
      const res = await fetch("/api/credits/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Purchase failed")
        return
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
        return
      }

      if (data.dev) {
        setSuccessMsg(data.message)
        onPurchase?.(packageId)
        // Refresh credits
        setTimeout(() => window.location.reload(), 1500)
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="credit-shop">
      <div className="credit-shop-header">
        <h3>💎 Credit Shop</h3>
        <p className="credit-balance">
          Your balance: <strong>{formatCredits(userCredits)} credits</strong>
        </p>
      </div>

      {error && <div className="shop-error">{error}</div>}
      {successMsg && <div className="shop-success">{successMsg}</div>}

      <div className="credit-packages">
        {CREDIT_PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className={`credit-package ${pkg.isPopular ? "popular" : ""}`}
          >
            {pkg.isPopular && <span className="popular-badge">🔥 Most Popular</span>}

            <div className="package-name">{pkg.name}</div>

            <div className="package-credits">
              <span className="credit-amount">{formatCredits(pkg.credits)}</span>
              <span className="credit-label">credits</span>
            </div>

            {pkg.bonusPct > 0 && (
              <div className="package-bonus">+{pkg.bonusPct}% EXTRA</div>
            )}

            <div className="package-price">{formatPrice(pkg.priceCents)}</div>

            <button
              className="buy-button"
              onClick={() => handlePurchase(pkg.id)}
              disabled={!!loading || !isAuthenticated}
            >
              {loading === pkg.id ? "Processing..." : "Buy Now"}
            </button>
          </div>
        ))}
      </div>

      <div className="shop-footer">
        <p>
          Prices include VAT. One-time purchase, no subscription.{" "}
          <a href="/refund-policy" target="_blank">Refund Policy</a>
        </p>
      </div>

      <style jsx>{`
        .credit-shop {
          max-width: 900px;
          margin: 0 auto;
          padding: 24px 16px;
        }
        .credit-shop-header {
          text-align: center;
          margin-bottom: 24px;
        }
        .credit-shop-header h3 {
          font-size: 1.5rem;
          color: #1a1a1a;
          margin: 0 0 8px;
        }
        .credit-balance {
          color: #555;
          font-size: 1.05rem;
        }
        .credit-balance strong {
          color: #E3350D;
        }
        .shop-error {
          background: #FEE2E2;
          color: #991B1B;
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 0.9rem;
        }
        .shop-success {
          background: #D1FAE5;
          color: #065F46;
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .credit-packages {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }
        .credit-package {
          background: #fff;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          padding: 20px 16px;
          text-align: center;
          transition: transform 0.15s, box-shadow 0.15s;
          position: relative;
        }
        .credit-package:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.1);
        }
        .credit-package.popular {
          border-color: #FFCC00;
          background: linear-gradient(135deg, #FFFBEB, #fff);
        }
        .popular-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: #FFCC00;
          color: #1a1a1a;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 3px 12px;
          border-radius: 20px;
          white-space: nowrap;
        }
        .package-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 4px 0 8px;
        }
        .package-credits {
          margin-bottom: 6px;
        }
        .credit-amount {
          font-size: 2rem;
          font-weight: 800;
          color: #E3350D;
          line-height: 1;
        }
        .credit-label {
          display: block;
          font-size: 0.8rem;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .package-bonus {
          background: #D1FAE5;
          color: #065F46;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
          display: inline-block;
          margin-bottom: 8px;
        }
        .package-price {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 12px;
        }
        .buy-button {
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
        .buy-button:hover:not(:disabled) {
          background: #333;
        }
        .buy-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .shop-footer {
          text-align: center;
          color: #888;
          font-size: 0.8rem;
        }
        .shop-footer a {
          color: #E3350D;
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}
