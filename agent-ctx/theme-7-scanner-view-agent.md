# Task: theme-7 — ScannerView Magazine Style Rewrite

## Summary
Rewrote `/home/z/my-project/src/components/game/scanner-view.tsx` with a vibrant 90s-2000s magazine style (Nintendo Power / Pokémon Official Magazine aesthetic).

## Changes Made

### Header
- **Big bold "TAZO SCANNER"** with `mag-stroke` class for thick stroke text
- **Blue background strip** using `mag-card-blue` with "⚡ SCAN YOUR REAL TAZOS! ⚡" subtitle
- Camera icon in a yellow circle with thick black border and shadow
- Reset button uses `mag-btn` style

### Step Indicators
- Redesigned as "HOW IT WORKS" section with `mag-stroke-sm` label
- 3 steps (UPLOAD → SCAN → SAVE) in magazine-style bordered boxes
- Active step: yellow background with black border and shadow
- Completed step: green background with checkmark
- Inactive: gray with muted styling

### Upload Area
- **Big dashed border box** with `mag-dots` texture and `mag-card-yellow` for yellow tint
- Bold "DROP YOUR TAZO PHOTO HERE!" using `mag-stroke-sm`
- Speech bubble callout with pro tip
- 3 "HOW IT WORKS" detail boxes below (Upload/Scan/Save) in `mag-card` style

### Detection Section
- **White card with thick black border** (`mag-card`)
- Black header bar with green scan icon and "🔍 DETECTION VIEW" text
- Dimension badge uses `exclusive-badge` class
- **Green scan line** (changed from cyan) - `rgba(34, 197, 94, 0.6)`
- **Thick black circles** around detected tazos with green inner ring
- Excluded regions: thick black outline with red inner ring and X mark
- Region list in `mag-card-red` with thick borders and magazine-style toggle buttons

### Extraction Section
- Each tazo in `mag-card` with `mag-stripes` on the preview section
- Preview: circular image with 4px black border and shadow, numbered badge, rarity badge
- **Inline form**: white background, `border-3 border-black` on all inputs with `shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`
- Labels: uppercase, font-black, tracking-wide
- **SAVE buttons**: `mag-btn` style (yellow, thick border, shadow)

### Empty State
- Green circle checkmark with `mag-card` styling
- `mag-stroke-sm` for "ALL TAZOS SAVED!" text
- "SCAN MORE!" button in `mag-btn` yellow style

## CSS Classes Used
- `mag-bg`, `mag-card`, `mag-card-yellow`, `mag-card-red`, `mag-card-blue`
- `mag-btn`, `mag-stroke`, `mag-stroke-sm`
- `mag-stripes`, `mag-dots`, `speech-bubble`, `exclusive-badge`

## Compilation Status
✅ No errors — compiled successfully
