import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import os from "os";
import { getAuthUser } from "@/lib/auth";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "dev@tradingtazosgame.com";
const execAsync = promisify(exec);

const CREATURES_DIR = path.join(process.cwd(), "scripts", "tazo-creatures");
const PUBLIC_CREATURES_DIR = path.join(process.cwd(), "public", "tazo-creatures");

/** Slug pattern: alphanumeric + hyphens, 1-32 chars */
const SAFE_SLUG_RE = /^[a-z][a-z0-9-]{0,31}$/;
/** Allowed franchises */
const ALLOWED_FRANCHISES = new Set(["minimon", "cybermon", "dracobell"]);

/** Sanitize log output — strip non-printable chars, limit length */
function sanitizeLog(msg: unknown): string {
  const s = String(msg).replace(/[\x00-\x1f\x7f-\x9f]/g, "").slice(0, 500);
  return s || "(empty)";
}

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

async function downloadImage(url: string): Promise<Buffer> {
  // Only allow same-origin and safe relative paths
  if (url.startsWith("/")) {
    const safePart = url.replace(/\.\./g, "").replace(/\/+/g, "/").slice(0, 200);
    const pubPath = path.join(process.cwd(), "public", safePart.replace(/^\//, ""));
    if (fs.existsSync(pubPath)) return fs.readFileSync(pubPath);
    const genPath = path.join(process.cwd(), "public", "tazos-generated", path.basename(safePart));
    if (fs.existsSync(genPath)) return fs.readFileSync(genPath);
    throw new Error("Local file not found");
  }
  // Only allow same-host URLs
  const parsed = new URL(url);
  const allowedHosts = ["tradingtazosgame.com", "localhost"];
  if (!allowedHosts.includes(parsed.hostname)) {
    throw new Error("External URLs not allowed");
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch image");
  return Buffer.from(await res.arrayBuffer());
}

async function removeBackground(inputBuffer: Buffer): Promise<Buffer> {
  const tmpDir = os.tmpdir();
  const rand = crypto.randomUUID().replace(/-/g, "");
  const inputPath = path.join(tmpDir, `rembg-in-${rand}.png`);
  const outputPath = path.join(tmpDir, `rembg-out-${rand}.png`);
  const scriptPath = path.join(tmpDir, `rembg-run-${rand}.py`);

  try {
    fs.writeFileSync(inputPath, inputBuffer);

    // Sanitize paths for Python script (no user input in template)
    const script = [
      "import sys",
      "from rembg import remove, new_session",
      "from PIL import Image",
      "",
      `img = Image.open(${JSON.stringify(inputPath)})`,
      "session = new_session('u2net')",
      "output = remove(img, session=session)",
      `output.save(${JSON.stringify(outputPath)}, 'PNG')`,
      "print('OK')",
    ].join("\n");

    fs.writeFileSync(scriptPath, script);

    const { stdout, stderr } = await execAsync(
      `python3 "${scriptPath}"`,
      { timeout: 30000 }
    );

    if (stderr && !stderr.includes("WARNING")) {
      console.warn("rembg stderr (sanitized):", sanitizeLog(stderr));
    }

    if (!stdout.includes("OK")) {
      throw new Error("rembg did not complete successfully");
    }

    const result = fs.readFileSync(outputPath);
    return result;
  } finally {
    // Cleanup temp files (best effort)
    [inputPath, outputPath, scriptPath].forEach((p) => {
      try { fs.unlinkSync(p); } catch {}
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (user?.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { imageUrl, franchise, slug } = await req.json();

    // Validate inputs
    if (!imageUrl || !franchise || !slug) {
      return NextResponse.json(
        { error: "imageUrl, franchise, and slug are required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_FRANCHISES.has(franchise)) {
      return NextResponse.json(
        { error: `Invalid franchise: ${sanitizeLog(franchise)}` },
        { status: 400 }
      );
    }

    const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 32);
    if (!safeSlug || safeSlug.length < 1) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }
    // Extra guard: match against safe pattern
    if (!SAFE_SLUG_RE.test(safeSlug)) {
      // Try to sanitize further
      const sanitized = safeSlug.replace(/^[^a-z]+/, "").replace(/[^a-z0-9-]/g, "-");
      if (!SAFE_SLUG_RE.test(sanitized)) {
        return NextResponse.json({ error: "Slug must match [a-z][a-z0-9-]{0,31}" }, { status: 400 });
      }
    }

    const safeFranchise = franchise; // already validated against Set
    const validSlug = safeSlug;

    // Download the image
    const imageBuffer = await downloadImage(imageUrl);

    // Remove background
    const processedBuffer = await removeBackground(imageBuffer);

    // Save to scripts/tazo-creatures/{franchise}/{slug}.png
    const creatureDir = path.join(CREATURES_DIR, safeFranchise);
    ensureDir(creatureDir);
    const creaturePath = path.join(creatureDir, `${validSlug}.png`);
    fs.writeFileSync(creaturePath, processedBuffer);

    // Also save to public/tazo-creatures/{franchise}/{slug}.png for web serving
    const publicDir = path.join(PUBLIC_CREATURES_DIR, safeFranchise);
    ensureDir(publicDir);
    const publicPath = path.join(publicDir, `${validSlug}.png`);
    fs.writeFileSync(publicPath, processedBuffer);

    const resultUrl = `/tazo-creatures/${safeFranchise}/${validSlug}.png`;

    return NextResponse.json({
      success: true,
      resultUrl,
      sizeBytes: processedBuffer.length,
    });
  } catch (error: unknown) {
    console.error("remove-bg error:", sanitizeLog(error instanceof Error ? error.message : "Unknown"));
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
