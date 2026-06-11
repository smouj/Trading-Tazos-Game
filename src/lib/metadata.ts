import type { Metadata } from "next"
import { SITE_CONFIG } from "@/lib/site-config"

/**
 * Build page metadata with proper canonical URL.
 * Usage in layout.tsx:
 *   export const metadata = pageMetadata({ title: "...", description: "...", path: "/download" })
 */
export function pageMetadata({
  title,
  description,
  path,
  ogImage,
  noIndex = false,
}: {
  title: string
  description: string
  path: string
  ogImage?: string
  noIndex?: boolean
}): Metadata {
  const url = path ? `${SITE_CONFIG.canonicalUrl}${path}` : SITE_CONFIG.canonicalUrl
  const defaultOgImage = `${SITE_CONFIG.canonicalUrl}/logo/social-preview.webp`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630 }]
        : [{ url: defaultOgImage, width: 1200, height: 630 }],
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  }
}
