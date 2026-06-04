import { pageMetadata } from "@/lib/metadata"

export const metadata = pageMetadata({
  title: "Collections — 319 Tazos from Minimon, Dracobell & Cybermon",
  description: "Browse the three legendary tazo collections: 51 Minimon, 118 Dracobell, and 150 Cybermon. Complete guide to all verified Spanish tazos.",
  path: "/collections",
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
