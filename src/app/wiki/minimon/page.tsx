import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/site-config";
import { getWikiEntitiesBySeries } from "@/lib/wiki-data";
import { WIKI_SERIES_CONFIG } from "@/lib/wiki-types";
import WikiLayout from "@/components/wiki/WikiLayout";
import WikiHero from "@/components/wiki/WikiHero";
import WikiCardGrid from "@/components/wiki/WikiCardGrid";

export const metadata: Metadata = {
  title: "Minimon Wiki — 151 Criaturas de Luminara | TTG Wiki",
  description:
    "Catálogo completo de los 151 Minimon: criaturas naturales de Luminara. Tipos, evoluciones, rarezas, inspiración y estado de arte de cada tazo.",
  alternates: { canonical: `${SITE_CONFIG.canonicalUrl}/wiki/minimon` },
  openGraph: {
    title: "Minimon Wiki — 151 Criaturas | TTG Wiki",
    description:
      "Explora los 151 Minimon de Trading Tazos Game. Criaturas, animales, plantas, elementos y fantasía biológica.",
    url: `${SITE_CONFIG.canonicalUrl}/wiki/minimon`,
  },
};

export default function MinimonWikiPage() {
  const entities = getWikiEntitiesBySeries("minimon");
  const cfg = WIKI_SERIES_CONFIG.minimon;

  return (
    <WikiLayout series="minimon">
      <WikiHero
        series="minimon"
        title="Minimon Wiki"
        subtitle={cfg.description}
        total={cfg.total}
      />

      <WikiCardGrid entities={entities} seriesLabel="Minimon" />
    </WikiLayout>
  );
}
