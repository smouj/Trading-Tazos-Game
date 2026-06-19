// ============================================================
// Trading Tazos Game — Practice Arena Layout (SSR metadata)
// ============================================================
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Practice Arena — Train & Test Tazo Physics | Trading Tazos Game",
  description:
    "Jump into the free public practice arena. No account needed. Test tazo physics — angle, power, spin, bounce, and flip mechanics against AI. Build a 20-tazo deck, draw 5 for your starting hand, draw 1 each turn.",
  openGraph: {
    title: "Practice Arena — Free Tazo Battle Training | Trading Tazos Game",
    description:
      "Practice tazo slams, learn physics (angle, power, spin, bounce, flip), and train against AI. No account needed — instant browser play.",
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
          Test tazo physics including angle, power, spin, bounce, and flip mechanics.
          Build a 20-tazo deck, draw 5 tazos for your starting hand, and draw 1 tazo each turn.
          Train against AI opponents with adjustable difficulty. Nothing is saved — pure practice.
        </p>
        <h2>How Battle Works</h2>
        <p>
          Each player starts with a 20-tazo deck. Draw 5 tazos into your hand at the start.
          In each turn draw 1 additional tazo. Drop tazos from above into the 3D arena — impact the
          stack, flip opponent discs, and control the arena. Master the 9 combat stats (Attack,
          Defense, Spin, Control, Bounce, Weight, Resistance, Stability, Precision) to dominate.
        </p>
        <h2>Controls</h2>
        <p>
          Aim with mouse or touch, adjust power and spin, then release to launch your tazo.
          Use the angle selector to choose your drop trajectory. Watch the physics unfold in real
          3D with realistic bouncing, spinning, and flipping.
        </p>
      </section>
      {children}
    </>
  )
}
