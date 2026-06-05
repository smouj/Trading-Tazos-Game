#!/usr/bin/env python3
"""
Trading Tazos Game — Premium Tazo Art Generator (Optimized)
Generates 1024x1024 PNG tazo disc images efficiently.
"""

import sqlite3, os, math, random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT_DIR = Path("public/tazos-generated")
SIZE = 1024
CENTER = SIZE // 2
RADIUS = 440  # Leave breathing room

FRANCHISE = {
    "minimon": {
        "primary": (255, 203, 5),
        "secondary": (34, 197, 94),
        "dark": (124, 45, 18),
        "accent": (34, 197, 94),
        "bg_light": (252, 252, 240),
        "bg_mid": (240, 250, 230),
        "text_dark": (26, 26, 26),
        "text_light": (255, 255, 255),
        "collection": "POKÉMON TAZOS 1",
        "ring_colors": [(255,203,5), (34,197,94), (124,45,18)],
        "type_colors": {
            "fire":(239,68,68),"water":(59,130,246),"grass":(34,197,94),
            "electric":(250,204,21),"psychic":(236,72,153),"ghost":(124,58,237),
            "dragon":(249,115,22),"normal":(156,163,175),
        }
    },
    "cybermon": {
        "primary": (0, 161, 233),
        "secondary": (0, 87, 183),
        "dark": (30, 58, 95),
        "accent": (6, 182, 212),
        "bg_light": (220, 245, 255),
        "bg_mid": (190, 230, 250),
        "text_dark": (26, 26, 26),
        "text_light": (255, 255, 255),
        "collection": "DIGIMON MAGIC BOX 2000",
        "ring_colors": [(0,161,233), (0,87,183), (30,58,95)],
        "type_colors": {
            "data":(0,161,233),"virus":(139,92,246),
            "vaccine":(34,197,94),"free":(156,163,175),
        }
    },
    "dracobell": {
        "primary": (255, 107, 0),
        "secondary": (204, 68, 0),
        "dark": (124, 45, 18),
        "accent": (227, 53, 13),
        "bg_light": (255, 245, 225),
        "bg_mid": (255, 230, 200),
        "text_dark": (26, 26, 26),
        "text_light": (255, 255, 255),
        "collection": "DBZ MATUTANO 1995",
        "ring_colors": [(255,107,0), (204,68,0), (124,45,18)],
        "type_colors": {
            "saiyan":(227,53,13),"namekian":(34,197,94),
            "human":(245,158,11),"android":(139,92,246),"fusion":(236,72,153),
        }
    },
}

RARITY = {
    "common":    {"border":(156,163,175),"stars":1,"glow":None},
    "uncommon":  {"border":(34,197,94),"stars":2,"glow":(34,197,94)},
    "rare":      {"border":(59,130,246),"stars":3,"glow":(59,130,246)},
    "ultra":     {"border":(168,85,247),"stars":4,"glow":(168,85,247)},
    "legendary": {"border":(251,191,36),"stars":5,"glow":(251,191,36)},
}

# Pre-render a radial gradient mask (H, W)
def make_gradient(center_color, edge_color):
    arr = bytearray(SIZE * SIZE * 4)
    cx, cy = CENTER, CENTER
    for y in range(SIZE):
        for x in range(SIZE):
            dx, dy = x - cx, y - cy
            dist = math.sqrt(dx*dx + dy*dy)
            t = min(1.0, dist / RADIUS)
            # More gradual gradient — stay bright longer, darken at edges
            t2 = t ** 1.5  # Ease: stays bright in center, darkens at edge
            blend = 0
            if t > 0.6:
                blend = (t - 0.6) / 0.4  # Only darken the outer 40%
            r = int(center_color[0] + (edge_color[0] - center_color[0]) * blend)
            g = int(center_color[1] + (edge_color[1] - center_color[1]) * blend)
            b = int(center_color[2] + (edge_color[2] - center_color[2]) * blend)
            idx = (y * SIZE + x) * 4
            arr[idx] = r
            arr[idx+1] = g
            arr[idx+2] = b
            arr[idx+3] = 255
    return Image.frombytes("RGBA", (SIZE, SIZE), bytes(arr))

