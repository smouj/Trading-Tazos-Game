import type { Metadata } from "next"
export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Cookie Policy for Trading Tazos Game.",
}
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</> }
