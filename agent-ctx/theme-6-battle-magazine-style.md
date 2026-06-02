# Task theme-6: Battle View Magazine Style Overhaul

## Summary
Rewrote three battle-related components with vibrant 90s-2000s magazine style (Nintendo Power, Pokémon Official Magazine).

## Files Modified

### 1. `/home/z/my-project/src/components/game/battle-view.tsx`
**Complete theme overhaul:**

- **Select Phase header**: "BATTLE ARENA!" in huge bold stroke text (red with black outline using `mag-stroke-red`), yellow background strip behind it with skew effect, italic subtitle "Choose your team and FIGHT!"
- **Team selection area**: Yellow banner (`bg-yellow-300`) with thick black border (`border-4 border-black`) and offset shadow (`shadow-[4px_4px_0_0_#000]`). Selected tazos as white mini cards with thick borders. Empty slots as dashed boxes with "+" 
- **Difficulty buttons**: Magazine sticker style with thick black borders, colored backgrounds (Easy=green, Medium=yellow, Hard=red), offset shadows, and scale effect on active
- **Tazo grid**: White background container with `mag-dots` texture, thick black border and offset shadow
- **Battle Phase**: Magazine-style yellow header bar (`bg-yellow-400 border-b-4 border-black`), speed controls using `mag-btn` style, battle log with white background and comic-style colored entries (red for KOs, yellow for type advantage, etc.)
- **Result Phase**: VICTORY/DEFEAT in ENORMOUS stroke text (yellow for victory using `mag-stroke`, red for defeat using `mag-stroke-red`), confetti-like background (diagonal stripes via `mag-stripes` or dots via `mag-dots`), team summaries in blue/red magazine cards, battle highlights in yellow-bordered box
- All buttons converted to magazine sticker style with offset shadows

### 2. `/home/z/my-project/src/components/game/battle-select-card.tsx`
**Magazine style cards:**

- White background with thick black border (`border-3 border-black`)
- Offset shadow (`shadow-[2px_2px_0_0_#000]`)
- Selected state: yellow background (`bg-yellow-300`) with larger offset shadow and red checkmark
- Name in bold black text (`font-black text-black`)
- Franchise color dot with black border
- Stat bars with black-bordered containers
- Hover effects with scale and shadow changes

### 3. `/home/z/my-project/src/components/game/battle-canvas.tsx`
**Lighter cream/magazine canvas tones:**

- Background: Changed from dark (#1a1a2e) to warm cream gradient (#FFF8E7 → #F5E6C8 → #E8D5A8)
- Added magazine dots texture in background
- Arena floor: Lighter cream/tan gradient (#FFF5D6 → #F5E6C8 → #E8D5A8)
- Arena border: Thick black (`#000000`) instead of purple
- Side labels: "PLAYER" in blue (#2563EB) with black outline, "OPPONENT" in red (#DC2626) with black outline using `drawStrokedText()` helper
- Disc borders: Thick black (2.5px) for magazine style
- Health bars: White fill with colored HP, black borders
- Name text: Bold colored with black outline strokes
- All animation logic preserved identically

## Key Design Patterns Used
- `mag-stroke-red`, `mag-stroke`, `mag-stroke-white` CSS classes for stroke text effects
- `mag-dots`, `mag-stripes` for texture backgrounds
- `mag-spinner` for loading states
- Offset shadows: `shadow-[Npx_Npx_0_0_#000]` for comic/magazine sticker look
- Thick borders: `border-3 border-black` or `border-4 border-black`
- Skew transforms for dynamic yellow strips
- `drawStrokedText()` helper function in canvas for bold outlined text

## Lint Status
✅ Passes `bun run lint` cleanly with no errors
