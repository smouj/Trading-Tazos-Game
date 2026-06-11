import type { Metadata } from "next"
import { pageMetadata } from "@/lib/metadata"
import { PAGE_META } from "@/lib/site-config"

const meta = PAGE_META["login"]

export const metadata: Metadata = {
  ...pageMetadata({
    title: meta.title,
    description: meta.description,
    path: meta.canonicalPath || "/login",
  }),
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
