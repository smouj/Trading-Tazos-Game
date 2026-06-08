import Link from "next/link"

const SOCIAL_LINKS = [
  {
    label: "X / Twitter",
    href: "https://x.com/tazosgame",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Reddit",
    href: "https://www.reddit.com/r/tradingtazosgame/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.6 12.6c0 .663-.537 1.2-1.2 1.2-.315 0-.603-.12-.816-.318A5.952 5.952 0 0 1 12 15.6a5.952 5.952 0 0 1-4.584-2.118A1.19 1.19 0 0 1 6.6 13.8c-.663 0-1.2-.537-1.2-1.2s.537-1.2 1.2-1.2c.315 0 .603.12.816.318a5.956 5.956 0 0 1 3.384-1.788l.72-3.384 2.94.624c.039-.327.312-.582.648-.582.363 0 .66.297.66.66s-.297.66-.66.66c-.234 0-.438-.123-.552-.306l-2.496-.528-.576 2.706a5.96 5.96 0 0 1 3.492 1.794c.213-.198.501-.318.816-.318.663 0 1.2.537 1.2 1.2zM9.6 13.2c-.48 0-.84.36-.84.84 0 .48.36.84.84.84s.84-.36.84-.84c0-.48-.36-.84-.84-.84zm4.8 0c-.48 0-.84.36-.84.84 0 .48.36.84.84.84s.84-.36.84-.84c0-.48-.36-.84-.84-.84zm-2.88 3.54c.48 0 .96.12 1.44.36.48-.24.96-.36 1.44-.36.18 0 .36-.18.36-.36s-.18-.36-.36-.36c-.66 0-1.26.18-1.74.48-.3-.18-.66-.3-1.14-.3s-.84.12-1.14.3c-.48-.3-1.08-.48-1.74-.48-.18 0-.36.18-.36.36s.18.36.36.36z" />
      </svg>
    ),
  },
  {
    label: "Telegram",
    href: "https://t.me/tradingtazosgame",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.96 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.696.064-1.225-.46-1.9-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.24-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.1-.002.321.023.465.14.121.099.155.233.171.328.016.095.036.31.02.482z" />
      </svg>
    ),
  },
]

const columns = [
  {
    title: "Game",
    links: [
      ["How to Play", "/how-to-play"],
      ["Battle System", "/battle-system"],
      ["Collections", "/collections"],
      ["Tazos", "/tazos"],
      ["Leaderboard", "/leaderboard"],
    ],
  },
  {
    title: "Player",
    links: [
      ["Sign In", "/login"],
      ["Create Account", "/register"],
      ["Shop", "/app/shop"],
      ["Quests", "/app/quests"],
      ["Download", "/download"],
    ],
  },
  {
    title: "Support",
    links: [
      ["FAQ", "/faq"],
      ["Contact", "/contact"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Terms", "/terms"],
      ["Privacy", "/privacy"],
      ["Cookies", "/cookies"],
      ["Disclaimer", "/disclaimer"],
    ],
  },
]

export default function PublicFooter() {
  return (
    <footer className="bg-[#1a1a1a] text-white border-t-4 border-[#FFCC00]">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#FFCC00] mb-3">{column.title}</h2>
              <ul className="space-y-2">
                {column.links.map(([label, href]) => (
                  <li key={`${label}-${href}`}>
                    <Link href={href} className="text-sm font-bold text-zinc-300 hover:text-white hover:underline underline-offset-4">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {/* Social Media */}
        <div className="mt-8 flex items-center justify-center gap-4">
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-white/20 text-zinc-400 hover:text-[#FFCC00] hover:border-[#FFCC00]/50 hover:bg-white/5 transition-all"
            >
              {social.icon}
            </a>
          ))}
        </div>
        <div className="mt-6 pt-5 border-t border-white/15 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <p className="text-xs font-bold text-zinc-400">
            Copyright {new Date().getFullYear()} Trading Tazos Game. Version 0.3.1.
          </p>
          <p className="text-xs font-bold text-zinc-500">
            Fan-made collector experience. Minimon, Dracobell, and Cybermon are fictional IPs.
          </p>
        </div>
      </div>
    </footer>
  )
}
