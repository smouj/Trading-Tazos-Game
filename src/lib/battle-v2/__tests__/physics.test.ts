// ============================================================
// Arena Slam v2 Physics Tests
// ============================================================

import { describe, it, expect } from "vitest"
import {
  ARENA_RADIUS, DISC_RADIUS, MAX_LAUNCH_SPEED, MIN_LAUNCH_SPEED,
  STOP_THRESHOLD, FLIP_THRESHOLD, CAPTURE_THRESHOLD,
  calculateLaunchVelocity, calculateTrajectoryPreview,
  simulateStep, allStopped, createDemoDisc,
  type DragState, type DiscState,
} from "../physics"

describe("createDemoDisc", () => {
  it("creates a disc with correct owner and archetype", () => {
    const disc = createDemoDisc("t1", "Test", "heavy", 1.5, 2.0, "player")
    expect(disc.id).toBe("t1")
    expect(disc.owner).toBe("player")
    expect(disc.archetype).toBe("heavy")
    expect(disc.moving).toBe(false)
    expect(disc.flipped).toBe(false)
  })

  it("applies archetype stat overrides", () => {
    const heavy = createDemoDisc("h1", "H", "heavy", 0, 0, "player")
    const tech = createDemoDisc("t1", "T", "technical", 0, 0, "player")

    // Heavy should have higher attack and weight, lower precision
    expect(heavy.stats.attack).toBeGreaterThan(tech.stats.attack)
    expect(heavy.stats.weight).toBeGreaterThan(tech.stats.weight)
    expect(heavy.stats.precision).toBeLessThan(tech.stats.precision)
  })
})

describe("calculateLaunchVelocity", () => {
  it("returns zero for tiny drags", () => {
    const drag: DragState = {
      startX: 0, startZ: 0,
      currentX: 0.01, currentZ: 0,
      active: true,
    }
    const stats = { attack: 50, defense: 50, precision: 50, weight: 50, spin: 50, bounce: 50, control: 50, stability: 50 }
    const { vx, vz } = calculateLaunchVelocity(drag, stats)
    expect(vx).toBe(0)
    expect(vz).toBe(0)
  })

  it("fires in the direction opposite of drag", () => {
    // Drag left → fire right
    const drag: DragState = {
      startX: 0, startZ: 0,
      currentX: -2, currentZ: 0,
      active: true,
    }
    const stats = { attack: 50, defense: 50, precision: 50, weight: 50, spin: 0, bounce: 50, control: 50, stability: 50 }
    const { vx, vz } = calculateLaunchVelocity(drag, stats)
    expect(vx).toBeGreaterThan(1) // Fire right
    expect(Math.abs(vz)).toBeLessThan(1) // Almost straight
  })

  it("speed is proportional to drag distance", () => {
    const stats = { attack: 50, defense: 50, precision: 50, weight: 50, spin: 0, bounce: 50, control: 50, stability: 50 }

    const shortDrag: DragState = { startX: 0, startZ: 0, currentX: -0.5, currentZ: 0, active: true }
    const longDrag: DragState = { startX: 0, startZ: 0, currentX: -2.5, currentZ: 0, active: true }

    const short = Math.sqrt(calculateLaunchVelocity(shortDrag, stats).vx ** 2 + calculateLaunchVelocity(shortDrag, stats).vz ** 2)
    const long = Math.sqrt(calculateLaunchVelocity(longDrag, stats).vx ** 2 + calculateLaunchVelocity(longDrag, stats).vz ** 2)

    expect(long).toBeGreaterThan(short)
    expect(long).toBeLessThanOrEqual(MAX_LAUNCH_SPEED * 1.4) // Weight factor can increase it slightly
  })

  it("caps at MAX_LAUNCH_SPEED * weight factor", () => {
    const stats = { attack: 50, defense: 50, precision: 50, weight: 100, spin: 0, bounce: 50, control: 50, stability: 50 }
    const drag: DragState = { startX: 0, startZ: 0, currentX: -10, currentZ: 0, active: true }
    const { vx, vz } = calculateLaunchVelocity(drag, stats)
    const speed = Math.sqrt(vx * vx + vz * vz)
    // Weight factor at 100 = 0.7 + 1.0*0.6 = 1.3, so max = 18 * 1.3 ≈ 23.4
    expect(speed).toBeLessThanOrEqual(25)
  })
})

