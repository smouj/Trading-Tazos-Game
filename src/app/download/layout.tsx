import { pageMetadata } from "@/lib/metadata"

export const metadata = pageMetadata({
  title: "Download Trading Tazos Game — Windows, macOS & Linux",
  description: "Download Trading Tazos Game v0.3.1 for Windows, macOS, and Linux. Desktop app with all 319 tazos, 3D battle arena, and offline play.",
  path: "/download",
    ogImage: "https://medaclawarena.com/logo/social-installer.png",
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
