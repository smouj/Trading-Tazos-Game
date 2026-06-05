# Changelog

## v0.3.2 — Game Client Redesign + Battle Unification (2026-06-05)

### 🎮 Complete Game UI Overhaul
- **New `GameShell`**: Dark immersive game client with ambient particles, glow orbs, and HUD status bar
- **All app pages redesigned**: Shop, Collection, Decks, Stats, Quests, Settings — all transformed from magazine-style to dark video-game aesthetic
- **New CSS game system**: `.game-panel`, `.game-card`, `.game-banner`, `.game-btn`, `.game-input`, `.game-grid-bg`, `.game-empty`
- **Magazine design system retained** for public/landing pages only

### ⚔️ Battle System Unified
- **3D physics results now connect to server API**: Client sends `physicsResult` with actual game data
- **Server fast-path**: When `physicsResult` is provided, skips RPG simulation and saves actual match data
- **Quest progression triggers**: Battles now increment quests with `battle_played`, `battle_won`, `battles_played`, `battles_won` requirements

### 📊 Stats Panel Redesigned
- Dark game panels replace magazine cards
- Unified stat bar styling with glow effects
- Franchise/rarity distribution bars with proper color coding
- Stat champions grid with franchise-colored accents

---

## v0.3.1 — 3D Battle System + 12 Content Fixes (2026-06-05)

### ⚔️ 3D Physics Battle System
- **Complete battle engine** (`game-loop.ts`): State machine (lobby→aim→power→spin→launch→physics→resolve), 60-step physics simulation with friction, wall bounce, disc-to-disc collisions, ring-out
- **AI engine**: 3 difficulty levels (Novice/Skilled/Master)
- **Game Lobby**: Mode selector (Practice/Ranked/Friend Battle), deck builder, auto-best deck
- **Battle Arena 3D**: Coliseum with pillars, neon hover ring, procedurally textured floor
- **Launch System**: Bouncing crosshair aim, pulsing power circle with risk indicator, spin selector
- **Battle HUD**: HP bars with gradients, phase badges, tazo counters
- **Tazo discs**: Real PNG textures loaded via `THREE.TextureLoader` for both front and back

### 🛒 3D Bag Opener
- **Real potato chip bag textures** from `bag-patatas.rar`, processed with Python Pillow (RGBA alpha transparency)
- **Three.js curved plane geometry**: Pillow bag with vertex bulge + sinusoidal wave
- **Tear animation**: Canvas-based jagged line + golden particle burst
- **Bug fixes**: Stale `bagId` closure (useRef pattern), double animation prevention

### 🎮 Game Launcher Landing
- **Magazine 90s redesign**: Cream paper background, halftone dots, comic-style PLAY button with CMYK accents
- **Magazine Splash Screen**: Concentric circles, loading bar with registration marks, "Loading issue #X..."

### 📝 Content Audit — 12 Factual Errors Fixed
- Removed "8 roles" (0 of 319 tazos have a role assigned in DB)
- Fixed battle flow descriptions (aim→power→spin→launch)
- Removed non-existent features (self-flip, chain rebounds, PvP multiplayer, CLI tool)
- Fixed franchise category counts (Dracobell: 7→6, Minimon: only "Tazos")

### 🔗 Battle-Server Connection
- **battle-view.tsx** now calls `POST /api/battle` on `match_end` to save battle results
- **battle-result-panel.tsx** shows `creditsEarned` badge for wins
- Credits awarded for authenticated user victories

### 🏗️ Layout Normalization
- Removed double padding (magazine-page-shell + individual pages)
- Consistent `px-4 sm:px-6` across all dashboard pages
- Battle page keeps `px-3` for 3D viewport needs

### 🧹 Legacy Cleanup
- All "MedaClaw Arena" references removed from public metadata
- Branding unified as "Trading Tazos Game" across all 18 public routes
- Twitter handles and email preserved as real accounts

### 📄 Legal Pages Expanded
- Terms: 11 sections (Acceptance to Contact)
- Privacy: 9 sections (GDPR/Children/Retention)
- Cookies: 6 sections (Essential Only / No Tracking)
- Disclaimer: 7 sections (Fan-Made / IP)

### 📋 Onboarding
- **3-step guided onboarding**: Open Bags → Build Deck → First Battle
- Auto-detects progress via API, dismissible, magazine-style yellow banner

### 🔧 Infrastructure
- **ttg-ws zombie fix**: Competing FlickClaw systemd service stopped + disabled
- **ws-server.js hardened**: EADDRINUSE handling, uncaughtException handler
- **PM2**: max_restarts 5, restart_delay 5000, pre-start port cleanup
- **Cron audit**: `TTG-autonomous-dev-0604` disabled (auto-deploy risk)
- **Password validation**: Server-side changed from min 6 → 10 chars

### 📖 Lore — All 3 Franchises
- **Minimon**: World of Luminara — Life Spark origin, 7 regions, Bond Marks, Blooming evolution (4 phases), The Stillness threat
- **Cybermon**: The Neon Grid — Awakening Upload, 7 sectors, Soul Protocols, Shift evolution (6 phases), The Null Signal
- **Dracobell**: World of Bellora — 7 clans, 7 Bell Shards, Roar Aura (6 types), Ascension (5 phases), Bell Arts (7 techniques)

---

## v0.3.0 — Desktop Release + Public Routes (2026-06-03)
- **Electron desktop app**: Windows (.exe), macOS (.dmg), Linux (.AppImage, .deb) installers
- **Full audit**: 35 routes (21 public + 8 app + 6 legacy), 7 APIs, DB, git, services — all verified
- **WebSocket server**: Matchmaking, rooms, turn relay
- **22-page sitemap**: SEO pages, legal pages, tazo catalog, collections lore
