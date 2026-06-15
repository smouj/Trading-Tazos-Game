// ============================================================
// ServerPageContent — Server-rendered unique HTML per SPA page
// Renders before LauncherView so crawlers get unique content.
// Hidden via CSS when JS hydrates (LauncherView takes over).
// ============================================================

import { SITE_CONFIG } from "@/lib/site-config"
import { FRANCHISES, FRANCHISE_BY_SLUG } from "@/lib/franchise-config"

interface Props {
  page: string
}

export default function ServerPageContent({ page }: Props) {
  if (page === "how-to-play") {
    return <ServerHowToPlay />
  }
  if (page === "collections") {
    return <ServerCollections />
  }
  if (page === "tazos") {
    return <ServerTazos />
  }
  if (page === "leaderboard") {
    return <ServerLeaderboard />
  }
  if (page === "download") {
    return <ServerDownload />
  }
  if (page === "faq") {
    return <ServerFAQ />
  }
  if (page === "shop") {
    return <ServerShop />
  }
  if (page === "contact") {
    return <ServerContact />
  }
  if (page === "privacy") {
    return <ServerPrivacy />
  }
  if (page === "terms") {
    return <ServerTerms />
  }
  if (page === "cookies") {
    return <ServerCookies />
  }
  return null
}

// ── How to Play ──
function ServerHowToPlay() {
  return (
    <section className="sr-only">
      <h1>How to Play Trading Tazos Game</h1>
      <h2>Game Overview</h2>
      <p>Trading Tazos Game is a skill-based digital tazo battle game. Collect 150 tazos, build decks of 5, and compete in a physics-driven 3D battle arena.</p>
      <h2>Game Rules</h2>
      <ol>
        <li>Build a battle deck with 5 tazos from your collection.</li>
        <li>Each battle starts with both players placing a bet tazo on the arena.</li>
        <li>The winner of the coin flip goes first.</li>
        <li>On your turn, select a tazo from your hand and launch it vertically from above.</li>
        <li>Use Aim controls to position your drop, then Charge to power up your slam.</li>
        <li>The tazo impacts the stack below — flipped tazos are captured by the attacker.</li>
        <li>Earn points for capturing opponent tazos. First to reach the score limit wins by TKO.</li>
        <li>If all opponent tazos are eliminated, win by elimination.</li>
      </ol>
      <h2>Stats That Matter</h2>
      <p>Each tazo has 9 combat stats: Attack (flip strength), Defense (flip resistance), Resistance (wear protection), Weight (impact force), Stability (knockback resistance), Spin (spin recovery), Control (aim precision), Bounce (bounce height), Precision (accuracy bonus).</p>
      <h2>Battle Modes</h2>
      <p>Practice: Train against AI with adjustable difficulty (Novice, Skilled, Master).</p>
      <p>Ranked PvP: Coming soon — competitive matchmaking with global leaderboard.</p>
      <p>Friend Battle: Coming soon — invite friends with room codes.</p>
    </section>
  )
}

// ── Collections ──
function ServerCollections() {
  return (
    <section className="sr-only">
      <h1>Collections — 150 Tazos Across 3 Series</h1>
      <p>Explore all 150 published tazos in Trading Tazos Game, distributed across three original series with 50 tazos each.</p>
      <h2>Minimon Series</h2>
      <p>50 natural creatures from Luminara. Elemental types, diverse biomes, and unique evolutions.</p>
      <h2>Dracobell Series</h2>
      <p>50 martial fighters from Bellora. Clans, auras, and Bell Shard transformations.</p>
      <h2>Cybermon Series</h2>
      <p>50 digital monsters from the Neon Grid. Code-based beings with patch upgrades and prime forms.</p>
    </section>
  )
}

// ── Tazos ──
function ServerTazos() {
  return (
    <section className="sr-only">
      <h1>Tazo Catalog — All 150 Published Tazos</h1>
      <p>Browse the complete catalog of 150 published tazos in Trading Tazos Game. Filter by series, rarity, combat type, and more. Each tazo features 9 combat stats, unique artwork, and finish variants.</p>
      <h2>Rarity Tiers</h2>
      <ul>
        <li>Common — Basic collection tazos</li>
        <li>Uncommon — Slightly rarer with better stats</li>
        <li>Rare — Distinctive finishes and higher stats</li>
        <li>Ultra Rare — Premium holographic and chrome finishes</li>
        <li>Legendary — The rarest tazos with exclusive shiny variants</li>
      </ul>
    </section>
  )
}

// ── Leaderboard ──
function ServerLeaderboard() {
  return (
    <section className="sr-only">
      <h1>Leaderboard — Top Players</h1>
      <p>See the top-ranked players in Trading Tazos Game. Rankings by battles won, tazos collected, and credits earned. Sign in to compete and climb the leaderboard.</p>
    </section>
  )
}

