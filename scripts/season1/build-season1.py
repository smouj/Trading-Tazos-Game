#!/usr/bin/env python3
"""
Build TTG Season 1 canonical data from the lore bible markdown.

Outputs:
- scripts/season1/season1-tazos.json: DB-ready tazo definitions.
- artgen/creatures.season1.json: artgen-ready creature/fighter prompts.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path


PROJECT = Path(__file__).resolve().parents[2]
DEFAULT_BIBLE = Path(
    "/home/smouj/.openclaw/media/inbound/"
    "TTG_Season1_Biblia_Lore_Coleccion_Agente---073b9b37-0b5d-4fa5-b07e-e0854ce486d3.md"
)

SERIES = {
    "MIN": {
        "section": "Minimon",
        "franchise": "minimon",
        "group_key": "lineage",
        "art_direction": (
            "Original collectible natural creature for a circular game token, full body centered, "
            "rounded readable silhouette, expressive eyes, clean 90s-inspired cel-shaded creature "
            "illustration, vibrant but controlled colors, charming adventure-fantasy energy."
        ),
        "negative": (
            "No copyrighted characters, no franchise symbols, no logos, no text, no watermark, "
            "no direct imitation of known mascots, no cropped body, no cluttered background, "
            "no realistic photo style, no existing creature silhouette."
        ),
    },
    "DRA": {
        "section": "Dracobell",
        "franchise": "dracobell",
        "group_key": "baseWarrior",
        "art_direction": (
            "Original martial energy fighter for a circular game token, full body centered, dynamic "
            "combat pose, clean action-anime linework, invented martial outfit, stylized anatomy, "
            "elemental aura shaped like resonant waves, dramatic cel shading."
        ),
        "negative": (
            "No copyrighted characters, no franchise symbols, no logos, no text, no watermark, "
            "no recognizable martial anime uniforms, no iconic hair silhouettes, no copied poses, "
            "no existing character traits, no cropped body."
        ),
    },
    "CYB": {
        "section": "Cybermon",
        "franchise": "cybermon",
        "group_key": "protocol",
        "art_direction": (
            "Original living digital monster for a circular game token, full body centered, organic "
            "circuit patterns, glowing core, translucent armor plates, controlled glitch accents, "
            "neon energy, readable silhouette, cel-shaded high-detail finish."
        ),
        "negative": (
            "No copyrighted characters, no franchise symbols, no logos, no text, no watermark, "
            "no generic mecha, no direct imitation of known digital monsters, no cluttered background, "
            "no cropped body."
        ),
    },
}

RARITY_MAP = {
    "Común": "common",
    "Poco común": "uncommon",
    "Raro": "rare",
    "Ultra": "ultra",
    "Legendario": "legendary",
}

ROLE_MAP = {
    "Agresivo": "attacker",
    "Atacante": "attacker",
    "Control": "technical",
    "Defensa": "tank",
    "Especial": "special",
    "Legendario": "special",
    "Pesado": "heavy",
    "Precisión": "technical",
    "Rebote": "bouncer",
    "Soporte": "balanced",
    "Tanque": "tank",
    "Técnico": "technical",
    "Veloz": "light",
}

HEADERS = {
    "MIN": ["number", "name", "lineage", "artFile", "affinity", "role", "rarity", "lore", "skill"],
    "DRA": ["number", "name", "baseWarrior", "artFile", "affinity", "role", "rarity", "lore", "skill"],
    "CYB": ["number", "name", "protocol", "artFile", "affinity", "role", "rarity", "lore", "skill"],
}


def slugify(value: str) -> str:
    value = value.lower().strip()
    table = str.maketrans("áéíóúüñ", "aeiouun")
    value = value.translate(table)
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def stable(seed: str) -> int:
    return int(hashlib.sha256(seed.encode("utf-8")).hexdigest()[:8], 16)


def stat_block(seed: str, role: str, rarity: str) -> dict[str, int]:
    base = {
        "attack": 45,
        "defense": 45,
        "resistance": 45,
        "weight": 45,
        "stability": 45,
        "spin": 45,
        "control": 45,
        "bounce": 45,
        "precision": 45,
    }
    boosts = {
        "attacker": {"attack": 16, "precision": 6},
        "tank": {"defense": 14, "resistance": 12, "stability": 8, "weight": 6},
        "technical": {"control": 14, "precision": 10, "spin": 6},
        "bouncer": {"bounce": 16, "spin": 8, "control": 4},
        "heavy": {"weight": 16, "attack": 8, "stability": 8},
        "light": {"spin": 14, "bounce": 8, "precision": 6},
        "balanced": {"control": 8, "defense": 6, "attack": 6},
        "special": {"attack": 10, "control": 10, "precision": 8},
    }
    rarity_bonus = {"common": 0, "uncommon": 4, "rare": 8, "ultra": 13, "legendary": 18}[rarity]
    for key in base:
        jitter = stable(f"{seed}:{key}") % 13
        base[key] = min(95, base[key] + rarity_bonus + jitter + boosts.get(role, {}).get(key, 0))
    return base


def find_table(markdown: str, prefix: str) -> list[dict[str, str]]:
    pattern = r"# (?:7|8|9)\. Lista final Season 1 — (?:Minimon|Dracobell|Cybermon)|# 10\."
    starts = list(re.finditer(pattern, markdown))
    target = SERIES[prefix]["section"]
    start = None
    end = len(markdown)
    for idx, match in enumerate(starts):
        if target in match.group(0):
            start = match.end()
            if idx + 1 < len(starts):
                end = starts[idx + 1].start()
            break
    if start is None:
        raise ValueError(f"Could not find Season 1 table for {target}")

    rows = []
    for raw in markdown[start:end].splitlines():
        line = raw.strip()
        if not line.startswith("|"):
            continue
        cells = [cell.strip() for cell in line.strip("|").split("|")]
        if not cells or cells[0] in {"Nº", "---"} or cells[0].startswith("---"):
            continue
        if len(cells) != len(HEADERS[prefix]):
            raise ValueError(f"Bad {prefix} row ({len(cells)} cells): {line}")
        rows.append(dict(zip(HEADERS[prefix], cells)))
    return rows


def make_prompt(row: dict[str, str], prefix: str) -> str:
    meta = SERIES[prefix]
    evolution_label = row["artFile"].rsplit(".", 1)[0].replace("_", " ")
    return (
        f"{meta['art_direction']} Create {row['number']} {row['name']} as a 100% original TTG Season 1 "
        f"{meta['section']} design. Affinity: {row['affinity']}. Role: {row['role']}. "
        f"Collection identity: {row[meta['group_key']]}. Visual file intent: {evolution_label}. "
        f"Lore cue: {row['lore']} Signature technique cue: {row['skill']}. "
        "Transparent alpha background only; character isolated; no tazo border, no card frame, no scenery, "
        "generous padding, crisp edges, centered circular-token readable silhouette."
    )


def build(markdown: str) -> tuple[list[dict], list[dict]]:
    tazos = []
    creatures = []
    for prefix in ["MIN", "DRA", "CYB"]:
        meta = SERIES[prefix]
        rows = find_table(markdown, prefix)
        if len(rows) != 50:
            raise ValueError(f"{prefix} expected 50 rows, got {len(rows)}")

        for row in rows:
            rarity = RARITY_MAP[row["rarity"]]
            role = ROLE_MAP[row["role"]]
            slug = slugify(row["name"])
            numeric = int(row["number"].split("-")[1])
            stats = stat_block(row["number"], role, rarity)
            tazo = {
                "season": 1,
                "number": row["number"],
                "name": row["name"],
                "displayName": row["name"],
                "slug": slug,
                "franchise": meta["franchise"],
                "collectionSlug": f"{meta['franchise']}-season-1",
                "artFile": row["artFile"],
                "rarity": rarity,
                "role": role,
                "combatType": row["affinity"],
                "skill": row["skill"],
                "skillDesc": row["lore"],
                "lore": row["lore"],
                "category": "tazos",
                "imageUrl": f"/tazos-generated/{meta['franchise']}/{slug}.png",
                "backImageUrl": f"/tazos-generated/{meta['franchise']}/back/{slug}-back.png",
                **stats,
            }
            if prefix == "MIN":
                tazo["evolutionFrom"] = ""
                tazo["evolutionTo"] = ""
                tazo["transformStage"] = re.search(r"evo(\d+)", row["artFile"]).group(1) if "evo" in row["artFile"] else ""
                tazo["lineage"] = row["lineage"]
            elif prefix == "DRA":
                phase_match = re.search(r"phase(\d+)", row["artFile"])
                tazo["transformStage"] = phase_match.group(1) if phase_match else ""
                tazo["transformOf"] = row["baseWarrior"]
                tazo["baseWarrior"] = row["baseWarrior"]
            else:
                form = row["artFile"].rsplit("_", 1)[-1].replace(".png", "")
                tazo["transformStage"] = form
                tazo["transformOf"] = row["protocol"]
                tazo["protocol"] = row["protocol"]

            tazos.append(tazo)
            creatures.append(
                {
                    "id": row["number"],
                    "season": 1,
                    "name": row["name"],
                    "slug": slug,
                    "line": meta["franchise"],
                    "number": numeric,
                    "rarity": rarity,
                    "type": row["affinity"],
                    "role": role,
                    "artFile": row["artFile"],
                    "prompt": make_prompt(row, prefix),
                    "negative_prompt": meta["negative"],
                    "lore": row["lore"],
                    "skill": row["skill"],
                    meta["group_key"]: row[meta["group_key"]],
                }
            )
    return tazos, creatures


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--bible", type=Path, default=DEFAULT_BIBLE)
    args = parser.parse_args()

    markdown = args.bible.read_text(encoding="utf-8")
    tazos, creatures = build(markdown)

    if len(tazos) != 150 or len(creatures) != 150:
        raise SystemExit("Season 1 build did not produce exactly 150 tazos/prompts")
    if len({t["number"] for t in tazos}) != 150:
        raise SystemExit("Duplicate Season 1 numbers detected")
    if len({(t["franchise"], t["slug"]) for t in tazos}) != 150:
        raise SystemExit("Duplicate Season 1 franchise/slug pairs detected")

    out_tazos = PROJECT / "scripts" / "season1" / "season1-tazos.json"
    out_creatures = PROJECT / "artgen" / "creatures.season1.json"
    out_tazos.write_text(json.dumps(tazos, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    out_creatures.write_text(
        json.dumps(
            {
                "metadata": {
                    "title": "TTG Season 1 Canonical Art Prompts",
                    "version": "season1-bible",
                    "total": 150,
                    "source": str(args.bible),
                },
                "creatures": creatures,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"OK season1 tazos={len(tazos)} prompts={len(creatures)}")
    print(out_tazos)
    print(out_creatures)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
