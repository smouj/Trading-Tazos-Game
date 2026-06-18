import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getAuthUser } from "@/lib/auth";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "dev@tradingtazosgame.com";

const LAYOUTS_FILE = path.join(process.cwd(), "prisma", "tazo-layouts.json");

/** Allowed franchise values — blocks prototype pollution via user input */
const ALLOWED_FRANCHISES = new Set(["minimon", "cybermon", "dracobell"]);
/** Slug pattern: alphanumeric + hyphens/underscores, 2-64 chars */
const SLUG_RE = /^[a-zA-Z0-9][a-zA-Z0-9_-]{1,63}$/;
/** Safe key names for object property access — prevents proto/c'tor injection */
const SAFE_PROP_KEYS = new Set([
  "defaults", "overrides", "backDefaults", "backOverrides", "lastModified",
  ...ALLOWED_FRANCHISES,
]);

interface LayoutElement {
  x: number;
  y: number;
  scale: number;
  visible?: boolean;
  opacity?: number;
  rotation?: number;
  color?: string;
  customText?: string;
}

interface LayoutConfig {
  collection: LayoutElement;
  badge: LayoutElement;
  number: LayoutElement;
  name: LayoutElement;
  rarity: LayoutElement;
  creature: LayoutElement;
}

interface BackLayoutConfig {
  centerIcon: LayoutElement;
  topLabel: LayoutElement;
  bottomLabel: LayoutElement;
  cornerBadge: LayoutElement;
  numberBadge: LayoutElement;
}

interface LayoutStore {
  defaults: Record<string, LayoutConfig>;
  overrides: Record<string, LayoutConfig>;
  backDefaults: Record<string, BackLayoutConfig>;
  backOverrides: Record<string, BackLayoutConfig>;
  lastModified: number;
}

function readStore(): LayoutStore {
  try {
    if (fs.existsSync(LAYOUTS_FILE)) {
      const raw = JSON.parse(fs.readFileSync(LAYOUTS_FILE, "utf-8"));
      // Sanitize: only copy whitelisted top-level keys
      const safe: LayoutStore = { defaults: {}, overrides: {}, backDefaults: {}, backOverrides: {}, lastModified: 0 };
      for (const key of Object.keys(raw)) {
        if (SAFE_PROP_KEYS.has(key)) {
          (safe as any)[key] = raw[key];
        }
      }
      return safe;
    }
  } catch {}
  return { defaults: {}, overrides: {}, backDefaults: {}, backOverrides: {}, lastModified: 0 };
}

function writeStore(store: LayoutStore) {
  fs.mkdirSync(path.dirname(LAYOUTS_FILE), { recursive: true });
  fs.writeFileSync(LAYOUTS_FILE, JSON.stringify(store, null, 2));
}

function requireAdmin(req: NextRequest) {
  return getAuthUser(req).then((user) => {
    if (user?.email !== ADMIN_EMAIL) {
      throw new Error("Forbidden");
    }
    return user;
  });
}

function validateFranchise(franchise: string | null): string | null {
  if (!franchise) return null;
  if (!ALLOWED_FRANCHISES.has(franchise)) {
    throw new Error(`Invalid franchise: ${franchise}`);
  }
  return franchise;
}

function validateSlug(slug: string | null): string | null {
  if (!slug) return null;
  if (!SLUG_RE.test(slug)) {
    throw new Error(`Invalid slug format: ${slug}`);
  }
  return slug;
}

// GET /api/admin/tazo-layouts?franchise=minimon&slug=boltling&type=back
export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const franchise = validateFranchise(req.nextUrl.searchParams.get("franchise"));
  const slug = validateSlug(req.nextUrl.searchParams.get("slug"));
  const side = req.nextUrl.searchParams.get("side") === "back" ? "back" : "front";
  const store = readStore();

  if (side === "back") {
    const backDefaults: BackLayoutConfig = {
      centerIcon: { x: 0, y: 0, scale: 1.0 },
      topLabel: { x: 0, y: -320, scale: 1.0 },
      bottomLabel: { x: 0, y: 320, scale: 1.0 },
      cornerBadge: { x: 280, y: -280, scale: 1.0 },
      numberBadge: { x: -280, y: 280, scale: 1.0 },
    };
    if (slug && store.backOverrides[slug]) {
      return NextResponse.json({ layout: store.backOverrides[slug], source: "override", side: "back" });
    }
    if (franchise && store.backDefaults[franchise]) {
      return NextResponse.json({ layout: store.backDefaults[franchise], source: "default", side: "back" });
    }
    return NextResponse.json({ layout: backDefaults, source: "hardcoded", side: "back" });
  }

  // Front layouts
  if (slug && store.overrides[slug]) {
    return NextResponse.json({ layout: store.overrides[slug], source: "override", side: "front" });
  }
  if (franchise && store.defaults[franchise]) {
    return NextResponse.json({ layout: store.defaults[franchise], source: "default", side: "front" });
  }

  const defaults: LayoutConfig = {
    collection: { x: 0, y: -300, scale: 1.0 },
    badge: { x: 290, y: 0, scale: 1.0 },
    number: { x: -290, y: 0, scale: 1.0 },
    name: { x: 0, y: 300, scale: 1.0 },
    rarity: { x: 0, y: -250, scale: 1.0 },
    creature: { x: 0, y: 0, scale: 1.0 },
  };
  return NextResponse.json({ layout: defaults, source: "hardcoded", side: "front" });
}

// POST /api/admin/tazo-layouts
export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { layout, side = "front" } = body;
  const franchise = validateFranchise(body.franchise);
  const slug = validateSlug(body.slug);

  if (!layout) {
    return NextResponse.json({ error: "layout required" }, { status: 400 });
  }

  const store = readStore();

  if (side === "back") {
    if (slug) {
      store.backOverrides[slug] = layout;
    } else if (franchise) {
      store.backDefaults[franchise] = layout;
    } else {
      return NextResponse.json({ error: "franchise or slug required" }, { status: 400 });
    }
  } else {
    if (slug) {
      store.overrides[slug] = layout;
    } else if (franchise) {
      store.defaults[franchise] = layout;
    } else {
      return NextResponse.json({ error: "franchise or slug required" }, { status: 400 });
    }
  }

  store.lastModified = Date.now();
  writeStore(store);
  return NextResponse.json({ success: true, source: slug ? "override" : "default", side });
}