// ── Download ──
function ServerDownload() {
  return (
    <section className="sr-only">
      <h1>Download Trading Tazos Game</h1>
      <p>Play Trading Tazos Game instantly in your browser — no download or install needed. Desktop apps are available for Windows, macOS, and Linux for the best experience. Also available as a PWA for mobile.</p>
      <ul>
        <li>Windows — Download .exe installer</li>
        <li>macOS — Download .dmg</li>
        <li>Linux — Download .AppImage</li>
        <li>Web — Play instantly at tradingtazosgame.com</li>
        <li>PWA — Install from browser for offline play</li>
      </ul>
    </section>
  )
}

// ── FAQ ──
function ServerFAQ() {
  return (
    <section className="sr-only">
      <h1>Frequently Asked Questions</h1>
      <h2>Is Trading Tazos Game free?</h2>
      <p>Yes, completely free. You get 30 welcome bags and 100 credits when you create an account.</p>
      <h2>How many tazos are there?</h2>
      <p>150 tazos across 3 original series: Minimon (50), Dracobell (50), and Cybermon (50).</p>
      <h2>How do battles work?</h2>
      <p>Build a deck of 5, drop tazos from above into the arena, impact the stack, and flip opponent discs to capture them. It is a physics-based skill battle, not turn-based cards.</p>
      <h2>Can I play as a guest?</h2>
      <p>You can browse the site as a guest, but to open bags, battle, and collect tazos, you need to create a free account.</p>
      <h2>What are the tazo stats?</h2>
      <p>Each tazo has 9 stats: Attack, Defense, Resistance, Weight, Stability, Spin, Control, Bounce, and Precision.</p>
      <h2>What is a deck?</h2>
      <p>A battle deck consists of 5 tazos selected from your collection. You can build multiple decks with different strategies.</p>
      <h2>Are there microtransactions?</h2>
      <p>No. The game is supported by ads. Credits are earned through gameplay and daily rewards — they cannot be purchased.</p>
      <h2>Is this related to any real franchise?</h2>
      <p>No. All series, creatures, and lore are original fictional works created for Trading Tazos Game.</p>
    </section>
  )
}

// ── Shop ──
function ServerShop() {
  return (
    <section className="sr-only">
      <h1>Shop — Tazo Bags</h1>
      <p>Buy tazo bags to expand your collection. Each bag costs 100 credits and contains random tazos from one of three original series.</p>
      <h2>Bag Types</h2>
      <ul>
        <li>Classic Bag — Minimon tazos with balanced rarity. 48% Common, 30% Uncommon, 15% Rare, 5% Ultra Rare, 2% Legendary.</li>
        <li>Premium Bag — Cybermon digital tazos. Same rarity distribution.</li>
        <li>Mega Bag — Dracobell martial tazos. Same rarity distribution.</li>
      </ul>
      <h2>Getting Started</h2>
      <p>New players receive 30 welcome bags and 100 credits for free upon account creation. No purchase required.</p>
    </section>
  )
}

// ── Contact ──
function ServerContact() {
  return (
    <section className="sr-only">
      <h1>Contact Trading Tazos Game</h1>
      <p>Get in touch with the Trading Tazos Game team for bug reports, feature requests, partnership inquiries, or questions about the game. Email support@tradingtazosgame.com.</p>
    </section>
  )
}

// ── Privacy ──
function ServerPrivacy() {
  return (
    <section className="sr-only">
      <h1>Privacy Policy — Trading Tazos Game</h1>
      <p>We collect minimal data to provide the game experience. Your tazos, deck builds, and battle history are stored to serve your personal collection. We use cookies for authentication and Plausible for anonymous analytics. No personal data is sold. Email support@tradingtazosgame.com for privacy requests.</p>
    </section>
  )
}

// ── Terms ──
function ServerTerms() {
  return (
    <section className="sr-only">
      <h1>Terms of Service — Trading Tazos Game</h1>
      <p>Trading Tazos Game is a free-to-play browser game. By using the service, you agree to play fairly and not exploit bugs. All tazo designs, series lore, and game mechanics are original intellectual property. Accounts violating terms may be suspended. Contact support@tradingtazosgame.com for questions.</p>
    </section>
  )
}

// ── Cookies ──
function ServerCookies() {
  return (
    <section className="sr-only">
      <h1>Cookie Policy — Trading Tazos Game</h1>
      <p>We use essential cookies for authentication and session management. Anonymous analytics via Plausible. No third-party tracking cookies. You can disable cookies in your browser, but login functionality requires them.</p>
    </section>
  )
}

export { ServerPageContent }