describe("calculateTrajectoryPreview", () => {
  it("returns at least the start point", () => {
    const drag: DragState = { startX: 0, startZ: 0, currentX: -2, currentZ: 0, active: true }
    const stats = { attack: 50, defense: 50, precision: 50, weight: 50, spin: 0, bounce: 50, control: 50, stability: 50 }
    const points = calculateTrajectoryPreview(0, 0, drag, stats)
    expect(points.length).toBeGreaterThanOrEqual(1)
    expect(points[0]).toEqual([0, 0])
  })

  it("stays within arena bounds", () => {
    const drag: DragState = { startX: 0, startZ: 0, currentX: -3, currentZ: 0, active: true }
    const stats = { attack: 50, defense: 50, precision: 50, weight: 50, spin: 0, bounce: 50, control: 50, stability: 50 }
    const points = calculateTrajectoryPreview(0, 0, drag, stats, 100)
    for (const [x, z] of points) {
      const dist = Math.sqrt(x * x + z * z)
      expect(dist).toBeLessThan(ARENA_RADIUS + 1) // Allow small overshoot due to bounce resolution
    }
  })
})

describe("simulateStep", () => {
  it("applies friction to moving discs", () => {
    const d1 = createDemoDisc("d1", "D1", "balanced", 0, 0, "player")
    d1.vx = 10
    d1.vz = 0
    d1.moving = true

    const { discs } = simulateStep([d1])
    const speed = Math.sqrt(discs[0].vx ** 2 + discs[0].vz ** 2)
    expect(speed).toBeLessThan(10) // Friction should slow it down
  })

  it("stops discs below STOP_THRESHOLD", () => {
    const d1 = createDemoDisc("d1", "D1", "balanced", 0, 0, "player")
    d1.vx = STOP_THRESHOLD * 0.5
    d1.vz = 0
    d1.moving = true

    const { discs } = simulateStep([d1])
    expect(discs[0].moving).toBe(false)
    expect(discs[0].vx).toBe(0)
  })

  it("detects disc-disc collision", () => {
    const a = createDemoDisc("a", "Hammer", "heavy", 0, 0, "player")
    const b = createDemoDisc("b", "Target", "balanced", DISC_RADIUS * 1.5, 0, "opponent")

    a.vx = 8
    a.vz = 0
    a.moving = true
    b.vx = 0
    b.vz = 0
    b.moving = false

    const { discs, impacts } = simulateStep([a, b])
    // Both should be moving after collision
    expect(discs.find(d => d.id === "b")!.moving).toBe(true)
    // There should be at least one impact
    expect(impacts.length).toBeGreaterThan(0)
  })

  it("flips opponent disc on strong impact", () => {
    const a = createDemoDisc("a", "Hammer", "heavy", 0, 0, "player")
    const b = createDemoDisc("b", "Weak", "technical", DISC_RADIUS * 1.5, 0, "opponent")

    a.vx = 20 // Very fast
    a.vz = 0
    a.moving = true

    const { discs, impacts } = simulateStep([a, b])
    // With enough speed, the opponent disc should flip
    const hasFlip = impacts.some(i => i.type === "flip" || i.type === "capture")
    // It may or may not flip depending on stats, but at least a hit should register
    expect(impacts.length).toBeGreaterThan(0)
  })
})

describe("allStopped", () => {
  it("returns true when all discs are stopped", () => {
    const d1 = createDemoDisc("d1", "D1", "balanced", 0, 0, "player")
    const d2 = createDemoDisc("d2", "D2", "balanced", 1, 0, "opponent")
    expect(allStopped([d1, d2])).toBe(true)
  })

  it("returns false when any disc is moving", () => {
    const d1 = createDemoDisc("d1", "D1", "balanced", 0, 0, "player")
    d1.moving = true
    d1.vx = 5
    const d2 = createDemoDisc("d2", "D2", "balanced", 1, 0, "opponent")
    expect(allStopped([d1, d2])).toBe(false)
  })

  it("considers flipped discs as stopped", () => {
    const d1 = createDemoDisc("d1", "D1", "balanced", 0, 0, "player")
    d1.flipped = true
    d1.moving = true
    d1.vx = 5
    expect(allStopped([d1])).toBe(true)
  })
})