// ============================================================
// game-core/rules.test.ts — Pure game rules test suite
//
// These tests validate the core game logic with zero
// dependencies on React, Next.js, DOM, or I/O.
// Same rules that run in: browser, server, CLI, simulator.
// ============================================================

import { describe, it, expect } from 'vitest'
import {
  isValidDeckSize,
  drawStartingHand,
  drawTurnCard,
  isElimination,
  isPointsVictory,
  determineWinner,
  canBetTazo,
  validateBattleConfig,
  GAME_RULES,
} from '../rules'
import { DECK_SIZE, STARTING_HAND_SIZE, DRAW_PER_TURN } from '../types'
import type { TazoRef, StakedTazo, BattleConfig, Arena3DConfig } from '../types'

// ── Helpers ──────────────────────────────────────────────────

function makeTazo(id = 't1', attrs: Partial<TazoRef> = {}): TazoRef {
  return {
    id, name: `Tazo ${id}`, franchiseSlug: 'minimon',
    stats: { attack: 50, defense: 50, resistance: 50, weight: 50, stability: 50, spin: 50, control: 50, bounce: 30, precision: 50 },
    ...attrs,
  } as TazoRef
}

function makeDeck(n: number): TazoRef[] {
  return Array.from({ length: n }, (_, i) => makeTazo(`d${i + 1}`))
}

function makeStaked(owner: 'player' | 'opponent', n: number): StakedTazo[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `${owner}-${i}`, tazoRef: makeTazo(`${owner}-t${i}`),
    owner, position: { x: i * 0.1, z: 0 }, rotation: 0,
    flipped: false, wobbling: false, wobbleIntensity: 0,
  }))
}

function makeArena(overrides: Partial<Arena3DConfig> = {}): Arena3DConfig {
  return {
    width: 3, depth: 3, wallHeight: 0.3, gravity: 9.8, floorFriction: 0.4,
    name: 'Test Arena', description: 'Test', theme: 'default',
    ...overrides,
  }
}

function makeConfig(overrides: Partial<BattleConfig> = {}): BattleConfig {
  return {
    mode: 'practice', aiDifficulty: 'skilled',
    playerDeck: makeDeck(DECK_SIZE),
    opponentDeck: makeDeck(DECK_SIZE),
    arena: makeArena(),
    maxRounds: 15,
    ...overrides,
  }
}

// ── Deck Rules ──────────────────────────────────────────────

describe('Deck Rules', () => {
  describe('isValidDeckSize', () => {
    it('accepts exactly 20', () => {
      expect(isValidDeckSize(20)).toBe(true)
    })
    it('rejects 19', () => {
      expect(isValidDeckSize(19)).toBe(false)
    })
    it('rejects 21', () => {
      expect(isValidDeckSize(21)).toBe(false)
    })
    it('rejects 0', () => {
      expect(isValidDeckSize(0)).toBe(false)
    })
  })

  describe('drawStartingHand', () => {
    it('draws 5 from a full 20-tazo deck', () => {
      const deck = makeDeck(20)
      const hand = drawStartingHand(deck)
      expect(hand).toHaveLength(5)
      expect(hand[0].id).toBe('d1') // first 5 in order
      expect(hand[4].id).toBe('d5')
    })
    it('returns all if deck has fewer than 5', () => {
      const deck = makeDeck(3)
      const hand = drawStartingHand(deck)
      expect(hand).toHaveLength(3)
    })
    it('returns empty array for empty deck', () => {
      expect(drawStartingHand([])).toHaveLength(0)
    })
    it('does not mutate the original deck', () => {
      const deck = makeDeck(20)
      const copy = [...deck]
      drawStartingHand(deck)
      expect(deck).toEqual(copy)
    })
  })

  describe('drawTurnCard', () => {
    it('draws 1 tazo from the top', () => {
      const deck = makeDeck(5)
      const { drawn, remaining } = drawTurnCard(deck)
      expect(drawn?.id).toBe('d1')
      expect(remaining).toHaveLength(4)
      expect(remaining[0].id).toBe('d2')
    })
    it('returns null drawn and empty remaining for empty deck', () => {
      const { drawn, remaining } = drawTurnCard([])
      expect(drawn).toBeNull()
      expect(remaining).toHaveLength(0)
    })
    it('returns null drawn for single-card deck (last card)', () => {
      const deck = makeDeck(1)
      const { drawn, remaining } = drawTurnCard(deck)
      expect(drawn?.id).toBe('d1')
      expect(remaining).toHaveLength(0)
    })
    it('does not mutate original', () => {
      const deck = makeDeck(3)
      const copy = [...deck]
      drawTurnCard(deck)
      expect(deck).toEqual(copy)
    })
  })
})

// ── Win Conditions ──────────────────────────────────────────

