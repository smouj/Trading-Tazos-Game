import { pageMetadata } from "@/lib/metadata"

export const metadata = pageMetadata({
  title: "Minimon Collection — 50 Tazos (TazoForge 2026)",
  description: "The Minimon collection: 50 tazos from TazoForge Studios. Creature companions from Luminara with balanced combat stats.",
  path: "/collections/minimon",
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
