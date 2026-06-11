import type { Metadata } from "next"
import { pageMetadata } from "@/lib/metadata"
import { PAGE_META } from "@/lib/site-config"

const meta = PAGE_META["register"]

export const metadata: Metadata = {
  ...pageMetadata({
    title: meta.title,
    description: meta.description,
    path: meta.canonicalPath || "/register",
  }),
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
