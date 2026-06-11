#!/usr/bin/env python3
"""Composite TTG Season 1 transparent character art onto official tazo fronts."""

from __future__ import annotations

import argparse
import json
import math
import random
import re
import sqlite3
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


PROJECT = Path(__file__).resolve().parents[2]
DATA_PATH = PROJECT / "scripts" / "season1" / "season1-tazos.json"
PROMPTS_PATH = PROJECT / "artgen" / "creatures.season1.json"
NOBG_DIR = PROJECT / "artgen" / "nobg"
CREATURE_DIR = PROJECT / "scripts" / "tazo-creatures"
BG_DIR = PROJECT / "artgen" / "tazo-bg" / "frontal"
BACK_DIR = PROJECT / "artgen" / "tazo-bg" / "back"
DEST_DIR = PROJECT / "public" / "tazos-generated"
DB_PATH = PROJECT / "prisma" / "dev.db"

CANVAS = 1254
CHARACTER_SIZE = math.floor(CANVAS * 0.65)
CENTER = CANVAS // 2

FRONTAL_BG_FILES = {
    "minimon": ["minimon-01.png", "minimon-02.png", "minimon-03.png", "minimon-04.png", "minimon-05.png", "minimon-06.png"],
    "cybermon": ["cybermon-01.png", "cybermon-02.png", "cybermon-03.png"],
    "dracobell": ["dracobell-01.png", "dracobell-02.png", "dracobell-03.png", "dracobell-04.png"],
}

BACK_BG_FILES = {
    "minimon": "back-minimon.png",
    "cybermon": "back-cybermon.png",
    "dracobell": "back-dracobell.png",
}

RARITY_STARS = {
    "common": 1,
    "uncommon": 2,
    "rare": 3,
    "ultra": 5,
    "legendary": 5,
}

RARITY_COLORS = {
    "common": (156, 163, 175),
    "uncommon": (34, 197, 94),
    "rare": (59, 130, 246),
    "ultra": (255, 107, 0),
    "legendary": (251, 191, 36),
}

FRANCHISE_COLORS = {
    "minimon": (255, 203, 5),
    "cybermon": (0, 161, 233),
    "dracobell": (255, 107, 0),
}


