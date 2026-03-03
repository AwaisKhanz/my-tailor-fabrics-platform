#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-$(pwd)}"
cd "$ROOT"

MANIFEST="docs/refactor-manifest.csv"

if [[ ! -f "$MANIFEST" ]]; then
  echo "Missing $MANIFEST"
  exit 1
fi

TMP_EXPECTED="$(mktemp)"
TMP_MANIFEST="$(mktemp)"
TMP_MISSING="$(mktemp)"
trap 'rm -f "$TMP_EXPECTED" "$TMP_MANIFEST" "$TMP_MISSING"' EXIT

{
  find apps/web/app -type f
  find apps/web/components -type f
  find apps/web/hooks -type f
  find apps/web/lib -type f
  find apps/web/store -type f
  find apps/web/types -type f
  find apps/api/src -type f
  find packages/shared-types/src -type f
  find packages/shared-constants/src -type f
  printf '%s\n' \
    apps/web/middleware.ts \
    apps/web/tailwind.config.ts \
    apps/web/components.json \
    apps/web/package.json \
    apps/api/package.json \
    package.json
} | awk 'NF' | LC_ALL=C sort -u > "$TMP_EXPECTED"

# Extract first CSV column, skip header
awk -F',' 'NR>1 { print $1 }' "$MANIFEST" | LC_ALL=C sort -u > "$TMP_MANIFEST"

comm -23 "$TMP_EXPECTED" "$TMP_MANIFEST" > "$TMP_MISSING"

if [[ -s "$TMP_MISSING" ]]; then
  echo "Manifest is missing files:"
  cat "$TMP_MISSING"
  exit 1
fi

# Validate status values
BAD_STATUS_COUNT=$(awk -F',' 'NR>1 { if ($4 != "NS" && $4 != "IP" && $4 != "BL" && $4 != "DN" && $4 != "NJ") bad++ } END { print bad+0 }' "$MANIFEST")
if [[ "$BAD_STATUS_COUNT" != "0" ]]; then
  echo "Manifest has invalid status values"
  exit 1
fi

# NJ requires a reason in notes column.
BAD_NJ_NOTES_COUNT=$(awk -F',' 'NR>1 { if ($4 == "NJ" && $6 == "") bad++ } END { print bad+0 }' "$MANIFEST")
if [[ "$BAD_NJ_NOTES_COUNT" != "0" ]]; then
  echo "Manifest has NJ rows without notes"
  exit 1
fi

echo "Manifest verification passed"
