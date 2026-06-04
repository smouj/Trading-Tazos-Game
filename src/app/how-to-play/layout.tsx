import { pageMetadata } from "@/lib/metadata"

export const metadata = pageMetadata({
  title: "How to Play — Complete Beginner's Guide",
  description: "Learn how to play Trading Tazos Game. Master aiming, throwing, physics, captures, deck building, and battle strategy. Complete guide for beginners.",
  path: "/how-to-play",
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
