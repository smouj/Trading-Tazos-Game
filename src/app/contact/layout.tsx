import { pageMetadata } from "@/lib/metadata"

export const metadata = pageMetadata({
  title: "Contact — Support & Inquiries",
  description: "Get in touch with the Trading Tazos Game team. Support, bug reports, privacy inquiries, and content removal requests. We respond within 48 hours.",
  path: "/contact",
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
