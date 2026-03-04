#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-$(pwd)}"
cd "$ROOT"

FAILED=0

check_forbidden_pattern() {
  local description="$1"
  local pattern="$2"
  shift 2
  local search_paths=("$@")

  if rg -n "$pattern" "${search_paths[@]}"; then
    echo ""
    echo "Guardrail failed: ${description}"
    FAILED=1
  fi
}

check_forbidden_pattern \
  "unsafe raw SQL helpers are not allowed in backend runtime code" \
  '\$queryRawUnsafe|\$executeRawUnsafe|queryRawUnsafe|executeRawUnsafe|Prisma\.raw\(' \
  apps/api/src

check_forbidden_pattern \
  "console.* usage is not allowed in backend runtime code (use Nest Logger)" \
  '\bconsole\.(log|error|warn|info|debug)\b' \
  apps/api/src

check_forbidden_pattern \
  "redundant class-level Jwt/Roles/Branch guard decorators are not allowed (global guards enforce this policy)" \
  '@UseGuards\(JwtAuthGuard, RolesGuard(, BranchGuard)?\)' \
  apps/api/src

check_forbidden_pattern \
  "dev-only secret placeholders must stay isolated to common env helper" \
  'dev-only-' \
  apps/api/src \
  --glob '!apps/api/src/common/env.ts'

check_forbidden_pattern \
  "direct process.env access is not allowed outside common env helper" \
  'process\.env\.' \
  apps/api/src \
  --glob '!apps/api/src/common/env.ts'

if [[ "$FAILED" -ne 0 ]]; then
  echo ""
  echo "Backend security guardrails failed"
  exit 1
fi

echo "Backend security guardrails passed"
