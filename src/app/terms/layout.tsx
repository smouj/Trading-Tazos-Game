import { pageMetadata } from "@/lib/metadata"

export const metadata = pageMetadata({
  title: "Terms of Service",
  description: "Terms of Service for Trading Tazos Game.",
  path: "/terms",
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
