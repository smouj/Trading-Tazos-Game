// ============================================================
// Trading Tazos Game — Admin Site Config API
// Read/write site configuration key-value pairs
// Protected: admin-only (dev email check)
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Built-in config keys with defaults
const CONFIG_DEFAULTS: Record<string, any> = {
  maintenance_mode: false,
  welcome_credits: 100,
  daily_quest_reward: 50,
  pvp_enabled: true,
  max_tazos_per_collection: 50,
  shop_enabled: true,
  trading_enabled: true,
  registrations_open: true,
};

/** Type validators for known config keys — prevents bad values from crashing consumers */
const CONFIG_VALIDATORS: Record<string, (v: unknown) => string | null> = {
  maintenance_mode:       (v) => typeof v === "boolean" ? null : "must be boolean",
  welcome_credits:        (v) => typeof v === "number" && Number.isSafeInteger(v) && v >= 0 ? null : "must be a non-negative integer",
  daily_quest_reward:     (v) => typeof v === "number" && Number.isSafeInteger(v) && v >= 0 ? null : "must be a non-negative integer",
  pvp_enabled:            (v) => typeof v === "boolean" ? null : "must be boolean",
  max_tazos_per_collection: (v) => typeof v === "number" && Number.isSafeInteger(v) && v > 0 ? null : "must be a positive integer",
  shop_enabled:           (v) => typeof v === "boolean" ? null : "must be boolean",
  trading_enabled:        (v) => typeof v === "boolean" ? null : "must be boolean",
  registrations_open:     (v) => typeof v === "boolean" ? null : "must be boolean",
};

/** Safe JSON parse — returns null on corruption instead of throwing */
function safeJsonParse(raw: string): any {
  try { return JSON.parse(raw) } catch { return null }
}

// GET — fetch all config or a single key
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (user?.email !== "dev@tradingtazosgame.com") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (key) {
      const config = await prisma.siteConfig.findUnique({ where: { key } });
      const defaultValue = CONFIG_DEFAULTS[key as keyof typeof CONFIG_DEFAULTS];
      return NextResponse.json({
        key,
        value: config ? safeJsonParse(config.value) : (defaultValue !== undefined ? defaultValue : null),
        updatedAt: config?.updatedAt || null,
        updatedBy: config?.updatedBy || null,
      });
    }

    // Return all config keys with defaults merged
    const dbConfigs = await prisma.siteConfig.findMany();
    const configMap: Record<string, any> = {};
    
    // Start with defaults
    for (const [k, v] of Object.entries(CONFIG_DEFAULTS)) {
      configMap[k] = { key: k, value: v, isDefault: true };
    }
    
    // Override with DB values
    for (const cfg of dbConfigs) {
      configMap[cfg.key] = {
        key: cfg.key,
        value: safeJsonParse(cfg.value),
        updatedAt: cfg.updatedAt,
        updatedBy: cfg.updatedBy,
        isDefault: false,
      };
    }

    return NextResponse.json({ configs: Object.values(configMap) });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to fetch" }, { status: 500 });
  }
}

// POST — save a config key
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (user?.email !== "dev@tradingtazosgame.com") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    // Validate type for known config keys
    const validator = CONFIG_VALIDATORS[key];
    if (validator) {
      const error = validator(value);
      if (error) {
        return NextResponse.json({ error: `Invalid value for "${key}": ${error}` }, { status: 400 });
      }
    } else {
      // Log unknown keys for audit but allow them (for future/flexible config)
      console.warn(`[site-config] Saving unrecognized config key: "${key}"`);
    }

    const config = await prisma.siteConfig.upsert({
      where: { key },
      update: {
        value: JSON.stringify(value),
        updatedBy: user.email,
      },
      create: {
        key,
        value: JSON.stringify(value),
        updatedBy: user.email,
      },
    });

    return NextResponse.json({ success: true, key: config.key, value: safeJsonParse(config.value) });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Save failed" }, { status: 500 });
  }
}