describe('Win Conditions', () => {
  describe('isElimination', () => {
    it('returns true when opponent has no staked tazos and no hand', () => {
      expect(isElimination([], [])).toBe(true)
    })
    it('returns false when opponent has staked tazos', () => {
      const staked = makeStaked('opponent', 2)
      expect(isElimination(staked, [])).toBe(false)
    })
    it('returns false when opponent has cards in hand', () => {
      expect(isElimination([], [makeTazo('h1')])).toBe(false)
    })
    it('returns false when opponent has both', () => {
      expect(isElimination(makeStaked('opponent', 1), [makeTazo('h1')])).toBe(false)
    })
    it('only counts what is passed — caller filters by owner', () => {
      // isElimination doesn't filter by owner — the CALLER must pass
      // only opponent tazos. If player tazos are passed, it counts them.
      const anyStaked = makeStaked('player', 5) // these count as "staked"
      expect(isElimination(anyStaked as any, [])).toBe(false) // 5 staked = not eliminated
    })
  })

  describe('isPointsVictory', () => {
    it('returns true at round limit with score difference', () => {
      expect(isPointsVictory(8, 5, 15, 15)).toBe(true)
    })
    it('returns false at round limit with tied scores', () => {
      expect(isPointsVictory(7, 7, 15, 15)).toBe(false)
    })
    it('returns false before round limit', () => {
      expect(isPointsVictory(8, 5, 14, 15)).toBe(false)
    })
    it('returns true with small margin at limit', () => {
      expect(isPointsVictory(6, 5, 15, 15)).toBe(true)
    })
  })

  describe('determineWinner', () => {
    it('player wins with higher score', () => {
      expect(determineWinner(10, 5)).toBe('player')
    })
    it('opponent wins with higher score', () => {
      expect(determineWinner(3, 8)).toBe('opponent')
    })
    it('draw with equal scores', () => {
      expect(determineWinner(5, 5)).toBe('draw')
    })
    it('draw with 0-0', () => {
      expect(determineWinner(0, 0)).toBe('draw')
    })
  })
})

// ── Bet Validation ──────────────────────────────────────────

describe('Bet Validation', () => {
  describe('canBetTazo', () => {
    it('allows betting a tazo present in hand', () => {
      const hand = [makeTazo('a'), makeTazo('b'), makeTazo('c')]
      expect(canBetTazo(hand, 'b')).toBe(true)
    })
    it('rejects a tazo not in hand', () => {
      const hand = [makeTazo('a'), makeTazo('b')]
      expect(canBetTazo(hand, 'z')).toBe(false)
    })
    it('rejects empty hand', () => {
      expect(canBetTazo([], 'a')).toBe(false)
    })
  })
})

// ── Config Validation ───────────────────────────────────────

describe('Battle Config Validation', () => {
  it('accepts valid config', () => {
    expect(validateBattleConfig(makeConfig())).toBeNull()
  })
  it('rejects player deck with wrong size', () => {
    const cfg = makeConfig({ playerDeck: makeDeck(19) })
    expect(validateBattleConfig(cfg)).toContain('19')
  })
  it('rejects opponent deck with wrong size', () => {
    const cfg = makeConfig({ opponentDeck: makeDeck(5) })
    expect(validateBattleConfig(cfg)).toContain('5')
  })
  it('rejects maxRounds < 1', () => {
    const cfg = makeConfig({ maxRounds: 0 })
    expect(validateBattleConfig(cfg)).toContain('maxRounds')
  })
  it('accepts maxRounds = 1', () => {
    const cfg = makeConfig({ maxRounds: 1 })
    expect(validateBattleConfig(cfg)).toBeNull()
  })
  it('accepts large maxRounds', () => {
    const cfg = makeConfig({ maxRounds: 999 })
    expect(validateBattleConfig(cfg)).toBeNull()
  })
})

// ── Constants ───────────────────────────────────────────────

describe('Game Constants', () => {
  it('matches documented rules', () => {
    expect(GAME_RULES.deckSize).toBe(20)
    expect(GAME_RULES.startingHandSize).toBe(5)
    expect(GAME_RULES.drawPerTurn).toBe(1)
    expect(GAME_RULES.maxHandSize).toBe(10)
  })
  it('GAME_RULES is defined and has expected shape', () => {
    expect(GAME_RULES).toBeDefined()
    expect(typeof GAME_RULES.deckSize).toBe('number')
  })
})

// ── Exported values match types ─────────────────────────────

describe('Type exports consistency', () => {
  it('DECK_SIZE matches GAME_RULES', () => {
    expect(DECK_SIZE).toBe(GAME_RULES.deckSize)
  })
  it('STARTING_HAND_SIZE matches GAME_RULES', () => {
    expect(STARTING_HAND_SIZE).toBe(GAME_RULES.startingHandSize)
  })
  it('DRAW_PER_TURN matches GAME_RULES', () => {
    expect(DRAW_PER_TURN).toBe(GAME_RULES.drawPerTurn)
  })
})
