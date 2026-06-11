#!/usr/bin/env python3
"""Find Cybermon/Dracobell publication discrepancies."""
import sqlite3, os

DB = "/home/smouj/apps/ttg/Trading-Tazos-Game/prisma/dev.db"
COMPOS = "/home/smouj/apps/ttg/Trading-Tazos-Game/public/tazos-generated"

conn = sqlite3.connect(DB)
conn.row_factory = sqlite3.Row

# Get composite files by franchise
compos = {"minimon": set(), "dracobell": set(), "cybermon": set()}
for franchise in ["minimon", "dracobell", "cybermon"]:
    path = os.path.join(COMPOS, franchise)
    if os.path.isdir(path):
        for f in os.listdir(path):
            if f.endswith(".png") and "back" not in f.lower() and f != "minimon-t1-1.png":
                compos[franchise].add(f.replace(".png", ""))

# Get franchises
franchises = {}
for r in conn.execute("SELECT id, slug FROM Franchise").fetchall():
    franchises[r["id"]] = r["slug"]

# Get published tazos
pub = conn.execute(
    "SELECT id, name, slug, number, franchiseId FROM Tazo WHERE publishStatus = ?",
    ("published",)
).fetchall()

pub_by_f = {"minimon": [], "dracobell": [], "cybermon": []}
for t in pub:
    fs = franchises.get(t["franchiseId"], "unknown")
    if fs in pub_by_f:
        pub_by_f[fs].append(t)

for f in ["minimon", "dracobell", "cybermon"]:
    print(f"\n--- {f} ---")
    print(f"  Published: {len(pub_by_f[f])}")
    print(f"  Composites: {len(compos[f])}")
    
    pub_slugs = set()
    pub_names = set()
    for t in pub_by_f[f]:
        if t["slug"]: pub_slugs.add(t["slug"])
        if t["name"]: pub_names.add(t["name"].lower())
    
    # Published without composite
    no_compo = []
    for t in pub_by_f[f]:
        slug = t["slug"] or ""
        name = (t["name"] or "").lower()
        if (slug not in compos[f] and name not in compos[f] 
            and name.replace(" ", "-") not in compos[f]):
            no_compo.append(f"  NO COMPO: {t['name']} (#{t['number']}) slug={slug}")
    
    if no_compo:
        print(f"  Published WITHOUT composite ({len(no_compo)}):")
        for n in no_compo:
            print(n)
    
    # Published *more than once* (duplicates matching same composite)
    matched = {}  # composite_name -> [(tazo, slug)]
    for t in pub_by_f[f]:
        slug = t["slug"] or ""
        name = (t["name"] or "").lower()
        for c in compos[f]:
            if slug == c or name == c or name.replace(" ", "-") == c:
                if c not in matched:
                    matched[c] = []
                matched[c].append(t["name"])
    
    dups = {k: v for k, v in matched.items() if len(v) > 1}
    if dups:
        print(f"  DUPLICATE matches ({len(dups)}):")
        for compo, tazos in dups.items():
            print(f"    {compo}.png -> {', '.join(tazos)}")
    
    # Composites without published
    matched_slugs = set(matched.keys())
    unmatched = compos[f] - matched_slugs
    if unmatched:
        print(f"  Composites WITHOUT matching published ({len(unmatched)}):")
        for c in sorted(unmatched):
            print(f"    {c}.png")

conn.close()
