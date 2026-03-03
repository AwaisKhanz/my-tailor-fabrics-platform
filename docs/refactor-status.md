# TBMS Refactor Status

Legend: `NS` (Not Started), `IP` (In Progress), `BL` (Blocked), `DN` (Done), `NJ` (No change justified)

## Phase Ledger

| Phase | Status | Notes |
|---|---|---|
| 0 | DN | Manifest generator/verifier and baseline evidence created. |
| 1 | IP | Implemented env helpers and production-safe secret/API URL handling; additional hardening still pending. |
| 2 | IP | Added canonical role groups in shared constants and reused in middleware/sidebar + API controllers; full matrix tests pending. |
| 3 | IP | Expanded canonical shared contracts and moved remaining workflow/rate seed constants to shared constants, replacing local duplicate definitions in consumers. |
| 4 | IP | Added missing global tokens and new typography/page-header primitives; `data-table` and `empty-state` now consume shared typography primitives. |
| 5 | IP | Expanded frontend consistency refactor across settings/config/customers and decomposed `orders/[id]`, `orders/new`, `orders`, dashboard home, employee detail, expenses, payments, customer detail, garment detail, employees list, reports, my-orders, login, design-types, rates, and unauthorized/auth-state pages into reusable sections backed by dedicated hooks/components with improved UX hierarchy/loading states; decomposed users, branches, customers, garments, measurement categories, measurement detail, and branch hub backing modules (`UsersTable`, `BranchesTable`, `CustomerTable`, `GarmentTypesTable`, `MeasurementCategoriesTable`, `MeasurementCategoryDetail`, `BranchHubConfig`) into dedicated hooks + reusable section components. |
| 6 | IP | Added shared order-money helper and task completion ledger idempotency guard; removed assistant-created temporary test files per request. |
| 7 | IP | Replaced unsafe SQL and added backend `/status/:token` endpoint; public status frontend page now decomposed to reusable sections; end-to-end tests pending. |
| 8 | IP | Removed stray debug logs, reduced full-reload usage in branch switching path, and centralized frontend development-only error logging. |
| 9 | IP | Added manifest workflow hardening and stabilized API unit suites with dependency-safe spec scaffolding + domain calculation/idempotency + customer/public-status contract tests; full matrix still pending. |

## Tracking Artifacts

- Manifest: `docs/refactor-manifest.csv`
- Manifest generator: `scripts/generate-refactor-manifest.sh`
- Manifest verifier: `scripts/verify-refactor-manifest.sh`
- Baseline report: `docs/refactor-baseline.md`
- Edit log: `docs/refactor-edit-log.md`
- Page decomposition tracker: `docs/frontend-page-decomposition-tracker.md`

## Verification

```bash
./scripts/generate-refactor-manifest.sh
./scripts/verify-refactor-manifest.sh
```

## Current Checkpoint (After Twenty-sixth Implementation Pass)

- `./scripts/verify-refactor-manifest.sh`: pass
- `npm run lint -w web`: pass
- `npm run build -w api`: not rerun in this pass (frontend-only changes)
- `npm run test -w api -- --runInBand`: intentionally not run in this pass (per request to avoid test work)
- `npm run build -w @tbms/shared-types`: not rerun in this pass (no shared-type code change)
- `npm run build -w @tbms/shared-constants`: not rerun in this pass (no shared-constants code change)
- `npx tsc -p apps/web/tsconfig.json --noEmit`: pass (resolved prior `apps/web/components/ui/typography.tsx` and `apps/web/middleware.ts` type issues)
- `npm run build -w web`: blocked in this environment (`ENOTFOUND fonts.googleapis.com` for `next/font`)

## Manifest Progress Snapshot

| Phase | DN | NS | IP | NJ | BL |
|---|---:|---:|---:|---:|---:|
| 1 | 11 | 5 | 0 | 0 | 0 |
| 2 | 3 | 6 | 0 | 0 | 0 |
| 3 | 18 | 35 | 0 | 0 | 0 |
| 4 | 6 | 28 | 0 | 0 | 0 |
| 5 | 150 | 18 | 0 | 0 | 0 |
| 6 | 28 | 39 | 0 | 0 | 0 |
| 7 | 11 | 4 | 0 | 0 | 0 |
| 8 | 4 | 21 | 0 | 0 | 0 |
| 9 | 0 | 2 | 0 | 0 | 0 |
