// ============================================================
// Trading Tazos Game — User Settings Page
// Profile info, stats, logout. Accessible from dashboard.
// ============================================================
"use client"

import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n"
import { User, Settings, LogOut, Disc3, Layers, Coins, Mail, Calendar, Shield } from "lucide-react"

export default function SettingsPage() {
  const { t } = useI18n()
  const { user, logout } = useAuth()

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <Shield className="w-12 h-12 mx-auto text-zinc-300" />
        <p className="text-sm font-bold text-zinc-400 uppercase">
          {t.auth_login || "Sign In"} to view settings
        </p>
        <a
          href={`/login?redirect=${encodeURIComponent("/app/settings")}`}
          className="mag-btn inline-block bg-[#E3350D] text-white px-8 py-3 text-sm font-black uppercase tracking-wider"
        >
          {t.auth_login || "Sign In"}
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-[#1a1a1a]" />
        <h2 className="text-lg font-black uppercase tracking-wider text-[#1a1a1a]">
          {t.settings_title || "User Settings"}
        </h2>
      </div>

      {/* Profile card */}
      <div className="mag-card bg-white p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#FFCC00] border-3 border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] flex items-center justify-center shrink-0">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-[#1a1a1a]" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-black text-[#1a1a1a] uppercase truncate">
              {user.displayName || user.name}
            </h3>
            <p className="text-[11px] font-bold text-zinc-500 flex items-center gap-1">
              <Mail className="w-3 h-3" /> {user.email}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#FFCC00]/10 border-2 border-[#1a1a1a] p-3 text-center">
            <Disc3 className="w-5 h-5 mx-auto text-[#E3350D] mb-1" />
            <p className="text-xl font-black text-[#1a1a1a]">{user.tazoCount ?? 0}</p>
            <p className="text-[9px] font-black uppercase text-zinc-500">Tazos</p>
          </div>
          <div className="bg-[#3B4CCA]/10 border-2 border-[#1a1a1a] p-3 text-center">
            <Layers className="w-5 h-5 mx-auto text-[#3B4CCA] mb-1" />
            <p className="text-xl font-black text-[#1a1a1a]">{user.deckCount ?? 0}</p>
            <p className="text-[9px] font-black uppercase text-zinc-500">Decks</p>
          </div>
          <div className="bg-[#22C55E]/10 border-2 border-[#1a1a1a] p-3 text-center">
            <Coins className="w-5 h-5 mx-auto text-[#F59E0B] mb-1" />
            <p className="text-xl font-black text-[#1a1a1a]">--</p>
            <p className="text-[9px] font-black uppercase text-zinc-500">Credits</p>
          </div>
        </div>

        {/* Account info */}
        <div className="space-y-1.5 text-[11px] font-bold text-zinc-600">
          <p className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Member since June 2026
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={logout}
          className="w-full mag-btn bg-[#E3350D] text-white px-6 py-3 text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          {t.auth_logout || "Log Out"}
        </button>
      </div>
    </div>
  )
}
