#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MANIFEST="${ROOT_DIR}/docs/theme-token-migration.csv"

if [[ ! -f "${MANIFEST}" ]]; then
  echo "Missing manifest: ${MANIFEST}" >&2
  exit 1
fi

tmp_expected="$(mktemp)"
tmp_manifest_paths="$(mktemp)"
tmp_missing="$(mktemp)"
trap 'rm -f "${tmp_expected}" "${tmp_manifest_paths}" "${tmp_missing}"' EXIT

(
  cd "${ROOT_DIR}"
  {
    find apps/web/app -type f -name "*.tsx"
    find apps/web/components -type f -name "*.tsx"
    find apps/web/lib -type f \( -name "*theme*.ts" -o -name "*theme*.tsx" \)
    echo "apps/web/app/globals.css"
    echo "apps/web/tailwind.config.ts"
    find packages/shared-theme/src -type f
  } | sed "s|^\./||" | sort -u
) > "${tmp_expected}"

tail -n +2 "${MANIFEST}" | cut -d, -f1 | sort -u > "${tmp_manifest_paths}"

comm -23 "${tmp_expected}" "${tmp_manifest_paths}" > "${tmp_missing}"
if [[ -s "${tmp_missing}" ]]; then
  echo "Theme token migration manifest is missing file coverage:" >&2
  cat "${tmp_missing}" >&2
  exit 1
fi

awk -F, '
NR == 1 { next }
{
  status=$4
  notes=$5
  if (status != "NS" && status != "IP" && status != "DN" && status != "NJ") {
    printf "Invalid status \"%s\" for %s\n", status, $1 > "/dev/stderr"
    invalid=1
  }
  if (status == "NJ" && notes == "") {
    printf "NJ requires reason in notes for %s\n", $1 > "/dev/stderr"
    invalid=1
  }
}
END { exit invalid }
' "${MANIFEST}"

echo "Theme token migration manifest verification passed."
