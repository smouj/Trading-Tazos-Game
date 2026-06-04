import { pageMetadata } from "@/lib/metadata"

export const metadata = pageMetadata({
  title: "FAQ — Frequently Asked Questions",
  description: "Answers to common questions about Trading Tazos Game. Account, collections, battles, shop, quests, and technical support.",
  path: "/faq",
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
