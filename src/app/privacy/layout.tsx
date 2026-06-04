import { pageMetadata } from "@/lib/metadata"

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: "Privacy Policy for Trading Tazos Game.",
  path: "/privacy",
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
