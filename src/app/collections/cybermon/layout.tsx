import { pageMetadata } from "@/lib/metadata"

export const metadata = pageMetadata({
  title: "Cybermon Collection — 48 Tazos (TazoForge 2026)",
  description: "The Cybermon collection: 48 digital-creature tazos from the Neon Grid with evolution stages, transformation paths, and powerful abilities.",
  path: "/collections/cybermon",
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
