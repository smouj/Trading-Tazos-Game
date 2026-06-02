# Task: theme-4 - TazoDetailModal Magazine Style Overhaul

## Summary
Rewrote the `TazoDetailModal` component (`src/components/game/tazo-detail-modal.tsx`) with a vibrant 90s-2000s magazine style (Nintendo Power, Pokémon Official Magazine).

## Changes Made

### File: `src/components/game/tazo-detail-modal.tsx`
Complete rewrite of the modal with magazine-style design:

1. **Dialog overlay**: Custom yellow-tinted dark overlay using CSS `:has()` selector targeting `.mag-detail-modal` class, giving the feel of looking at a magazine page behind another page.

2. **Dialog container**: 
   - White background with 4px solid black border and 8px offset box shadow
   - Zero border-radius for a sharp magazine cut feel
   - Top franchise-colored banner strip with halftone overlay

3. **Top banner**: 
   - Franchise gradient background (yellow→orange for Pokémon, blue→navy for Digimon, orange→brown for DBZ)
   - Collection tag as a small white magazine label
   - HUGE tazo name in white with thick black stroke text (2.5px WebkitTextStroke)
   - Rarity stars with glow effect and colored tags for rarity/condition
   - LEGENDARY exclusive badge when applicable

4. **Large tazo disc (180-220px)**:
   - Thick black border (5px) with heavy shadow (6px offset)
   - Vibrant franchise gradient background
   - Holo/metallic/worn/legendary effects preserved from original
   - 6-7xl initial letter with text shadow
   - Speech bubble below with franchise-specific fun flavor quotes
   - Lock overlay for unowned tazos

5. **Stats section - Magazine Infographic**:
   - Black header bar with yellow "⚡ Power Stats ⚡" text
   - Each stat in colored row with emoji icon, bold label, thick colored bar on white bg with black border
   - Horizontal line texture overlay on bars
   - Total Power in yellow badge with shadow

6. **Skill section**:
   - Yellow (#FFCC00) background strip with black border and shadow
   - Lightning emoji + skill name in bold red stroke text
   - Description in italic below

7. **Evolution/Transform section**:
   - Connected tazo silhouettes (circles) with ArrowRight arrows
   - "POWER UP!" labels on arrows
   - Current tazo highlighted with franchise gradient and star-burst effect
   - Digimon: blue-themed "🔥 DIGIEVOLUTION 🔥" header
   - DBZ: orange-themed "💥 TRANSFORMATION 💥" header

8. **Pokémon Type Advantages**:
   - Yellow header bar with "⚡ TYPE ADVANTAGES ⚡"
   - Green advantage badges with ArrowUpCircle icon and black border

9. **Condition effect**:
   - Diagonal stripe pattern background (mag-stripes)
   - Condition-colored accent

10. **Battle record - Magazine Score Boxes**:
    - Black header bar "⚔ Battle Record ⚔"
    - Three score boxes: Green (Wins), Red (Losses), Yellow (Win %)
    - Each with 3px black border and 3px offset shadow
    - Large bold numbers with text shadow

11. **Action buttons**:
    - Yellow "Mark as Missing/Owned" button (mag-btn style)
    - Red "Close" button (mag-btn style)
    - Both with 3px border, 3px shadow, press effect on active

### File: `src/app/globals.css`
Added CSS for custom overlay tinting:
```css
[data-slot="dialog-portal"]:has(.mag-detail-modal) [data-slot="dialog-overlay"] {
  background: rgba(30, 20, 0, 0.7) !important;
}
```

## Key Design Patterns Used
- Heavy use of inline styles for precise magazine-style borders and shadows
- CSS classes: mag-halftone, mag-dots, mag-card-yellow, mag-btn, speech-bubble, exclusive-badge, star-burst, holo-border, metallic-effect, worn-overlay, legendary-glow, stat-bar-fill, mag-stripes, mag-stroke-sm
- Franchise-aware color theming throughout
- Responsive sizing (sm: breakpoints for larger screens)
