# TTG Season 1 Pipeline

Canonical source: the attached Season 1 lore bible markdown.

## Build canonical data

```bash
python3 scripts/season1/build-season1.py
```

Outputs:

- `scripts/season1/season1-tazos.json`
- `artgen/creatures.season1.json`

## Register in DB

```bash
node scripts/season1/register-season1.js
```

This creates/updates the 150 Season 1 tazos as `pending_review`. It does not publish unfinished art.

## Generate creature art

OpenRouter batch, when `OPENROUTER_API_KEY` is available:

```bash
python3 artgen/scripts/batch-generate-or-v2.py \
  --creatures artgen/creatures.season1.json \
  --limit 10
```

Run in small batches, review quality, then continue. Generated raw images go under `artgen/output/`.

## Composite final tazos

After transparent creature art exists in `artgen/nobg/` or `scripts/tazo-creatures/{franchise}/{slug}.png`:

```bash
python3 scripts/season1/composite-season1.py
```

This writes:

- `public/tazos-generated/{franchise}/{slug}.png`
- `public/tazos-generated/{franchise}/back/{slug}-back.png`

To publish only tazos with verified front art:

```bash
node scripts/season1/register-season1.js --publish-ready
# or
python3 scripts/season1/composite-season1.py --publish-ready
```

Keep anything without final creature art as `pending_review`.