def safe_dirname(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def load_creature_index() -> dict[str, dict]:
    if not PROMPTS_PATH.exists():
        return {}
    data = json.loads(PROMPTS_PATH.read_text(encoding="utf-8"))
    return {c["slug"]: c for c in data.get("creatures", [])}


def find_creature_art(tazo: dict, creature_index: dict[str, dict]) -> Path | None:
    franchise = tazo["franchise"]
    slug = tazo["slug"]
    direct = CREATURE_DIR / franchise / f"{slug}.png"
    if direct.exists():
        return direct

    creature = creature_index.get(slug, {})
    cid = creature.get("id") or tazo["number"]
    name = creature.get("name") or tazo["name"]
    expected = NOBG_DIR / franchise / f"{cid}-{safe_dirname(name)}" / f"{cid}-v02.png"
    if expected.exists():
        return expected

    for png in NOBG_DIR.glob(f"**/{cid}-*.png"):
        return png
    return None


def pick_background(tazo: dict) -> Path:
    franchise = tazo["franchise"]
    files = FRONTAL_BG_FILES[franchise]
    idx = int(tazo["number"].split("-")[1]) - 1
    if tazo["rarity"] in {"ultra", "legendary"}:
        idx += 1
    return BG_DIR / files[idx % len(files)]


def draw_star(draw: ImageDraw.ImageDraw, cx: float, cy: float, r: float, color: tuple[int, int, int]) -> None:
    pts = []
    for i in range(5):
        outer = -math.pi / 2 + i * 2 * math.pi / 5
        inner = outer + math.pi / 5
        pts.append((cx + r * math.cos(outer), cy + r * math.sin(outer)))
        pts.append((cx + r * 0.4 * math.cos(inner), cy + r * 0.4 * math.sin(inner)))
    draw.polygon(pts, fill=color, outline=(20, 20, 20, 220))


def add_rarity_overlay(img: Image.Image, rarity: str) -> Image.Image:
    stars = RARITY_STARS.get(rarity, 1)
    color = RARITY_COLORS.get(rarity, RARITY_COLORS["common"])
    overlay = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    radius = CANVAS * 0.37
    start = -math.pi / 2 - (stars - 1) * math.pi / 10
    for i in range(stars):
        angle = start + i * math.pi / 5
        sx = CENTER + radius * math.cos(angle)
        sy = CENTER + radius * math.sin(angle) + 180
        draw_star(draw, sx, sy, 28, color)
    return Image.alpha_composite(img.convert("RGBA"), overlay)


def composite_front(tazo: dict, creature_path: Path) -> Image.Image:
    bg_path = pick_background(tazo)
    if not bg_path.exists():
        raise FileNotFoundError(bg_path)
    bg = Image.open(bg_path).convert("RGBA")
    creature = Image.open(creature_path).convert("RGBA")
    creature.thumbnail((CHARACTER_SIZE, CHARACTER_SIZE), Image.LANCZOS)

    layer = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    offset = ((CANVAS - creature.width) // 2, (CANVAS - creature.height) // 2)
    layer.alpha_composite(creature, offset)
    return add_rarity_overlay(Image.alpha_composite(bg, layer), tazo["rarity"])


def fit_text(draw: ImageDraw.ImageDraw, text: str, font_path: str, max_width: int, start_size: int, min_size: int = 24):
    for size in range(start_size, min_size - 1, -2):
        font = ImageFont.truetype(font_path, size)
        bbox = draw.textbbox((0, 0), text, font=font)
        if bbox[2] - bbox[0] <= max_width:
            return font
    return ImageFont.truetype(font_path, min_size)


def generate_back(tazo: dict) -> Image.Image | None:
    back_file = BACK_BG_FILES[tazo["franchise"]]
    back_path = BACK_DIR / back_file
    if not back_path.exists():
        return None
    back = Image.open(back_path).convert("RGBA")
    overlay = Image.new("RGBA", back.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    name = tazo["name"].upper()
    font_lg = fit_text(draw, name, font_path, int(back.width * 0.72), 60)
    font_sm = ImageFont.truetype(font_path, 36)
    cx = back.width // 2
    bbox = draw.textbbox((0, 0), name, font=font_lg)
    draw.text((cx - (bbox[2] - bbox[0]) / 2, int(back.height * 0.72)), name, fill=(255, 255, 255, 235), font=font_lg)
    rarity = f"TTG S1 · {tazo['number']} · {tazo['rarity'].upper()}"
    bbox2 = draw.textbbox((0, 0), rarity, font=font_sm)
    draw.text(
        (cx - (bbox2[2] - bbox2[0]) / 2, int(back.height * 0.80)),
        rarity,
        fill=(*FRANCHISE_COLORS[tazo["franchise"]], 220),
        font=font_sm,
    )
    return Image.alpha_composite(back, overlay)


def update_db(tazo: dict, has_front: bool, has_back: bool, publish_ready: bool) -> None:
    if not DB_PATH.exists():
        return
    status = "published" if publish_ready and has_front else "pending_review"
    source = "verified" if has_front else "pending_visual_check"
    with sqlite3.connect(DB_PATH) as db:
        db.execute(
            """
            UPDATE Tazo
            SET imageUrl = ?, backImageUrl = ?, sourceStatus = ?, publishStatus = ?
            WHERE slug = ? AND franchiseId = (SELECT id FROM Franchise WHERE slug = ?)
            """,
            (
                tazo["imageUrl"] if has_front else None,
                tazo["backImageUrl"] if has_back else None,
                source,
                status,
                tazo["slug"],
                tazo["franchise"],
            ),
        )
        db.commit()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--publish-ready", action="store_true")
    parser.add_argument("--slug")
    args = parser.parse_args()

    tazos = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    if args.slug:
        tazos = [t for t in tazos if t["slug"] == args.slug]
    creature_index = load_creature_index()

    done = 0
    missing = []
    for tazo in tazos:
        creature_path = find_creature_art(tazo, creature_index)
        if not creature_path:
            missing.append(f"{tazo['number']} {tazo['slug']}")
            update_db(tazo, False, False, args.publish_ready)
            continue

        front = composite_front(tazo, creature_path)
        dest_dir = DEST_DIR / tazo["franchise"]
        dest_dir.mkdir(parents=True, exist_ok=True)
        front_path = dest_dir / f"{tazo['slug']}.png"
        front.save(front_path, "PNG", optimize=True)

        has_back = False
        back = generate_back(tazo)
        if back:
            back_dir = dest_dir / "back"
            back_dir.mkdir(parents=True, exist_ok=True)
            back.save(back_dir / f"{tazo['slug']}-back.png", "PNG", optimize=True)
            has_back = True

        update_db(tazo, True, has_back, args.publish_ready)
        done += 1
        if done == 1 or done % 10 == 0:
            print(f"[{done}] {tazo['number']} {tazo['slug']} <- {creature_path.relative_to(PROJECT)}")

    print(f"OK composited={done} missing_creature_art={len(missing)}")
    if missing:
        print("Missing first 20:", ", ".join(missing[:20]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
