import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWikiEntityBySlug, getWikiEntitiesBySeries } from "@/lib/wiki-data";
import { WIKI_SERIES_CONFIG } from "@/lib/wiki-types";
import type { TTGWikiSeries } from "@/lib/wiki-types";
import WikiLayout from "@/components/wiki/WikiLayout";
import WikiDetailShell from "@/components/wiki/WikiDetailShell";

const SERIES_SLUG_TO_KEY: Record<string, TTGWikiSeries> = {
  minimon: "minimon",
  cybermon: "cybermon",
  "draco-bell": "draco_bell",
};

const VALID_SERIES_SLUGS = ["minimon", "cybermon", "draco-bell"] as const;
type ValidSeriesSlug = (typeof VALID_SERIES_SLUGS)[number];

interface PageProps {
  params: Promise<{ series: string; slug: string }>;
}

export async function generateStaticParams() {
  const params: { series: string; slug: string }[] = [];
  for (const slug of VALID_SERIES_SLUGS) {
    const seriesKey = SERIES_SLUG_TO_KEY[slug];
    const entities = getWikiEntitiesBySeries(seriesKey);
    for (const entity of entities) {
      params.push({ series: slug, slug: entity.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { series, slug } = await params;
  const seriesKey = SERIES_SLUG_TO_KEY[series];
  if (!seriesKey) {
    return { title: "Wiki Entry not found — TTG" };
  }

  const entity = getWikiEntityBySlug(seriesKey, slug);
  if (!entity) {
    return { title: "Wiki Entry not found — TTG" };
  }

  return {
    title: entity.seo.title,
    description: entity.seo.description,
    alternates: { canonical: entity.seo.canonical },
    openGraph: {
      title: entity.seo.title,
      description: entity.seo.description,
      url: entity.seo.canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: entity.seo.title,
      description: entity.seo.description,
    },
  };
}

export default async function WikiEntityPage({ params }: PageProps) {
  const { series, slug } = await params;
  const seriesKey = SERIES_SLUG_TO_KEY[series];
  if (!seriesKey) {
    return notFound();
  }

  const entity = getWikiEntityBySlug(seriesKey, slug);
  if (!entity) {
    return notFound();
  }

  const cfg = WIKI_SERIES_CONFIG[seriesKey];

  return (
    <WikiLayout series={seriesKey}>
      <WikiDetailShell entity={entity} />
    </WikiLayout>
  );
}
