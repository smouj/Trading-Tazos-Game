# TTG Creature Generation Canon v1

Source PDF: `docs/canon/TTG_Canon_Visual_Criaturas_Series_v1.pdf`

This note turns the visual canon PDF into an operational checklist for creating new Trading Tazos Game characters. Use it for prompts, art QA, catalog entries, and naming.

## Core Rule

All creatures and characters must be original to TTG. Do not copy names, attacks, emblems, hair, palettes, outfits, armor, proportions, poses, silhouettes, transformations, or recognizable traits from existing franchises.

Every asset must work as a tazo:

- Clear large silhouette.
- Readable front view.
- Expressive eyes or focal face.
- Few tiny details.
- Transparent background.
- Safe margin around the character, roughly 8-10%.
- Strong identity at small UI sizes.

## Series

### Minimon

Identity: natural fantasy creatures with elemental flavor.

Structure: 151 creatures. Some have no evolution, most have 2 or 3 forms.

Design language:

- Based on real animals reinterpreted as original elemental fantasy creatures.
- Clean, expressive, youthful, collectible, and memorable.
- Evolution must keep the same anatomy family and core traits.
- Later forms grow in size, elemental energy, silhouette confidence, and mythology.
- Maximum 3 forms. Some rare creatures stay single-stage for collection rhythm.

Naming rule:

- Base form hints at the animal or element.
- Middle form reinforces body, function, or combat identity.
- Final form should sound larger, mythical, territorial, or legendary.

Priority art standard:

- Finish the first 9 Minimon before expanding the rest because they define the visual standard.
- Starter lines:
  - `001 Braskid -> 002 Brascale -> 003 Bravyrm`: Fire / Draconic salamander-lizard into compact volcanic dragon.
  - `004 Mantleaf -> 005 Mantthorn -> 006 Verdantis`: Plant / Insect leaf mantis with thorns and predator posture.
  - `007 Aquapup -> 008 Rivermaw -> 009 Ocealor`: Water fantasy aquatic mammal, playful to regal.

Prompt block:

```text
Original collectible creature for Trading Tazos Game, based on a real animal reinterpreted as an elemental fantasy creature. Clean, expressive, youthful, memorable design with a clear silhouette for a circular tazo format. Preserve evolution-family coherence: same anatomy family and core traits, with greater size, power, and elemental energy in later forms. Centered character, transparent background, safe margin. Do not copy designs, silhouettes, exact colors, names, poses, patterns, or recognizable traits from existing franchises.
```

### Cybermon

Identity: digital entities, viruses, data beasts, and living machines.

Structure: 50 base lines with cyberevolutions and optional corrupt/core variants.

Design language:

- Digital bodies, energy plates, glowing eyes, circuit patterns, floating modules, visible cores.
- Evolution is digital reconfiguration, not organic growth.
- Later forms add modules, armor, energy density, code effects, or core changes.
- Optional variants can use `Glitch`, `Core`, `Firewall`, `Shadow`, `Root`, or `Overclock` when they match the line.

Priority art standard:

- After the Minimon starters, produce Cybermon `C001-C010`.
- Key reference lines:
  - `C001 Bytecub -> Bytefang -> Byteking`: data beast.
  - `C007 Virox -> Viroblade -> Virorex`: aggressive virus line with violet corrupt energy.
  - `C009 Codile -> Codrake -> Codragon`: code / reptile line.
  - `C050 Omnibit -> Omnicore -> Omnirex`: final / legendary line.

Prompt block:

```text
Original digital entity for Trading Tazos Game with a body made from data, energy plates, glowing eyes, circuit patterns, floating modules, and a visible digital core. Simple, powerful, readable at small size. Cyberevolution should feel like digital reconfiguration: more modules, armor, energy, code changes, and core upgrades, not natural animal growth. Centered character, transparent background, safe margin. No direct references or recognizable traits from real franchises.
```

### Dracobell

Identity: original fantasy martial-arts fighters with aura, lineage, class, rivalry, and transformations.

Structure: 50 base characters, each with two or more phases.

Design language:

- These are fighters, not evolutive creatures.
- Each base form must be recognizable through posture, aura, invented emblem, and main color.
- Transformations increase aura, presence, energy marks, posture intensity, and invented details.
- Avoid copying hair, outfits, armor, color schemes, poses, or symbols from existing works.

Classes:

- `Striker`: quick strikes, frontal posture, explosive aura.
- `Guardian`: heavy body, guard posture, defensive energy.
- `Auralord`: fluid aura, invented symbols, spiritual control.
- `Beastborn`: abstract animal traits, claws, roar energy.
- `Monkblade`: discipline, invented energy weapon.
- `Stormfist`: electricity or explosive impact.
- `Voidwalker`: shadows and original dark marks.
- `Sunborn`: sunlight, heat, golden energy.
- `Ironbody`: metal body, plates, physical weight.
- `Skyfighter`: aerial movement, wind bands.
- `Dragonkin`: ancient lineage, symbolic scales.
- `Bell Sage`: bells, resonance, calm spiritual energy.

Priority art standard:

- After Cybermon `C001-C010`, produce Dracobell `D001-D010`.
- Key references:
  - `D001 Rai Kendo -> Rai Ascendant -> Rai Overflare`: Striker.
  - `D002 Tenzan Varo -> Tenzan Ironform -> Tenzan Mountain Soul`: Guardian.
  - `D003 Mizu Aran -> Mizu Flowstate -> Mizu Abyss Form`: Auralord.
  - `D004 Kairo Den -> Kairo Sparkform -> Kairo Thunder Crown`: Stormfist.
  - `D005 Haru Solen -> Haru Sunflare -> Haru Dawn King`: Sunborn.

Prompt block:

```text
Original Trading Tazos Game combat character with fantasy martial arts, invented outfit, unique aura, original emblem, and progressive transformation language. Each phase increases presence, aura intensity, energy marks, posture, and invented details while preserving identity. Centered character, transparent background, safe margin, clear tazo readability. Do not copy hair, outfits, armor, colors, poses, symbols, or transformation cues from existing works.
```

## Technical Asset Spec

- Main art: transparent PNG, 1024x1024.
- Front tazo version: PNG, 1024x1024, placed over existing tazo front background.
- Small icon: PNG, 512x512, simplified silhouette for UI and collection views.
- Metadata should include: `id`, `series`, `name`, `type`, `rarity`, `phase`, `evolvesFrom`, `evolvesTo`, and image path.
- Recommended catalog split: `data/catalog/minimon.json`, `data/catalog/cybermon.json`, `data/catalog/dracobell.json`.

## QA Checklist

Before publishing an asset:

- Name is original, pronounceable, and fits TTG.
- Silhouette is not recognizable from another franchise.
- Palette is not an exact match to a known character.
- Pose, costume, armor, hair, emblem, weapon, and transformation are original.
- Evolution/phase keeps clear thematic continuity.
- Character reads well at tazo size.
- Background is transparent.
- Margins are safe for circular cropping.
- Catalog metadata matches the canon series and route.

## Integration Priority

1. Keep the PDF as canon v1.0.
2. Create versioned JSON catalogs per series.
3. Mark old catalog names and references as legacy when they conflict.
4. Generate art in small batches.
5. Start with the 9 Minimon starters.
6. Then Cybermon `C001-C010`.
7. Then Dracobell `D001-D010`.
8. Run visual QA in: raw PNG, front tazo, 3D tazo, thumbnail, and collection grid.
