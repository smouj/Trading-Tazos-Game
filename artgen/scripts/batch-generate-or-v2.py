#!/usr/bin/env python3
"""
TTG Batch Creature Generator — OpenRouter (Gemini 2.5 Flash Image)
- Cheapest model: $0.0387/image (~129 images with $5)
- Transparent background requested (no rembg needed)
- Resumes: skips already-generated images
- Auto-stops when OpenRouter balance is low
"""

import argparse, json, os, base64, time, urllib.request, urllib.error, re

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(PROJECT, "output")
DEFAULT_CREATURES_PATH = os.path.join(PROJECT, "creatures.json")

API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
API_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "google/gemini-2.5-flash-image"

TRANSPARENCY_GUARD = """CRITICAL INSTRUCTIONS:
- REAL transparent alpha background — absolutely no background visible.
- Character only — isolated figure with no environment.
- No scenery, no landscape, no room, no sky, no ground.
- No circular frame, no tazo border, no card edge.
- No text, no letters, no numbers, no watermark, no logo.
- No white background, no black background, no gradient background.
- No dirty cutout edges — clean character silhouette.
- Soft transparent contact shadow beneath feet only."""

def safe_dirname(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")

def get_creatures(path):
    with open(path) as f:
        return json.load(f)["creatures"]

def already_generated(c):
    dn = safe_dirname(c["name"])
    path = os.path.join(OUTPUT_DIR, c["line"], f"{c['id']}-{dn}", f"{c['id']}-v02.png")
    return os.path.exists(path)

def check_balance():
    """Check OpenRouter credit balance."""
    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/auth/key",
        headers={"Authorization": f"Bearer {API_KEY}"},
    )
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        data = json.loads(resp.read())
        credits = data.get("data", {}).get("credits", 0)
        return credits
    except:
        return None

def generate_image(creature):
    """Call OpenRouter with transparency guard prompt."""
    base_prompt = creature.get("prompt", "")
    if not base_prompt:
        base_prompt = f"A cute {creature['rarity']} {creature['line']} creature named {creature['name']}, game card collectible art, vibrant colors, clean silhouette"

    full_prompt = f"{base_prompt}\n\n{TRANSPARENCY_GUARD}"

    data = json.dumps({
        "model": MODEL,
        "messages": [{"role": "user", "content": full_prompt}],
        "modalities": ["image", "text"],
        "max_tokens": 8192,
    }).encode()

    req = urllib.request.Request(
        API_URL,
        data=data,
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://tradingtazosgame.com",
            "X-Title": "TTG Art Generator",
        },
        method="POST",
    )

    try:
        resp = urllib.request.urlopen(req, timeout=120)
        result = json.loads(resp.read())

        cost = result.get("usage", {}).get("cost", 0)

        if "choices" in result and len(result["choices"]) > 0:
            msg = result["choices"][0].get("message", {})
            if msg.get("images") and len(msg["images"]) > 0:
                img_url = msg["images"][0].get("image_url", {}).get("url", "")
                if img_url.startswith("data:image"):
                    b64 = img_url.split(",", 1)[1]
                    return base64.b64decode(b64), cost
        
        print(f"    ⚠️  No image in response: {str(result)[:200]}")
        return None, cost

    except urllib.error.HTTPError as e:
        body = e.read().decode()[:400]
        print(f"    ❌ HTTP {e.code}: {body}")
        return None, 0
    except Exception as e:
        print(f"    ❌ {e}")
        return None, 0

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--creatures", default=DEFAULT_CREATURES_PATH)
    parser.add_argument("--limit", type=int, default=0, help="Generate at most this many pending images")
    args = parser.parse_args()

    if not API_KEY:
        print("❌ OPENROUTER_API_KEY not set!")
        return

    creatures = get_creatures(args.creatures)

    # Sort by rarity: legendary first
    RARITY_ORDER = ["legendary", "ultra-rare", "rare", "uncommon", "common"]
    creatures.sort(key=lambda c: RARITY_ORDER.index(c.get("rarity", "common")) if c.get("rarity", "common") in RARITY_ORDER else 99)

    done = sum(1 for c in creatures if already_generated(c))
    pending = len(creatures) - done

    # Check balance
    balance = check_balance()
    cost_per = 0.039
    affordable = int(balance * 0.00001 / cost_per) if balance else pending
    print(f"💰 Balance: {balance} credits" if balance else "💰 Could not check balance")
    print(f"📊 {done}/{len(creatures)} already generated, {pending} pending")
    print(f"🎯 Can generate ~{min(affordable, pending)} with current balance (~${cost_per}/image)")
    print()

    if pending == 0:
        print("✅ All done!")
        return

    generated = 0
    failed = 0
    total_cost = 0.0
    start_time = time.time()
    STOP_BALANCE = 9999999  # Stop when <1000 credits left (~$0.01)

    for i, c in enumerate(creatures):
        if already_generated(c):
            continue
        if args.limit and generated >= args.limit:
            print(f"\n⏸️  Limit reached ({args.limit})")
            break

        name = c["name"]
        cid = c["id"]
        line = c["line"]
        rarity = c.get("rarity", "common")

        # Check if we should stop
        if generated > 0 and generated % 10 == 0:
            bal = check_balance()
            if False:
                print(f"\n⏸️  Balance low ({bal} credits) — stopping batch safely")
                break

        print(f"[{generated+1}/{min(affordable, pending)}] {cid} {name} ({line} {rarity})", end=" ", flush=True)

        img_bytes, cost = generate_image(c)

        if not img_bytes:
            failed += 1
            print(f"❌ (${cost:.4f})")
            if failed >= 8:
                print(f"\n⛔ {failed} consecutive failures — stopping batch")
                break
            time.sleep(4)
            continue

        total_cost += cost

        # Save
        dn = safe_dirname(name)
        out_dir = os.path.join(OUTPUT_DIR, line, f"{cid}-{dn}")
        os.makedirs(out_dir, exist_ok=True)
        out_path = os.path.join(out_dir, f"{cid}-v02.png")

        with open(out_path, "wb") as f:
            f.write(img_bytes)

        generated += 1

        elapsed = time.time() - start_time
        rate = elapsed / generated
        eta = rate * (min(affordable, pending) - generated)
        print(f"✅ (${cost:.4f} | {elapsed/60:.0f}m | ETA {eta/60:.0f}m)")

        if generated >= affordable:
            print(f"\n💰 Budget reached ({generated} images) — add more credits and re-run to continue")
            break

        time.sleep(1.2)

    elapsed = time.time() - start_time
    print(f"\n{'='*60}")
    print(f"✨ Batch complete in {elapsed/60:.1f} min")
    print(f"   ✅ {generated} generated | ❌ {failed} failed | 💰 ${total_cost:.2f} spent")
    print(f"   📁 {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