# Pre-render gradients (one per franchise)
GRADIENTS = {}
def get_gradient(franchise_slug):
    if franchise_slug not in GRADIENTS:
        fx = FRANCHISE[franchise_slug]
        GRADIENTS[franchise_slug] = make_gradient(fx["primary"], fx["dark"])
    return GRADIENTS[franchise_slug].copy()


def draw_star(draw, cx, cy, r, color, points=5):
    pts = []
    for i in range(points * 2):
        angle = -math.pi/2 + i * math.pi / points
        rad = r if i % 2 == 0 else r * 0.4
        pts.append((cx + math.cos(angle) * rad, cy + math.sin(angle) * rad))
    draw.polygon(pts, fill=color)

def get_fonts():
    try:
        base = "/usr/share/fonts/truetype/dejavu/"
        return {
            "small": ImageFont.truetype(base + "DejaVuSans-Bold.ttf", 22),
            "large": ImageFont.truetype(base + "DejaVuSans-Bold.ttf", 90),
            "medium": ImageFont.truetype(base + "DejaVuSans-Bold.ttf", 36),
            "number": ImageFont.truetype(base + "DejaVuSansMono-Bold.ttf", 28),
            "tiny": ImageFont.truetype(base + "DejaVuSans-Bold.ttf", 16),
        }
    except:
        d = ImageFont.load_default()
        return {k: d for k in ["small","large","medium","number","tiny"]}


