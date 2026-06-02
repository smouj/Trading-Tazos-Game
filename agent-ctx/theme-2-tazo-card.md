# Task theme-2: TazoCard Magazine Style Overhaul

## Summary
Rewrote `/home/z/my-project/src/components/game/tazo-card.tsx` with a complete 90s-2000s magazine visual style.

## Changes Made

### Card Container
- Uses `mag-card` class: white background, 3px solid black border, 4px 4px 0px black shadow
- Minimal rounding: `rounded-lg`
- `tazo-card-hover` class for lift+rotate on hover
- Not owned tazos: `grayscale-[60%] opacity-75` with centered Lock icon overlay and `lock-pulse` animation

### Circular Tazo Disc
- Thick black border (3px solid #1a1a1a) on all tazos
- More vibrant franchise gradients (higher opacity from/to colors)
- Legendary: yellow star sticker in top-left corner (Star icon in yellow circle with black border)
- Holo: `holo-border` class for rainbow shimmer
- Metallic: `metallic-effect` class for shine overlay
- Worn: `worn-overlay` class for scratch pattern
- Character initial: BIGGER (text-3xl/4xl), white with 2px black text-stroke
- Printed number: small badge with white bg + black border at bottom of circle

### Name Section
- Character name: bold black text (font-black, color #1a1a1a)
- Franchise name: on colored strip background matching franchise (yellow/pokemon, blue/digimon, orange/dbz)
- Strip has 2px black border and black text-shadow for contrast

### Rarity & Condition Badges
- Magazine sticker style: thick colored border, bold text, colored background
- Rarity colors: Common=gray, Uncommon=green, Rare=blue, Ultra=purple, Legendary=yellow
- Each has 2px border, 1px 1px 0px black box-shadow
- Condition shown as small icon badge with white bg + black border

### Stat Bars
- Thicker bars (h-2.5 instead of h-1)
- White/light gray (#F3F4F6) background with 1px solid black border
- Stat labels in bold black (font-black)
- Stat values in bold black
- Colored fill bars with `stat-bar-fill` animation

### Exclusive Badge
- Legendary tazos get `exclusive-badge` class (rotated red badge in top-right corner)

## Preserved
- Same TazoCardProps interface
- Same Tazo type imports from `@/lib/game/types`
- Same onClick handler and keyboard navigation
- Same STAT_CONFIG and RARITY_ORDER logic

## Lint: Clean (no errors)
