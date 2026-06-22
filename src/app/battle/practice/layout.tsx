// ============================================================
// Trading Tazos Game — Practice Arena Layout (SSR metadata)
// ============================================================
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Practice Arena — Train & Test Tazo Physics | Trading Tazos Game",
  description:
    "Jump into the free public practice arena. No account needed. Drag back to aim and release to launch tazos in a parabolic arc. Test jump physics, flip mechanics, and bounce arcs against AI. Draw 3 tazos, launch 1 per turn, draw from deck.",
  openGraph: {
    title: "Practice Arena — Free Tazo Battle Training | Trading Tazos Game",
    description:
      "Practice tazo jump launches — drag back, release, and watch the parabolic arc. Learn momentum-based flip physics and train against AI. No account needed — instant browser play.",
  },
  alternates: {
    canonical: "https://tradingtazosgame.com/battle/practice",
  },
}

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* SSR content — visible before JS loads */}
      <section
        className="sr-only"
        aria-label="Practice arena description"
      >
        <h1>Practice Arena — Free Tazo Battle Training</h1>
        <p>
          Jump into the free public practice arena. No account or login needed.
          Draw 3 tazos into your hand, drag back to aim, release to launch.
          Test jump physics, flip mechanics, and bounce arcs.
          Train against AI opponents. Field starts empty — one tazo enters per turn.
          Nothing is saved — pure practice.
        </p>
        <h2>How Battle Works</h2>
        <p>
          Each player draws 3 tazos into their hand. Select one, drag back from the arena edge,
          and release to launch it in a parabolic arc. Land on opponent discs to flip them —
          heavier discs hit harder and spin recovery varies by archetype.
          Master the 9 combat stats (Attack, Defense, Spin, Control, Bounce, Weight,
          Resistance, Stability, Precision) to dominate.
        </p>
        <h2>Controls</h2>
        <p>
          Aim with mouse or touch: drag back to set angle and power, then release to launch.
          The trajectory arc shows your aim in real time. Watch the physics unfold in real
          3D with parabolic arcs and momentum-based collisions.
        </p>
      </section>
      {children}
    </>
  )
}
