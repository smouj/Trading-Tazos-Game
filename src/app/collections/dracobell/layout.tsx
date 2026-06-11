import { pageMetadata } from "@/lib/metadata"

export const metadata = pageMetadata({
  title: "Dracobell Collection — 50 Tazos (TazoForge 2026)",
  description: "The Dracobell collection: 50 tazos across 6 categories including Tazos, Megatazos, Supertazos, Mastertazos, and Holo 3D variants.",
  path: "/collections/dracobell",
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
