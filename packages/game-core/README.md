# @ttg/game-core

Pure game engine rules and types for Trading Tazos Game.

## What's here
- **Types**: `TazoStats`, `StakedTazo`, `BattlePhase`, `Arena3DConfig`, etc.
- **Rules**: `drawStartingHand`, `isElimination`, `validateBattleConfig`, etc.
- **Constants**: `DECK_SIZE=20`, `STARTING_HAND_SIZE=5`, `DRAW_PER_TURN=1`, `GAME_RULES`

## Zero dependencies
Pure TypeScript — no React, no Next.js, no DOM, no I/O.
Suitable for: browser, server, CLI, tests, simulator.

## Source of truth
All `DECK_SIZE` / `STARTING_HAND_SIZE` / `DRAW_PER_TURN` constants in the TTG
ecosystem should import from here (web app, CLI, tests).