def generate_tazo(tazo, fonts):
    fs = tazo["franchise_slug"]
    fx = FRANCHISE.get(fs, FRANCHISE["minimon"])
    rz = RARITY.get(tazo.get("rarity", "common"), RARITY["common"])
    number = tazo.get("number", 1)
    name = tazo.get("displayName", tazo.get("name", "???"))
    collection = fx["collection"]
    combat_type = tazo.get("combatType")
    dark = fx["dark"]
    border_color = rz["border"]

    slug = tazo["slug"]
    rng = random.Random(hash(slug) & 0xFFFFFFFF)

    # ── Start with gradient base ──
    img = get_gradient(fs)
    draw = ImageDraw.Draw(img)

    # ── Mask to circle ──
    mask = Image.new("L", (SIZE, SIZE), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse([CENTER-RADIUS, CENTER-RADIUS, CENTER+RADIUS, CENTER+RADIUS], fill=255)
    # Soften mask edges
    mask = mask.filter(ImageFilter.GaussianBlur(1))
    img.putalpha(mask)

    # ── Rings (from outside in) ──
    R = RADIUS
    # Outer border
    draw.ellipse([CENTER-R-5, CENTER-R-5, CENTER+R+5, CENTER+R+5], outline=border_color, width=10)
    draw.ellipse([CENTER-R+5, CENTER-R+5, CENTER+R-5, CENTER+R-5], outline=(26,26,26), width=3)
    
    # Decorative rings
    for offset, w, color, alpha in [
        (16, 2, (255,255,255), 180),
        (26, 3, fx["ring_colors"][1], 200),
        (36, 1, (255,255,255), 120),
    ]:
        draw.ellipse([CENTER-R+offset, CENTER-R+offset, CENTER+R-offset, CENTER+R-offset],
                     outline=color + (alpha,) if len(color) == 3 else color, width=w)

    # Dots ring
    for i in range(24):
        angle = i * 2*math.pi / 24
        dx = CENTER + math.cos(angle) * (R - 48)
        dy = CENTER + math.sin(angle) * (R - 48)
        dot_c = fx["ring_colors"][rng.randint(0, 2)]
        draw.ellipse([dx-3, dy-3, dx+3, dy+3], fill=dot_c + (140,))

    # ── Inner disc (lighter background) ──
    inner_r = R - 70
    # Use a solid fill with slight transparency for depth
    inner_overlay = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    inner_draw = ImageDraw.Draw(inner_overlay)
    inner_draw.ellipse([CENTER-inner_r, CENTER-inner_r, CENTER+inner_r, CENTER+inner_r],
                       fill=fx["bg_light"] + (200,))
    img = Image.alpha_composite(img, inner_overlay)
    draw = ImageDraw.Draw(img)

    # Inner border
    draw.ellipse([CENTER-inner_r, CENTER-inner_r, CENTER+inner_r, CENTER+inner_r],
                 outline=dark + (200,), width=4)

    # ── Core area — subtle stripes ──
    core_r = inner_r - 20
    stripe_overlay = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    stripe_draw = ImageDraw.Draw(stripe_overlay)
    for i in range(6):
        angle = i * math.pi / 3 + rng.random() * 0.3
        x1 = CENTER + math.cos(angle) * core_r * 0.6
        y1 = CENTER + math.sin(angle) * core_r * 0.6
        x2 = CENTER + math.cos(angle) * core_r
        y2 = CENTER + math.sin(angle) * core_r
        c = fx["ring_colors"][i % 3]
        stripe_draw.line([(x1, y1), (x2, y2)], fill=c + (40,), width=30)
    img = Image.alpha_composite(img, stripe_overlay)
    draw = ImageDraw.Draw(img)

    # ── Center shine ──
    shine_overlay = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    shine_draw = ImageDraw.Draw(shine_overlay)
    shine_draw.ellipse([CENTER-core_r*0.5, CENTER-core_r*0.5-30, CENTER+core_r*0.5, CENTER+core_r*0.5-30],
                       fill=(255, 255, 255, 50))
    img = Image.alpha_composite(img, shine_overlay)
    draw = ImageDraw.Draw(img)

    # ── Text: Collection name (top) ──
    coll_bbox = draw.textbbox((0, 0), collection, font=fonts["small"])
    cw = coll_bbox[2] - coll_bbox[0]
    draw.text((CENTER - cw//2, 65), collection, fill=fx["text_light"],
              font=fonts["small"], stroke_width=2, stroke_fill=dark)

    # ── Character Letter(s) ──
    letters = ''.join([w[0] for w in name.split() if w])[:2]
    if not letters:
        letters = name[:2] if len(name) >= 2 else name[0]

    lbbox = draw.textbbox((0, 0), letters, font=fonts["large"])
    lw, lh = lbbox[2] - lbbox[0], lbbox[3] - lbbox[1]

    # Glow
    if rz["glow"]:
        for o in range(6, 0, -2):
            draw.text((CENTER - lw//2 - o, CENTER - lh//2 - 20 - o), letters,
                      fill=rz["glow"] + (40,), font=fonts["large"])
            draw.text((CENTER - lw//2 + o, CENTER - lh//2 - 20 + o), letters,
                      fill=rz["glow"] + (40,), font=fonts["large"])

    draw.text((CENTER - lw//2, CENTER - lh//2 - 20), letters,
              fill=fx["text_light"], font=fonts["large"],
              stroke_width=5, stroke_fill=dark)

    # ── Type badge (Minimon) ──
    if combat_type and fs == "minimon" and combat_type in fx["type_colors"]:
        tc = fx["type_colors"][combat_type]
        type_text = combat_type.upper()
        tbbox = draw.textbbox((0, 0), type_text, font=fonts["small"])
        tw = tbbox[2] - tbbox[0]
        bad_y = CENTER + 70
        pad = 10
        draw.rounded_rectangle(
            [CENTER - tw//2 - pad, bad_y - 12 - pad,
             CENTER + tw//2 + pad, bad_y + 12 + pad],
            radius=12, fill=tc + (220,), outline=dark, width=2
        )
        draw.text((CENTER - tw//2, bad_y - 12), type_text,
                  fill=(255,255,255), font=fonts["small"],
                  stroke_width=1, stroke_fill=dark)

    # ── Name at bottom ──
    if len(name) > 14:
        sp = name.rfind(' ', 0, len(name)//2 + 4)
        if sp > 3:
            name_lines = [name[:sp], name[sp+1:]]
        else:
            name_lines = [name[:14], name[14:]]
    else:
        name_lines = [name]

    n_y = CENTER + RADIUS - 65  # Well inside the disc
    for line in reversed(name_lines):
        nbbox = draw.textbbox((0, 0), line, font=fonts["medium"])
        nw = nbbox[2] - nbbox[0]
        pad = 8
        draw.rounded_rectangle(
            [CENTER - nw//2 - pad, n_y - 26 - pad,
             CENTER + nw//2 + pad, n_y + pad],
            radius=14, fill=(255,255,255,230), outline=dark, width=3
        )
        draw.text((CENTER - nw//2, n_y - 26), line, fill=dark, font=fonts["medium"])
        n_y -= 34

    # ── Number badge (inside disc, bottom-right) ──
    num_str = f"Nº {number}"
    nbbox2 = draw.textbbox((0, 0), num_str, font=fonts["tiny"])
    nw2 = nbbox2[2] - nbbox2[0]
    nx = CENTER + RADIUS - 130  # Further inside
    ny = CENTER + RADIUS - 130
    draw.rounded_rectangle(
        [nx - nw2//2 - 6, ny - 10 - 4, nx + nw2//2 + 6, ny + 10 + 4],
        radius=8, fill=(255,255,255,220), outline=dark, width=2
    )
    draw.text((nx - nw2//2, ny - 10), num_str, fill=dark, font=fonts["tiny"])

    # ── Rarity stars ──
    star_r = 8
    total_w = rz["stars"] * (star_r * 3 + 2)
    sx = CENTER - total_w // 2
    sy = CENTER - inner_r + 35
    for s in range(rz["stars"]):
        draw_star(draw, sx + s*(star_r*3+2) + star_r, sy, star_r, rz["border"])

    # ── Legendary burst ──
    if tazo.get("rarity") == "legendary":
        for _ in range(16):
            a = rng.random() * 2 * math.pi
            length = (inner_r - 40) * (0.4 + rng.random() * 0.6)
            x1 = CENTER + math.cos(a) * (inner_r * 0.25)
            y1 = CENTER + math.sin(a) * (inner_r * 0.25)
            x2 = CENTER + math.cos(a) * length
            y2 = CENTER + math.sin(a) * length
            draw.line([(x1, y1), (x2, y2)],
                      fill=(251,191,36,rng.randint(30,110)),
                      width=rng.randint(1,3))

    return img


def main():
    import sys
    db_path = sys.argv[1] if len(sys.argv) > 1 else "/home/smouj/apps/ttg/Trading-Tazos-Game/prisma/dev.db"

    print(f"DB: {db_path}")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    tazos = [dict(r) for r in conn.execute(
        "SELECT t.number, t.slug, t.name, t.displayName, t.rarity, "
        "t.combatType, f.slug as franchise_slug "
        "FROM Tazo t JOIN Franchise f ON t.franchiseId = f.id "
        "ORDER BY f.slug, t.number"
    )]
    conn.close()
    print(f"Total tazos: {len(tazos)}")

    fonts = get_fonts()
    generated, skipped = 0, 0

    for t in tazos:
        slug = t["slug"]
        fs = t["franchise_slug"]
        out = OUT_DIR / fs / f"{slug}.png"
        if out.exists():
            skipped += 1
            continue
        out.parent.mkdir(parents=True, exist_ok=True)
        try:
            img = generate_tazo(t, fonts)
            img.save(str(out), "PNG", optimize=True)
            generated += 1
        except Exception as e:
            print(f"  ERROR {slug}: {e}")
            continue
        if generated % 50 == 0:
            print(f"  ... {generated}/{len(tazos)}")

    print(f"\n=== Done: {generated} generated, {skipped} skipped, {len(tazos)} total ===")


if __name__ == "__main__":
    main()
