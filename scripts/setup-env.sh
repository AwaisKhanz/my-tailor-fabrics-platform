#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-$(pwd)}"
cd "$ROOT"

ensure_regular_env_file() {
  local target_file="$1"
  local example_file="$2"

  if [[ ! -f "$example_file" ]]; then
    echo "Missing template: $example_file"
    exit 1
  fi

  if [[ -L "$target_file" ]]; then
    local temp_file
    temp_file="$(mktemp)"
    cat "$target_file" > "$temp_file" 2>/dev/null || true
    rm "$target_file"

    if [[ -s "$temp_file" ]]; then
      mv "$temp_file" "$target_file"
      echo "Converted symlink to file: $target_file"
    else
      rm -f "$temp_file"
      cp "$example_file" "$target_file"
      echo "Recreated from template: $target_file"
    fi
    return 0
  fi

  if [[ -f "$target_file" ]]; then
    echo "OK: $target_file"
    return 0
  fi

  cp "$example_file" "$target_file"
  echo "Created: $target_file from $example_file"
}

ensure_regular_env_file "apps/api/.env" "apps/api/.env.example"
ensure_regular_env_file "apps/api/.env.local" "apps/api/.env.local.example"
ensure_regular_env_file "apps/api/.env.production" "apps/api/.env.production.example"

ensure_regular_env_file "apps/web/.env" "apps/web/.env.example"
ensure_regular_env_file "apps/web/.env.local" "apps/web/.env.local.example"
ensure_regular_env_file "apps/web/.env.production" "apps/web/.env.production.example"

echo "Environment setup complete"
