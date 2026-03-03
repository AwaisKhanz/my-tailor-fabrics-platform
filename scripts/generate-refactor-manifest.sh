#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-$(pwd)}"
cd "$ROOT"

OUT="docs/refactor-manifest.csv"
mkdir -p docs

TMP_ALL="$(mktemp)"
TMP_EXISTING="$(mktemp)"
trap 'rm -f "$TMP_ALL" "$TMP_EXISTING"' EXIT

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
} | awk 'NF' | LC_ALL=C sort -u > "$TMP_ALL"

# Preserve existing status/owner/notes if manifest already exists.
if [[ -f "$OUT" ]]; then
  awk -F',' 'NR>1 { print $1 "," $4 "," $5 "," $6 }' "$OUT" > "$TMP_EXISTING"
fi

printf 'path,module,phase,status,owner,notes\n' > "$OUT"

while IFS= read -r path; do
  module="cross-cutting"
  phase="8"
  status="NS"
  owner="unassigned"
  notes=""

  case "$path" in
    *.spec.ts|apps/api/test/*)
      module="testing"
      phase="9"
      ;;
  esac

  case "$path" in
    packages/shared-types/src/*|packages/shared-constants/src/*|apps/web/types/*|apps/web/lib/api/*)
      module="shared-contracts"
      phase="3"
      ;;
    apps/web/components/ui/*|apps/web/components/common/*|apps/web/components/ThemeProvider.tsx|apps/web/app/globals.css|apps/web/tailwind.config.ts)
      module="design-system"
      phase="4"
      ;;
    apps/web/app/api/status/*|apps/web/app/status/*|apps/web/components/status/*|apps/web/hooks/use-public-order-status-page.ts|apps/api/src/reports/*|apps/api/src/mail/*)
      module="reporting-public-status"
      phase="7"
      ;;
    apps/web/middleware.ts|apps/web/app/api/auth/*|apps/web/lib/api.ts|apps/web/components/AuthProvider.tsx|apps/web/types/next-auth.d.ts|apps/api/src/auth/*|apps/api/src/main.ts|apps/web/package.json|apps/api/package.json|package.json)
      module="security-env"
      phase="1"
      ;;
    apps/web/components/layout/Sidebar.tsx|apps/web/components/layout/Topbar.tsx|apps/web/components/layout/BranchSelector.tsx|apps/web/store/useBranchStore.ts|apps/api/src/common/guards/*|apps/api/src/common/decorators/auth.decorators.ts|apps/api/src/common/interfaces/request.interface.ts)
      module="auth-rbac"
      phase="2"
      ;;
    apps/api/src/orders/*|apps/api/src/config/*|apps/api/src/tasks/*|apps/api/src/payments/*|apps/api/src/ledger/*|apps/api/src/customers/*|apps/api/src/employees/*|apps/api/src/expenses/*|apps/api/src/rates/*|apps/api/src/branches/*|apps/api/src/attendance/*|apps/api/src/search/*|apps/api/src/users/*)
      module="backend-domains"
      phase="6"
      ;;
    apps/web/app/\(dashboard\)/*|apps/web/app/login/page.tsx|apps/web/app/unauthorized/page.tsx|apps/web/components/auth/*|apps/web/components/config/*|apps/web/components/customers/*|apps/web/components/dashboard/*|apps/web/components/employees/*|apps/web/components/expenses/*|apps/web/components/orders/*|apps/web/components/payments/*|apps/web/components/rates/*|apps/web/components/reports/*|apps/web/components/design-types/*|apps/web/hooks/*)
      module="web-domains"
      phase="5"
      ;;
    apps/api/src/common/interceptors/*|apps/api/src/common/filters/*|apps/api/src/app.module.ts|apps/web/components/layout/*|apps/web/lib/utils*|apps/web/components.json)
      module="optimization-dx"
      phase="8"
      ;;
  esac

  if [[ -s "$TMP_EXISTING" ]]; then
    previous="$(awk -F',' -v p="$path" '$1 == p { print $2 "," $3 "," $4; exit }' "$TMP_EXISTING")"
    if [[ -n "$previous" ]]; then
      IFS=',' read -r status owner notes <<EOF
$previous
EOF
    fi
  fi

  printf '%s,%s,%s,%s,%s,%s\n' "$path" "$module" "$phase" "$status" "$owner" "$notes" >> "$OUT"
done < "$TMP_ALL"

echo "Wrote $OUT"
