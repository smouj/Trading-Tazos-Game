#!/usr/bin/env python3
"""
Process generated creature images for TTG:
- Removes background (fuchsia or any solid bg) using rembg
- OR chroma-keys fuchsia (#FF00FF) background
- Saves as proper PNG with alpha channel to tazo-creatures/{franchise}/
- Also saves a local copy for verification
"""
import sys, os
from pathlib import Path
from PIL import Image

OUT_DIR = Path(os.path.expanduser("~/.openclaw/workspace/Trading-Tazos-Game/scripts/tazo-creatures"))

def remove_bg_rembg(input_path, output_path):
    """Use rembg (AI background removal) to get transparent creature."""
    from rembg import remove
    with open(input_path, "rb") as f:
        img_data = f.read()
    result = remove(img_data)
    with open(output_path, "wb") as f:
        f.write(result)
    # Verify
    img = Image.open(output_path).convert("RGBA")
    alpha = img.getchannel("A")
    transparent_pct = sum(1 for y in range(img.height) for x in range(0, img.width, 5) 
                         if img.getpixel((x, y))[3] == 0) / (img.height/5 * img.width/5) * 100
    print(f"  rembg: {output_path} ({img.width}x{img.height}, {transparent_pct:.0f}% transparent)")
    return transparent_pct > 10

def remove_bg_fuchsia(input_path, output_path):
    """Chroma-key fuchsia (#FF00FF) background."""
    img = Image.open(input_path).convert("RGBA")
    pixels = img.load()
    w, h = img.size
    
    # Create alpha channel: make fuchsia pixels transparent
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            # Check if pixel is fuchsia or near-fuchsia
            if r > 200 and b > 200 and g < 80:
                pixels[x, y] = (r, g, b, 0)
            # Also handle anti-aliased edges (pinkish)
            elif r > 180 and b > 180 and g < 120:
                dist = min(r, b) - g
                new_alpha = int(255 * (1 - dist / 255))
                pixels[x, y] = (r, g, b, max(0, min(255, a - new_alpha)))
    
    img.save(output_path, "PNG", optimize=True)
    transparent_pct = sum(1 for y in range(h) for x in range(0, w, 5) 
                         if img.getpixel((x, y))[3] == 0) / (h/5 * w/5) * 100
    print(f"  fuchsia-key: {output_path} ({w}x{h}, {transparent_pct:.0f}% transparent)")
    return transparent_pct > 10

def has_real_transparency(img_path):
    """Check if image has actual alpha channel with varied transparency."""
    img = Image.open(img_path)
    if img.mode != "RGBA":
        return False
    # Count unique alpha values (not just 255 everywhere)
    alphas = set()
    for y in range(0, img.height, 10):
        for x in range(0, img.width, 10):
            alphas.add(img.getpixel((x, y))[3])
    # Real transparency has varied alpha values
    has_varied = len(alphas) > 5
    has_any_zero = 0 in alphas
    return has_varied and has_any_zero

def process_creature(input_path, franchise, slug):
    """Main pipeline: take generated image → produce clean creature PNG."""
    out_dir = OUT_DIR / franchise
    out_dir.mkdir(parents=True, exist_ok=True)
    output_path = out_dir / f"{slug}.png"
    
    print(f"Processing: {slug} ({franchise})")
    print(f"  Input: {input_path}")
    
    # Check input
    if input_path.lower().endswith('.jpg') or input_path.lower().endswith('.jpeg'):
        # JPEG has no alpha, use rembg
        print("  Input is JPEG → using rembg")
        return remove_bg_rembg(input_path, str(output_path))
    
    # Check if already has transparency
    if has_real_transparency(input_path):
        print("  ✅ Already has real transparency → copy directly")
        img = Image.open(input_path).convert("RGBA")
        img.save(str(output_path), "PNG", optimize=True)
        return True
    
    # Try rembg
    print("  No transparency → trying rembg...")
    success = remove_bg_rembg(input_path, str(output_path))
    if success:
        return True
    
    # Fallback: fuchsia key
    print("  rembg didn't work → trying fuchsia chroma-key...")
    return remove_bg_fuchsia(input_path, str(output_path))


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: process-creature.py <input_file> <franchise> <slug>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    franchise = sys.argv[2]
    slug = sys.argv[3]
    
    ok = process_creature(input_file, franchise, slug)
    print(f"\n{'✅ DONE' if ok else '❌ FAILED'} — {franchise}/{slug}.png")
    sys.exit(0 if ok else 1)
