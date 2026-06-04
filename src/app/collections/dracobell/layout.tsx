import { pageMetadata } from "@/lib/metadata"

export const metadata = pageMetadata({
  title: "Dracobell Collection — 118 Tazos (Matutano 1995)",
  description: "The massive Dracobell collection: 118 tazos across 7 categories including Tazos, Megatazos, Supertazos, Mastertazos, and Holo 3D variants.",
  path: "/collections/dracobell",
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
