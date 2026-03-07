#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MANIFEST="${ROOT_DIR}/docs/theme-token-migration.csv"

tmp_expected="$(mktemp)"
tmp_manifest_paths="$(mktemp)"
tmp_missing="$(mktemp)"
tmp_manifest_source="$(mktemp)"
trap 'rm -f "${tmp_expected}" "${tmp_manifest_paths}" "${tmp_missing}" "${tmp_manifest_source}"' EXIT

manifest_source="${MANIFEST}"

if [[ ! -f "${MANIFEST}" ]]; then
  {
    echo "path,module,phase,status,notes"
    (
      cd "${ROOT_DIR}"
      {
        find apps/web/app -type f -name "*.tsx"
        find apps/web/components -type f -name "*.tsx"
        find apps/web/lib -type f \( -name "*theme*.ts" -o -name "*theme*.tsx" \)
        echo "apps/web/app/globals.css"
        echo "apps/web/tailwind.config.ts"
        if [[ -d packages/shared-theme/src ]]; then
          find packages/shared-theme/src -type f
        fi
      } | sed "s|^\./||" | sort -u | awk -F, '{ print $0 ",snowui,snowui,DN,Synthesized inventory" }'
    )
  } > "${tmp_manifest_source}"

  manifest_source="${tmp_manifest_source}"
fi

(
  cd "${ROOT_DIR}"
  {
    find apps/web/app -type f -name "*.tsx"
    find apps/web/components -type f -name "*.tsx"
    find apps/web/lib -type f \( -name "*theme*.ts" -o -name "*theme*.tsx" \)
    echo "apps/web/app/globals.css"
    echo "apps/web/tailwind.config.ts"
    if [[ -d packages/shared-theme/src ]]; then
      find packages/shared-theme/src -type f
    fi
  } | sed "s|^\./||" | sort -u
) > "${tmp_expected}"

tail -n +2 "${manifest_source}" | cut -d, -f1 | sort -u > "${tmp_manifest_paths}"

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
' "${manifest_source}"

echo "Theme token migration manifest verification passed."
