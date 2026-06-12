import { pageMetadata } from "@/lib/metadata"

export const metadata = pageMetadata({
  title: "Refund Policy",
  description: "Refund Policy for Trading Tazos Game — terms for virtual currency purchases, refunds, and cancellations.",
  path: "/refund-policy",
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
