import { pageMetadata } from "@/lib/metadata"

export const metadata = pageMetadata({
  title: "Disclaimer",
  description: "Disclaimer for Trading Tazos Game.",
  path: "/disclaimer",
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
