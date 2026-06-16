// ============================================================
// TTG Wiki — Shared TypeScript types
// ============================================================

export type TTGWikiSeries = "minimon" | "cybermon" | "draco_bell";

export type TTGWikiEntityType =
  | "creature"
  | "character"
  | "villain"
  | "ally"
  | "object"
  | "scenario"
  | "technique"
  | "form"
  | "special"
  | "legendary"
  | "mythic";

export interface TTGWikiEntity {
  id: string;
  slug: string;
  name: string;
  series: TTGWikiSeries;
  entityType: TTGWikiEntityType;

  types: string[];
  rarity?: string;
  stage?: string | null;
  familyId?: string | null;
  evolution?: string | null;
  owner?: string | null;
  faction?: string | null;
  category?: string;

  description: string;
  inspirationBase?: string;
  visualStyle: string;

  relationships: string[];

  image: {
    src?: string;
    alt: string;
    status: "created" | "pending" | "unconfirmed";
  };

  seo: {
    title: string;
    description: string;
    canonical: string;
  };
}

// ── Series display config ──

export const WIKI_SERIES_CONFIG: Record<TTGWikiSeries, {
  label: string;
  slug: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  total: number;
}> = {
  minimon: {
    label: "Minimon",
    slug: "minimon",
    color: "#2E7D32",
    bgColor: "#E8F5E9",
    borderColor: "#2E7D32",
    description:
      "151 criaturas naturales de Luminara. Criaturas, animales, plantas, elementos y fantasía biológica.",
    total: 151,
  },
  cybermon: {
    label: "Cybermon",
    slug: "cybermon",
    color: "#1565C0",
    bgColor: "#E3F2FD",
    borderColor: "#1565C0",
    description:
      "128 tazos de aventura digital con Niños Vinculados y Cybermons compañeros.",
    total: 128,
  },
  draco_bell: {
    label: "Draco Bell",
    slug: "draco-bell",
    color: "#E65100",
    bgColor: "#FFF3E0",
    borderColor: "#E65100",
    description:
      "72 tazos de artes marciales, aura, transformaciones y Campanas Draco.",
    total: 72,
  },
};

// ── Entity type display labels (Spanish) ──

export const ENTITY_TYPE_LABELS: Record<TTGWikiEntityType, string> = {
  creature: "Criatura",
  character: "Personaje",
  villain: "Villano",
  ally: "Aliado",
  object: "Objeto",
  scenario: "Escenario",
  technique: "Técnica",
  form: "Transformación",
  special: "Especial",
  legendary: "Legendario",
  mythic: "Mítico",
};
