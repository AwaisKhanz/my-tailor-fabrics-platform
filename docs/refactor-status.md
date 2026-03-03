# TBMS Refactor Status

Legend: `NS` (Not Started), `IP` (In Progress), `BL` (Blocked), `DN` (Done), `NJ` (No change justified)

## Phase Ledger

| Phase | Status | Notes |
|---|---|---|
| 0 | DN | Manifest generator/verifier and baseline evidence created. |
| 1 | IP | Implemented env helpers and production-safe secret/API URL handling; additional hardening still pending. |
| 2 | IP | Added canonical role groups in shared constants and reused in middleware/sidebar + API controllers; full matrix tests pending. |
| 3 | IP | Expanded canonical shared contracts and moved remaining workflow/rate seed constants to shared constants, replacing local duplicate definitions in consumers; normalized legacy-vs-paginated payment history typing in web API client; added canonical `OPEN_ORDER_STATUSES` shared constant and replaced local duplicate active-order status list usage in backend branch deletion policy. |
| 4 | IP | Added missing global tokens and new typography/page-header primitives; `data-table` and `empty-state` now consume shared typography primitives. |
| 5 | DN | Expanded frontend consistency refactor across settings/config/customers and decomposed `orders/[id]`, `orders/new`, `orders`, dashboard home, employee detail, expenses, payments, customer detail, garment detail, employees list, reports, my-orders, login, design-types, rates, and unauthorized/auth-state pages into reusable sections backed by dedicated hooks/components with improved UX hierarchy/loading states; decomposed users, branches, customers, garments, measurement categories, measurement detail, branch hub, measurement field dialog, measurement category dialog, employee dialog, customer dialog, design-type dialog, task-assignment dialog, and reports analytics charts backing modules into dedicated hooks/reusable section components, with thin wrapper/utility entries explicitly marked `NJ` with reasons. |
| 6 | IP | Added shared order-money helper and task completion ledger idempotency guard; hardened payroll disbursement flow with serializable transaction/retry, branch-scope enforcement, and safe payment-history query normalization; hardened expenses domain with branch-required create validation, safe pagination/date handling, category integrity checks, and whitelisted sorting; hardened rates domain with BranchGuard enforcement, strict branch scoping, normalized pagination contracts, safer effective-date validation, and shared-contract DTO cleanup; hardened search domain with sanitized full-text query generation, capped limits, resilient ILIKE fallbacks, and cleaner controller limit parsing; hardened employees domain by reusing ledger summary as single source of truth for balance stats and normalizing employee list/item pagination/branch checks to remove duplicated calculation logic; refactored users domain to centralize email normalization/uniqueness checks, shared select projections, shared password policy constants, secure temp password generation, and shared admin-role constants usage; hardened branches domain with normalized search/pagination/code checks and shared open-order status reuse for deletion guard; removed assistant-created temporary test files per request. |
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

## Current Checkpoint (After Fortieth Implementation Pass)

- `./scripts/verify-refactor-manifest.sh`: pass
- `npm run lint -w web`: pass
- `npx tsc -p apps/api/tsconfig.json --noEmit`: pass
- `npm run build -w api`: not rerun in this pass
- `npm run test -w api -- --runInBand`: intentionally not run in this pass (per request to avoid test work)
- `npm run build -w @tbms/shared-types`: not rerun in this pass (no shared-type code change)
- `npm run build -w @tbms/shared-constants`: not rerun in this pass (no shared-constants code change)
- `npx tsc -p apps/web/tsconfig.json --noEmit`: not rerun in this pass
- `npm run build -w web`: blocked in this environment (`ENOTFOUND fonts.googleapis.com` for `next/font`)

## Manifest Progress Snapshot

| Phase | DN | NS | IP | NJ | BL |
|---|---:|---:|---:|---:|---:|
| 1 | 11 | 5 | 0 | 0 | 0 |
| 2 | 3 | 6 | 0 | 0 | 0 |
| 3 | 20 | 33 | 0 | 0 | 0 |
| 4 | 6 | 29 | 0 | 1 | 0 |
| 5 | 181 | 0 | 0 | 11 | 0 |
| 6 | 37 | 21 | 0 | 9 | 0 |
| 7 | 11 | 4 | 0 | 0 | 0 |
| 8 | 4 | 21 | 0 | 0 | 0 |
| 9 | 0 | 2 | 0 | 0 | 0 |
