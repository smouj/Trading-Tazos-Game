# TTG Collections Lore Update — 2026-06-11

Scope:

- `/?page=collections`
- `/?page=collections-minimon`
- `/?page=collections-dracobell`
- `/?page=collections-cybermon`

## Canon Applied

The public collection pages now follow the Season 1 bible:

- Minimon: Luminara, Vital Sparks, Pathfinders, Luminara Nodes, lineage awakening.
- Dracobell: Bellora, Roar Aura, resonance phases, Bell Shards, Crown Bell.
- Cybermon: Neon Grid, Soul Protocol, Boot/Patch/Surge/Core/Prime forms, Blackout Drift, Core Gates.

## Corrections

- Removed older generic collection copy from the launcher pages.
- Replaced outdated Cybermon 48-count canon with the Season 1 target of 50.
- Clarified franchise config so static totals are canonical Season 1 totals, while public published counts come from `/api/stats`.
- Kept public visibility rules intact: only verified published tazos are exposed by the catalog API.

## Validation

Required checks:

```bash
npx tsc --noEmit
npm run build
```

Production deploy should preserve the VPS SQLite database and sidecar files.
