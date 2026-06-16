# v0.8.0 — Public Practice Arena + Hit Zones + Critical Timing ⚔️

Biggest update since launch: anyone can now try the 3D battle arena instantly without creating an account.

## 🎮 Public Practice Arena (`/battle/practice`)
- **No login required** — instant 3D arena play
- Demo deck of 6 tazos, skilled AI opponent
- No data saved (no DB writes, no API calls)
- Post-match CTA: "Create Account" or "Play Again"
- Landing page: guest "Play Now" goes to practice, logged-in goes to `/app/battle`

## 🎯 Hit Zones & Physics Feedback
Each slam now classifies impact as CENTER, EDGE, RIM, or MISS:
- **CENTER** → more push, less flip
- **EDGE** → +18% flip chance
- **RIM** → +20% spin, control penalty
- Visual feedback shown during impact phase

## ⚡ Critical Timing
Charge bar now shows timing quality:
- **PERFECT** (68-76%) → +accuracy bonus, green flash
- **GOOD** (60-82%) → balanced
- **OVERCHARGE** (>82%) → control penalty, red flash
- **WEAK** (<30%) → reduced force, gray

## 🎨 Visual Polish
- Magazine-themed splash screens (root + app loading)
- 8 skeleton loaders (tazo cards, stats, shop, decks)
- Hit feedback overlay during slam impact
- Scroll-reveal + page transition animations

## 🔊 Sound (+6 new SFX)
- page_turn, deck_shuffle, tazo_collect, shop_purchase, level_up, hover
- 20 total procedural sounds via Web Audio API

## 🗺️ Route Architecture Cleaned
- 5 duplicate pages removed (content now single source at `/?page=*`)
- All 54 routes verified, no dead links, no 404s

## 📦 What's Included
- **Web**: tradingtazosgame.com
- **Desktop**: Windows/macOS/Linux installers (CI build pending)
- **CLI**: @trading-tazos-game/cli v1.0.4