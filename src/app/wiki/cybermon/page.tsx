import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/site-config";
import { getWikiEntitiesBySeries } from "@/lib/wiki-data";
import { WIKI_SERIES_CONFIG } from "@/lib/wiki-types";
import WikiLayout from "@/components/wiki/WikiLayout";
import WikiHero from "@/components/wiki/WikiHero";
import WikiCardGrid from "@/components/wiki/WikiCardGrid";

export const metadata: Metadata = {
  title: "Cybermon Wiki — 128 Tazos Digitales | TTG Wiki",
  description:
    "Catálogo completo de los 128 Cybermon: Niños Vinculados, Cybermons compañeros, villanos digitales y aliados del ciberespacio.",
  alternates: { canonical: `${SITE_CONFIG.canonicalUrl}/wiki/cybermon` },
  openGraph: {
    title: "Cybermon Wiki — 128 Tazos Digitales | TTG Wiki",
    description:
      "Explora los 128 Cybermon de Trading Tazos Game. Aventura digital, Niños Vinculados y Cybermons compañeros.",
    url: `${SITE_CONFIG.canonicalUrl}/wiki/cybermon`,
  },
};

export default function CybermonWikiPage() {
  const entities = getWikiEntitiesBySeries("cybermon");
  const cfg = WIKI_SERIES_CONFIG.cybermon;

  return (
    <WikiLayout>
      <WikiHero
        series="cybermon"
        title="Cybermon Wiki"
        subtitle={cfg.description}
        total={cfg.total}
      />

      <WikiCardGrid entities={entities} seriesLabel="Cybermon" />
    </WikiLayout>
  );
}
