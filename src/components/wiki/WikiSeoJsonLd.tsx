import type { TTGWikiEntity } from "@/lib/wiki-types";

interface WikiSeoJsonLdProps {
  entity: TTGWikiEntity;
}

export default function WikiSeoJsonLd({ entity }: WikiSeoJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: entity.name,
    description: entity.description,
    identifier: entity.id,
    isPartOf: "Trading Tazos Game Wiki",
    genre: "Collectible digital game character",
    url: entity.seo.canonical,
    image: entity.image.src || undefined,
    creativeWorkStatus: entity.image.status === "created" ? "Published" : "Draft",
    about: {
      "@type": "Thing",
      name: entity.name,
      description: entity.inspirationBase || "",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
