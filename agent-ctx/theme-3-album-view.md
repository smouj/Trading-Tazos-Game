# Theme-3: Album View Magazine Style Overhaul

## Task ID: theme-3
## Agent: album-view-developer
## Status: COMPLETED

## Summary
Rewrote `/home/z/my-project/src/components/game/album-view.tsx` with a vibrant 90s-2000s magazine style (Nintendo Power, Pokémon Official Magazine).

## Changes Made

### 1. Stats Summary Bar → Magazine Banner Strip
- Yellow background (`mag-card-yellow`) with thick black border bottom
- "62 TAZOS" in bold black, "28 OWNED" in red (#E3350D), "45% COMPLETE" in blue (#3B4CCA)
- Progress bar styled like a magazine subscription card with diagonal stripe fill pattern
- Mini percentage text overlaid on progress bar
- Grid toggle buttons use `mag-btn` style with red active state / white inactive state

### 2. Search Bar
- White background with thick 3px black border + offset box-shadow (mag-card style)
- Bold placeholder text "🔍 SEARCH YOUR COLLECTION..."
- Larger search icon in black
- `rounded-none` for sharp magazine edges

### 3. Franchise Filter Chips
- Thick black borders (3px when active, 2px inactive) with offset box-shadow when active
- Pokémon: yellow (#FFCC00) background, black text when active
- Digimon: blue (#00A1E9) background, white text when active
- DBZ: orange (#FF6B00) background, black text when active
- Inactive: white background, black text, thinner border, no shadow
- ALL chip: black background with white text when active

### 4. Filter Dropdowns (Rarity, Condition, Status, Sort)
- White background with 3px solid black border + offset box-shadow
- Bold uppercase text
- Custom inline styles to override default Select component styling
- Sharp corners (`rounded-none`) for magazine feel
- Sort toggle button uses `mag-btn` style with ArrowUpDown icon + A→Z/Z→A label

### 5. Tazos Grid
- Cream/white background (#fffef0) with `mag-dots` subtle dot texture
- 2px solid black border around the grid container
- Light, paper-like feel instead of dark

### 6. Loading Skeletons
- Yellow-tinted cards (#fff9d6) with 3px black borders + offset shadow
- Yellow-tinted skeleton elements (rgba(255, 204, 0, 0.3))
- Sharp corners matching magazine aesthetic

### 7. Empty State
- Large star icon in yellow with black drop shadow
- "NO TAZOS FOUND!" in bold red (#E3350D) with black text stroke
- Uppercase with letter-spacing for magazine headline feel
- `mag-dots` texture on cream background
- Secondary text in muted black

## Preserved Functionality
- All fetch logic (franchises, tazos with filters)
- Search with debounce
- All filter states (franchise, rarity, condition, owned status, sort)
- Grid size toggle (compact/normal)
- Tazo detail modal with toggle-owned
- Stats calculation (owned count, completion percentage)

## Dependencies
- Uses CSS classes from `globals.css`: mag-card-yellow, mag-btn, mag-card, mag-dots, mag-stroke-sm, stat-bar-fill
- Uses existing components: TazoCard, TazoDetailModal, Input, Select, Skeleton
