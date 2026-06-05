// ============================================================
// Trading Tazos Game — User Settings Page (Game Style)
// ============================================================
"use client"

import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n"
import { User, Settings, LogOut, Disc3, Layers, Coins, Mail, Calendar, Shield } from "lucide-react"

export default function SettingsPage() {
  const { t } = useI18n()
  const { user, logout } = useAuth()

  if (!user) return (
    <div className="max-w-md mx-auto py-20 text-center space-y-5">
      <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center border border-white/[0.06]" style={{ background: "radial-gradient(circle, #FFCC0010, transparent 70%)" }}><Shield className="w-10 h-10 text-white/15" /></div>
      <p className="text-sm font-semibold uppercase tracking-wider text-white/20">{t.auth_login || "Sign In"} to view settings</p>
      <a href={`/login?redirect=${encodeURIComponent("/app/settings")}`} className="game-btn inline-flex px-8 py-3.5 text-xs font-semibold uppercase tracking-widest rounded-lg bg-[#FFCC00] text-black hover:bg-[#FFD633] hover:shadow-[0_0_20px_rgba(255,204,0,0.3)] transition-all">{t.auth_login || "Sign In"}</a>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 space-y-4">

      {/* Banner */}
      <div className="game-banner px-4 py-3 flex flex-wrap items-center gap-3">
        <Settings className="w-5 h-5 text-[#FFCC00]" />
        <span className="text-sm font-bold text-white/80 tracking-wide uppercase">{t.settings_title || "SETTINGS"}</span>
        <div className="w-px h-5 bg-white/[0.06]" />
        <div className="flex items-center gap-1"><Disc3 className="w-4 h-4 text-[#E3350D]" /><span className="text-sm font-bold text-[#E3350D]">{user.tazoCount ?? 0} TAZOS</span></div>
        <div className="w-px h-5 bg-white/[0.06]" />
        <div className="flex items-center gap-1"><Layers className="w-4 h-4 text-[#00A1E9]" /><span className="text-sm font-bold text-[#00A1E9]">{user.deckCount ?? 0} DECKS</span></div>
        <span className="text-xs text-white/15 uppercase tracking-wider ml-auto truncate max-w-[200px]">{user.email}</span>
      </div>

      {/* Profile Card */}
      <div className="game-panel p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center shrink-0 overflow-hidden border-2 border-[#FFCC00]/20" style={{ background: "linear-gradient(135deg, rgba(255,204,0,0.15), rgba(255,204,0,0.05))" }}>
            {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-[#FFCC00]/40" />}
          </div>
          <div className="min-w-0 space-y-1">
            <h3 className="text-xl font-bold text-white/80 uppercase tracking-wide truncate">{user.displayName || user.name}</h3>
            <p className="text-[11px] text-white/20 flex items-center gap-1 uppercase tracking-wider"><Mail className="w-3 h-3" /> {user.email}</p>
            <p className="text-[10px] text-white/[0.08] uppercase tracking-wider flex items-center gap-1"><Calendar className="w-3 h-3" /> Member since 2026</p>
          </div>
        </div>

        {/* Stat bars */}
        <div className="space-y-2.5">
          {[
            { icon: Disc3, label: "Tazos Collected", value: user.tazoCount ?? 0, max: 319, color: "#E3350D" },
            { icon: Layers, label: "Decks Built", value: user.deckCount ?? 0, max: 10, color: "#3B4CCA" },
          ].map(({ icon: Icon, label, value, max, color }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1"><span className="text-[10px] font-semibold uppercase flex items-center gap-1" style={{ color }}><Icon className="w-3.5 h-3.5" /> {label}</span><span className="text-[10px] font-bold text-white/20">{value} / {max}</span></div>
              <div className="game-stat-bar-bg h-3 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (value/max)*100)}%`, background: color }} /></div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Disc3, label: "Tazos", value: user.tazoCount ?? 0, color: "#E3350D", bg: "#E3350D08" },
          { icon: Layers, label: "Decks", value: user.deckCount ?? 0, color: "#3B4CCA", bg: "#3B4CCA08" },
          { icon: Coins, label: "Credits", value: "--", color: "#F59E0B", bg: "#F59E0B08" },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="game-panel p-4 text-center" style={{ background: bg }}>
            <Icon className="w-6 h-6 mx-auto mb-1.5 opacity-40" style={{ color }} />
            <p className="text-2xl font-bold text-white/60">{value}</p>
            <p className="text-[9px] font-semibold uppercase text-white/15 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <button onClick={logout} className="w-full game-btn px-6 py-4 text-sm font-semibold uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 bg-[#E3350D] text-white hover:bg-[#FF2D1A] hover:shadow-[0_0_15px_rgba(227,53,13,0.4)] transition-all">
        <LogOut className="w-4 h-4" /> {t.auth_logout || "Log Out"}
      </button>
    </div>
  )
}
