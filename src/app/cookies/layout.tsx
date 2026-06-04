import { pageMetadata } from "@/lib/metadata"

export const metadata = pageMetadata({
  title: "Cookie Policy",
  description: "Cookie Policy for Trading Tazos Game.",
  path: "/cookies",
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
