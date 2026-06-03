import type { Metadata } from "next"
export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Disclaimer for Trading Tazos Game.",
}
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</> }
