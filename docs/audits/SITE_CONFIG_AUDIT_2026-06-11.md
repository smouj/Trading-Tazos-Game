# Site Config Audit — 2026-06-11

## Commit
**9235efc** — `chore: update sitemap lastmod to 2026-06-11`

## Objective
Centralize all site-level constants, metadata, and URLs into `src/lib/site-config.ts` as the single source of truth. Deploy per-page metadata, sitemap, robots.txt, and version API.

## Changes

### New Files
| File | Purpose |
|------|---------|
| `src/lib/site-config.ts` | Central SITE_CONFIG: name, version, totalTazos, series, social, PAGE_META, FOOTER_LINKS |
| `src/app/sitemap.ts` | Dynamic sitemap generation (static `public/sitemap.xml` takes precedence) |
| `src/app/robots.ts` | Dynamic robots.txt (static `public/robots.txt` takes precedence) |
| `src/app/api/version/route.ts` | REST API returning full SITE_CONFIG data |
| `src/app/game/practice/layout.tsx` | Metadata: Practice Battle (noIndex) |
| `src/app/game/ranked/layout.tsx` | Metadata: Ranked Battle |

### Modified Files
| File | Changes |
|------|---------|
| `src/app/layout.tsx` | Import SITE_CONFIG; use `SITE_CONFIG.totalTazos`, `SITE_CONFIG.supportEmail`, `SITE_CONFIG.social` in JSON-LD |
| `src/app/page.tsx` | `generateMetadata` with per-page metadata via PAGE_META for all `?page=` routes |
| `src/app/login/layout.tsx` | Use PAGE_META["login"] |
| `src/app/tazos/layout.tsx` | Dynamic total count from SITE_CONFIG |
| `src/lib/metadata.ts` | Use SITE_CONFIG.canonicalUrl instead of hardcoded |
| `src/components/magazine-page-shell.tsx` | Import SITE_CONFIG + FOOTER_LINKS; footer links/version from SITE_CONFIG |
| `src/components/game-shell.tsx` | Import SITE_CONFIG; version from SITE_CONFIG.version |
| `src/components/game/launcher-view.tsx` | Import TOTAL_PLANNED + SITE_CONFIG; stat chips, FAQ, footer version from config |

### Hardcoded Values Replaced
- `148` / `149` → `SITE_CONFIG.totalTazos` (150) or `TOTAL_PLANNED`
- `9 stats` → `8 stats` (SITE_CONFIG.statsCount)
- `v0.6.0` → `{SITE_CONFIG.version}`
- `© 2026 Trading Tazos Game · v0.6.0` → `© 2026 {SITE_CONFIG.name} · v{SITE_CONFIG.version}`
- `support@tradingtazosgame.com` → `SITE_CONFIG.supportEmail`
- Social links → `FOOTER_LINKS.social`
- Footer links → `FOOTER_LINKS.info` / `FOOTER_LINKS.legal`

## Verification — All 23 Routes

| Route | HTTP | Title | Canonical | Robots |
|-------|------|-------|-----------|--------|
| `/` | 200 | Collect, Trade & Battle 150 Tazos | `/` | index,follow |
| `/?page=how-to-play` | 200 | How to Play — Trading Tazos Game | `/?page=how-to-play` | index,follow |
| `/?page=collections` | 200 | Collections — 150 Tazos Across 3 Series | `/?page=collections` | index,follow |
| `/?page=tazos` | 200 | Tazo Catalog — Browse All Published Tazos | `/?page=tazos` | index,follow |
| `/?page=leaderboard` | 200 | Leaderboard — Top Players & Rankings | `/?page=leaderboard` | index,follow |
| `/?page=download` | 200 | Download — Trading Tazos Game Apps | `/?page=download` | index,follow |
| `/?page=faq` | 200 | FAQ — Frequently Asked Questions | `/?page=faq` | index,follow |
| `/?page=shop` | 200 | Shop — Tazo Bags & Packs | `/?page=shop` | index,follow |
| `/?page=privacy` | 200 | Privacy Policy — Trading Tazos Game | `/?page=privacy` | index,follow |
| `/?page=terms` | 200 | Terms of Service — Trading Tazos Game | `/?page=terms` | index,follow |
| `/?page=contact` | 200 | Contact — Trading Tazos Game | `/?page=contact` | index,follow |
| `/login` | 200 | Login — Trading Tazos Game | `/login` | index,follow |
| `/game/practice` | 200 | Practice Battle | `/game/practice` | noindex,nofollow |
| `/game/ranked` | 200 | Ranked Battle | `/game/ranked` | noindex,nofollow |
| `/app/collection` | 307 | (auth redirect) | — | — |
| `/app/shop` | 307 | (auth redirect) | — | — |
| `/app/battle` | 307 | (auth redirect) | — | — |
| `/sitemap.xml` | 200 | — | — | — |
| `/robots.txt` | 200 | — | — | — |
| `/api/health` | 200 | — | — | — |
| `/api/version` | 200 | — | — | — |
| `/api/stats` | 200 | totalTazos: 26 | — | — |
| `/api/tazos` | 200 | published tazos | — | — |

## State After Deploy

| Metric | Value |
|--------|-------|
| Git commit | `9235efc` (main) |
| VPS git | `9235efc` (synced via `origin/main`) |
| PM2 ttg | online, pid 3549361, 72 restarts |
| PM2 ttg-ws | online, pid 3503887, 7 restarts |
| DB | 349 total / 26 published |
| VPS disk | 69GB / 96GB (72%) |
| VPS RAM | 2.3GB / 7.9GB |
| BUILD_ID (VPS) | `hd2z508uDXBqhMjrAtN1b` |
| BUILD_ID (WSL) | `ub1AGYE1t4WPTNVBeAzmC` (built separately, same code) |

## External Repos

| Repo | Description | Status |
|------|-------------|--------|
| smouj/Trading-Tazos-Game | Updated to "150 tazos" | ✅ |
| smouj/tazo-art-studio | Correct | ✅ |
| smouj/trading-tazos-game-cli | Correct | ✅ |
| npm @trading-tazos-game/cli | v1.0.3 | ✅ |
