import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/site-config";
import { getWikiEntitiesBySeries } from "@/lib/wiki-data";
import { WIKI_SERIES_CONFIG } from "@/lib/wiki-types";
import WikiLayout from "@/components/wiki/WikiLayout";
import WikiHero from "@/components/wiki/WikiHero";
import WikiCardGrid from "@/components/wiki/WikiCardGrid";

export const metadata: Metadata = {
  title: "Draco Bell Wiki — 72 Tazos de Artes Marciales y Aura | TTG Wiki",
  description:
    "Catálogo completo de los 72 tazos Draco Bell: personajes, villanos, transformaciones, técnicas, Campanas Draco y escenarios épicos.",
  alternates: { canonical: `${SITE_CONFIG.canonicalUrl}/wiki/draco-bell` },
  openGraph: {
    title: "Draco Bell Wiki — 72 Tazos de Combate | TTG Wiki",
    description:
      "Explora los 72 tazos Draco Bell de Trading Tazos Game. Artes marciales, aura, transformaciones y Campanas Draco.",
    url: `${SITE_CONFIG.canonicalUrl}/wiki/draco-bell`,
  },
};

export default function DracoBellWikiPage() {
  const entities = getWikiEntitiesBySeries("draco_bell");
  const cfg = WIKI_SERIES_CONFIG.draco_bell;

  return (
    <WikiLayout series="draco_bell">
      <WikiHero
        series="draco_bell"
        title="Draco Bell Wiki"
        subtitle={cfg.description}
        total={cfg.total}
      />

      <WikiCardGrid entities={entities} seriesLabel="Draco Bell" />
    </WikiLayout>
  );
}
