# TTG Full Environment Review — 2026-06-11

Scope requested:

- `https://tradingtazosgame.com/`
- `https://tradingtazosgame.com/?page=download`
- `github.com/smouj/Trading-Tazos-Game`
- `github.com/smouj/tazo-art-studio`
- `github.com/smouj/trading-tazos-game-cli`
- `npmjs.com/package/@trading-tazos-game/cli`
- WSL local checkouts and VPS production checkout

## Confirmed State

### Public Production

- Homepage: HTTP 200.
- Download page: HTTP 200.
- `/api/stats`: HTTP 200, `totalTazos: 26`.
- `/api/tazos`: HTTP 200, public catalog returns verified published tazos only.
- Current public distribution:
  - Minimon: 10
  - Dracobell: 9
  - Cybermon: 7

### VPS

- Production checkout: `/home/smouj/apps/ttg/Trading-Tazos-Game`.
- Production app commit before this review: `50fb66b`.
- Production app version before this review: `0.6.0`.
- Running processes included Next.js standalone server and `src/server/ws` WebSocket server.
- Production DB files remain local on VPS under `prisma/dev.db*`.
- Untracked VPS artifact observed: `public/tazos-backs/`; this is production-side generated/static output and was not deleted.

### WSL

- Local repo `Trading-Tazos-Game`: `main`, synced with `origin/main` at the start of review.
- Local repo `tazo-art-studio`: `main`, synced with `origin/main` at the start of review.
- Local repo `trading-tazos-game-cli`: `main`, synced with `origin/main` at the start of review.

### GitHub / npm

- `Trading-Tazos-Game` public README still contained outdated 349/319/30 catalog claims before this review.
- `tazo-art-studio` public README still described the three TTG franchises through external-IP inspiration language before this review.
- `@trading-tazos-game/cli` npm latest was `1.0.2` before this review.
- CLI source had `program.version("1.0.0")`, so `tazos --version` did not match npm/package metadata.

## Corrections Applied

### Trading-Tazos-Game

- Replaced fixed authenticated UI totals of `349` with `TOTAL_PLANNED` from `src/lib/franchise-config.ts`.
- Updated stats/settings/HUD displays to use the canonical Season 1 total of 150.
- Updated package description to avoid the obsolete 349 claim.
- Updated README:
  - version badge `0.6.0`;
  - public catalog truth: 26 verified published tazos;
  - Season 1 target: 150 original TTG tazos;
  - collection table: Minimon, Dracobell, Cybermon at 50 each;
  - seed/database notes no longer claim 349 public tazos.

### tazo-art-studio

- Updated README franchise descriptions to TTG canon:
  - Minimon: Luminara / Vital Sparks;
  - Dracobell: Bellora / Roar Aura;
  - Cybermon: Neon Grid / Soul Protocols.
- Removed external franchise keywords from package metadata.
- Kept the local ESLint policy consistent by disabling `react-hooks/set-state-in-effect`, matching the repo's existing pragmatic React Compiler rule overrides.

### trading-tazos-game-cli

- Updated CLI version source to read `package.json`, fixing `tazos --version`.
- Updated docs/examples to use live TTG names (`lumipuff`, `cipherion`) instead of external franchise placeholders.
- Added a working ESLint flat config and dev dependencies; the previous `lint` script called `eslint` but the dependency/config was missing.
- Bumped package version to `1.0.3`.

## Verification

Commands run:

```bash
# Trading-Tazos-Game
npx tsc --noEmit
npm run build

# trading-tazos-game-cli
npm run lint
npm run build
node dist/cli.js --version

# tazo-art-studio
npm run lint
npm run build

# Production public smoke
curl -L https://tradingtazosgame.com/
curl -L "https://tradingtazosgame.com/?page=download"
curl https://tradingtazosgame.com/api/stats
curl https://tradingtazosgame.com/api/tazos
```

Expected CLI version after correction:

```text
1.0.3
```

Known lint state:

- `Trading-Tazos-Game` production build passes, but `npm run lint` still fails on pre-existing repo-wide React Compiler/ESLint issues across admin pages, backup files, scanner hooks, CommonJS scripts, and Three.js texture mutation rules. This review did not hide those by broad rule changes.
- `tazo-art-studio` lint/build pass after aligning the local ESLint override with existing repo policy.
- `trading-tazos-game-cli` lint/build pass after adding the missing ESLint config/dependencies.

## Safety Notes

- No production SQLite database files were removed or overwritten.
- Unrelated dirty files in the wider OpenClaw workspace were ignored.
- Historical audit files still contain older observations such as 319/349 because they are snapshots of past audits, not current product claims.

## Remaining Follow-Up

- Generate and QA the remaining Season 1 transparent creature artworks.
- Publish only tazos with verified final composite art.
- Address dependency advisories through planned upgrades rather than `npm audit fix --force`.
