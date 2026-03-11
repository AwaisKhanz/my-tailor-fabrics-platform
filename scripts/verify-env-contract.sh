#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-$(pwd)}"
cd "$ROOT"

API_ENV_EXAMPLE="apps/api/.env.example"
API_ENV_PRODUCTION_EXAMPLE="apps/api/.env.production.example"
WEB_ENV_EXAMPLE="apps/web/.env.example"
WEB_ENV_PRODUCTION_EXAMPLE="apps/web/.env.production.example"

required_files=(
  "$API_ENV_EXAMPLE"
  "apps/api/.env.local.example"
  "$API_ENV_PRODUCTION_EXAMPLE"
  "$WEB_ENV_EXAMPLE"
  "apps/web/.env.local.example"
  "$WEB_ENV_PRODUCTION_EXAMPLE"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "Missing required env template: $file"
    exit 1
  fi
done

runtime_env_files=(
  "apps/api/.env"
  "apps/api/.env.local"
  "apps/api/.env.production"
  "apps/web/.env"
  "apps/web/.env.local"
  "apps/web/.env.production"
)

for file in "${runtime_env_files[@]}"; do
  if [[ ! -e "$file" ]]; then
    echo "Missing runtime env file: $file"
    echo "Run: pnpm run env:setup"
    exit 1
  fi
  if [[ -L "$file" ]]; then
    echo "Symlink is not allowed for runtime env file: $file"
    echo "Run: pnpm run env:setup"
    exit 1
  fi
done

TMP_API_REQUIRED_KEYS="$(mktemp)"
TMP_WEB_REQUIRED_KEYS="$(mktemp)"
TMP_PRISMA_KEYS="$(mktemp)"
TMP_API_EXAMPLE_KEYS="$(mktemp)"
TMP_API_PROD_EXAMPLE_KEYS="$(mktemp)"
TMP_WEB_EXAMPLE_KEYS="$(mktemp)"
TMP_WEB_PROD_EXAMPLE_KEYS="$(mktemp)"
TMP_MISSING_KEYS="$(mktemp)"
TMP_API_ENV_OFFENDERS="$(mktemp)"
TMP_WEB_ENV_OFFENDERS="$(mktemp)"

trap 'rm -f "$TMP_API_REQUIRED_KEYS" "$TMP_WEB_REQUIRED_KEYS" "$TMP_PRISMA_KEYS" "$TMP_API_EXAMPLE_KEYS" "$TMP_API_PROD_EXAMPLE_KEYS" "$TMP_WEB_EXAMPLE_KEYS" "$TMP_WEB_PROD_EXAMPLE_KEYS" "$TMP_MISSING_KEYS" "$TMP_API_ENV_OFFENDERS" "$TMP_WEB_ENV_OFFENDERS"' EXIT

rg --no-filename 'process\.env\.([A-Z0-9_]+)' \
  apps/api/src/common/env.ts \
  --replace '$1' \
  -o \
  | LC_ALL=C sort -u > "$TMP_API_REQUIRED_KEYS"

rg --no-filename 'process\.env\.([A-Z0-9_]+)' \
  apps/web/lib/env.ts \
  --replace '$1' \
  -o \
  | LC_ALL=C sort -u > "$TMP_WEB_REQUIRED_KEYS"

rg --no-filename 'env\("([A-Z0-9_]+)"\)' \
  apps/api/prisma/schema.prisma \
  --replace '$1' \
  -o \
  | LC_ALL=C sort -u > "$TMP_PRISMA_KEYS"

cat "$TMP_PRISMA_KEYS" >> "$TMP_API_REQUIRED_KEYS"
LC_ALL=C sort -u "$TMP_API_REQUIRED_KEYS" -o "$TMP_API_REQUIRED_KEYS"

awk -F'=' '/^[A-Za-z_][A-Za-z0-9_]*=/{print $1}' "$API_ENV_EXAMPLE" \
  | LC_ALL=C sort -u > "$TMP_API_EXAMPLE_KEYS"
awk -F'=' '/^[A-Za-z_][A-Za-z0-9_]*=/{print $1}' "$API_ENV_PRODUCTION_EXAMPLE" \
  | LC_ALL=C sort -u > "$TMP_API_PROD_EXAMPLE_KEYS"
awk -F'=' '/^[A-Za-z_][A-Za-z0-9_]*=/{print $1}' "$WEB_ENV_EXAMPLE" \
  | LC_ALL=C sort -u > "$TMP_WEB_EXAMPLE_KEYS"
awk -F'=' '/^[A-Za-z_][A-Za-z0-9_]*=/{print $1}' "$WEB_ENV_PRODUCTION_EXAMPLE" \
  | LC_ALL=C sort -u > "$TMP_WEB_PROD_EXAMPLE_KEYS"

comm -23 "$TMP_API_REQUIRED_KEYS" "$TMP_API_EXAMPLE_KEYS" > "$TMP_MISSING_KEYS"
if [[ -s "$TMP_MISSING_KEYS" ]]; then
  echo "$API_ENV_EXAMPLE is missing required keys:"
  cat "$TMP_MISSING_KEYS"
  exit 1
fi

comm -23 "$TMP_API_REQUIRED_KEYS" "$TMP_API_PROD_EXAMPLE_KEYS" > "$TMP_MISSING_KEYS"
if [[ -s "$TMP_MISSING_KEYS" ]]; then
  echo "$API_ENV_PRODUCTION_EXAMPLE is missing required keys:"
  cat "$TMP_MISSING_KEYS"
  exit 1
fi

comm -23 "$TMP_WEB_REQUIRED_KEYS" "$TMP_WEB_EXAMPLE_KEYS" > "$TMP_MISSING_KEYS"
if [[ -s "$TMP_MISSING_KEYS" ]]; then
  echo "$WEB_ENV_EXAMPLE is missing required keys:"
  cat "$TMP_MISSING_KEYS"
  exit 1
fi

comm -23 "$TMP_WEB_REQUIRED_KEYS" "$TMP_WEB_PROD_EXAMPLE_KEYS" > "$TMP_MISSING_KEYS"
if [[ -s "$TMP_MISSING_KEYS" ]]; then
  echo "$WEB_ENV_PRODUCTION_EXAMPLE is missing required keys:"
  cat "$TMP_MISSING_KEYS"
  exit 1
fi

rg -l 'process\.env\.' apps/api/src \
  --glob '!apps/api/src/common/env.ts' > "$TMP_API_ENV_OFFENDERS" || true
if [[ -s "$TMP_API_ENV_OFFENDERS" ]]; then
  echo "Found direct process.env usage outside apps/api/src/common/env.ts:"
  cat "$TMP_API_ENV_OFFENDERS"
  exit 1
fi

rg -l 'process\.env\.' apps/web \
  --glob '!apps/web/lib/env.ts' \
  --glob '!apps/web/.next/**' \
  --glob '!apps/web/node_modules/**' > "$TMP_WEB_ENV_OFFENDERS" || true
if [[ -s "$TMP_WEB_ENV_OFFENDERS" ]]; then
  echo "Found direct process.env usage outside apps/web/lib/env.ts:"
  cat "$TMP_WEB_ENV_OFFENDERS"
  exit 1
fi

echo "Environment contract verification passed"
