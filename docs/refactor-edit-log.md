# TBMS Refactor Edit Log

This is the single source of truth for implementation edits and why they were made.

## 2026-03-03 — Pass 3 (RBAC consolidation + UI consistency)

### Backend RBAC consolidation
- `packages/shared-constants/src/rbac.ts`
  - Added `SUPER_ADMIN_ONLY_ROLES` and `ALL_ROLES` role groups to remove duplicated role arrays.
- `apps/api/src/expenses/expenses.controller.ts`
  - Replaced repeated `Role.ADMIN, Role.SUPER_ADMIN` combinations with `@Roles(...ADMIN_ROLES)`.
- `apps/api/src/payments/payments.controller.ts`
  - Replaced repeated admin role combinations with `@Roles(...ADMIN_ROLES)`.
- `apps/api/src/ledger/ledger.controller.ts`
  - Replaced repeated admin role combinations with `@Roles(...ADMIN_ROLES)`.
- `apps/api/src/rates/rates.controller.ts`
  - Replaced repeated admin role combinations with `@Roles(...ADMIN_ROLES)`.
- `apps/api/src/attendance/attendance.controller.ts`
  - Replaced hardcoded role sets with `EMPLOYEE_AND_OPERATOR_ROLES` and `DASHBOARD_READ_ROLES`.
- `apps/api/src/design-types/design-types.controller.ts`
  - Standardized roles with `ADMIN_ROLES` and `SUPER_ADMIN_ONLY_ROLES`.
- `apps/api/src/config/config.controller.ts`
  - Standardized role usage with `ADMIN_ROLES` and `SUPER_ADMIN_ONLY_ROLES`.
- `apps/api/src/users/users.controller.ts`
  - Replaced super-admin-only role declarations with `SUPER_ADMIN_ONLY_ROLES`.
- `apps/api/src/branches/branches.controller.ts`
  - Replaced all explicit role lists with `ALL_ROLES`, `ADMIN_ROLES`, and `SUPER_ADMIN_ONLY_ROLES`.

### Frontend UI consistency (shared primitives)
- `apps/web/components/config/BranchesTable.tsx`
  - Replaced custom top heading block with `PageHeader`.
  - Replaced section heading with `Typography` (`sectionTitle`).
- `apps/web/components/config/GarmentTypesTable.tsx`
  - Replaced custom top heading block with `PageHeader`.
  - Replaced section heading with `Typography` (`sectionTitle`).
- `apps/web/components/config/MeasurementCategoriesTable.tsx`
  - Replaced custom top heading block with `PageHeader`.
  - Replaced section heading with `Typography` (`sectionTitle`).
- `apps/web/components/config/UsersTable.tsx`
  - Replaced custom top heading block with `PageHeader` while preserving existing stats/cards behavior.
- `apps/web/app/(dashboard)/employees/page.tsx`
  - Replaced “Staff Directory” heading with `Typography` (`sectionTitle`).
- `apps/web/app/(dashboard)/payments/page.tsx`
  - Replaced “Payment History” heading with `Typography` (`sectionTitle`).

### Tracking updates
- `docs/refactor-manifest.csv`
  - Marked files completed in this pass as `DN` with note `Third modernization pass`.
- `docs/refactor-status.md`
  - Updated manifest progress snapshot counts and tracking artifacts list to include this edit log.
- `docs/refactor-edit-log.md`
  - Created this centralized per-file implementation log as requested.

### Verification run after edits
- `npm run lint -w web` ✅
- `npm run build -w api` ✅
- `npm run build -w @tbms/shared-constants` ✅
- `npm run refactor:manifest:verify` ✅

## 2026-03-03 — Pass 4 (Detail pages + typography standardization)

### Frontend detail page consistency
- `apps/web/app/(dashboard)/settings/design-types/page.tsx`
  - Replaced custom header block with `PageHeader` while preserving back navigation and add action.
  - Wrapped development-only debug logging guard around fetch error logging.
- `apps/web/app/(dashboard)/customers/[id]/page.tsx`
  - Replaced top page header structure with `PageHeader` + structured description/actions.
  - Replaced measurements section heading with `Typography` (`sectionTitle`).
- `apps/web/app/(dashboard)/settings/garments/[id]/page.tsx`
  - Replaced custom header block with `PageHeader` while preserving back button, status badge, and actions.
  - Replaced “Garment Not Found” raw heading/paragraph with `Typography` primitives.
  - Wrapped development-only debug logging guard around fetch error logging.
- `apps/web/app/(dashboard)/employees/[id]/page.tsx`
  - Replaced raw not-found heading and profile heading with `Typography` primitives.
  - Replaced financial KPI value headings with `Typography` (`statValue`).
  - Replaced “Verification Documents” and “No Portal Account” section headings with `Typography`.

### Shared UI primitive extension
- `apps/web/components/ui/typography.tsx`
  - Added `statValue` variant for reusable metric/KPI number rendering.

### Config dashboard consistency follow-up
- `apps/web/components/config/UsersTable.tsx`
  - Replaced stats card numeric `h3` headings with `Typography` (`statValue`) for consistency.

### Backend RBAC constants alignment (continued)
- `packages/shared-constants/src/rbac.ts`
  - Reused in this pass; role groups remain canonical (`ADMIN_ROLES`, `SUPER_ADMIN_ONLY_ROLES`, etc.).
- `apps/api/src/attendance/attendance.controller.ts`
- `apps/api/src/branches/branches.controller.ts`
- `apps/api/src/config/config.controller.ts`
- `apps/api/src/design-types/design-types.controller.ts`
- `apps/api/src/expenses/expenses.controller.ts`
- `apps/api/src/ledger/ledger.controller.ts`
- `apps/api/src/payments/payments.controller.ts`
- `apps/api/src/rates/rates.controller.ts`
- `apps/api/src/users/users.controller.ts`
  - These files were touched in this pass and remain aligned to shared role groups.

### Tracking updates
- `docs/refactor-manifest.csv`
  - Marked files completed in this pass as `DN` with note `Fourth modernization pass`.
- `docs/refactor-status.md`
  - Updated Phase 5 DN/NS snapshot counts and moved checkpoint label to “After Fourth Implementation Pass”.

### Verification run after edits
- `npm run lint -w web` ✅
- `npm run build -w api` ✅
- `npm run build -w @tbms/shared-constants` ✅
- `npm run refactor:manifest:verify` ✅

## 2026-03-03 — Pass 5 (Remaining dashboard/page heading normalization)

### Frontend page-level primitive adoption
- `apps/web/app/login/page.tsx`
  - Replaced raw hero and form headings (`h1`, `h2`) with `Typography` variants.
- `apps/web/app/status/[token]/page.tsx`
  - Replaced raw heading tags with `Typography` for page title, order number, and section labels.
- `apps/web/app/(dashboard)/orders/[id]/page.tsx`
  - Replaced order detail header `h1` with `Typography` (`pageTitle`).
- `apps/web/app/(dashboard)/settings/rates/page.tsx`
  - Replaced custom header section with `PageHeader` + back-button composition.
  - Replaced total stat numeric heading with `Typography` (`statValue`).
  - Wrapped fetch error logging in development-only guard.

### Config component primitive adoption
- `apps/web/components/config/MeasurementCategoryDetail.tsx`
  - Replaced custom header block with `PageHeader`.
  - Wrapped fetch error logging in development-only guard.
- `apps/web/components/config/BranchHubConfig.tsx`
  - Replaced custom branch title block with `PageHeader`.
  - Replaced global-pricing heading with `Typography` (`sectionTitle`).
  - Wrapped fetch error logging in development-only guard.

### Shared UI primitive update
- `apps/web/components/ui/typography.tsx`
  - Reused and confirmed `statValue` variant for KPI-style number consistency.

### Sweep result
- `apps/web/app` + `apps/web/components/config` now contain no raw `h1/h2/h3` tags.

### Tracking updates
- `docs/refactor-manifest.csv`
  - Marked files completed in this pass as `DN` with note `Fifth modernization pass`.
- `docs/refactor-status.md`
  - Updated checkpoint label and manifest snapshot counts for Phase 5 and Phase 7.

### Verification run after edits
- `npm run lint -w web` ✅
- `npm run build -w api` ✅
- `npm run build -w @tbms/shared-constants` ✅
- `npm run refactor:manifest:verify` ✅

## 2026-03-03 — Pass 6 (API test hardening + financial/idempotency coverage)

### Failing Nest spec stabilization (dependency-safe test modules)
- `apps/api/src/auth/auth.controller.spec.ts`
  - Added `AuthService` mock provider to testing module so controller instantiation resolves constructor dependencies.
- `apps/api/src/auth/auth.service.spec.ts`
  - Added mock providers for `UsersService` and `JwtService` required by `AuthService`.
- `apps/api/src/customers/customers.controller.spec.ts`
  - Added `CustomersService` mock provider for controller construction.
- `apps/api/src/customers/customers.service.spec.ts`
  - Added `PrismaService` and `SearchService` mock providers for service construction.
- `apps/api/src/employees/employees.controller.spec.ts`
  - Added `EmployeesService` mock provider for controller construction.
- `apps/api/src/employees/employees.service.spec.ts`
  - Added `PrismaService` and `SearchService` mock providers for service construction.
- `apps/api/src/search/search.controller.spec.ts`
  - Added `SearchService` mock provider for controller construction.
- `apps/api/src/search/search.service.spec.ts`
  - Added `PrismaService` and `CACHE_MANAGER` mock providers for `SearchService` construction.
- `apps/api/src/users/users.service.spec.ts`
  - Added `PrismaService` mock provider for service construction.

### New targeted backend correctness tests
- `apps/api/src/orders/money.spec.ts` (new)
  - Added tests for fixed discount capping, percentage (basis points) discount math, missing discount behavior, and total/balance clamping invariants.
- `apps/api/src/tasks/tasks.service.spec.ts` (new)
  - Added tests for earning-ledger idempotency on task completion, duplicate-entry prevention, already-completed no-op behavior, and employee assignment authorization enforcement.

### Tracking updates
- `docs/refactor-manifest.csv`
  - Regenerated manifest to include new spec files and marked all Pass 6 edited backend spec files as `DN` with note `Sixth modernization pass`.
- `docs/refactor-status.md`
  - Updated checkpoint title to “After Sixth Implementation Pass”.
  - Added API test-suite verification result.
  - Updated manifest snapshot counts after Pass 6 completion updates.
- `docs/refactor-edit-log.md`
  - Appended this Pass 6 section so every edit remains centralized in one file.

### Verification run after edits
- `npm run test -w api -- --runInBand` ✅ (`13/13` suites, `19/19` tests)

## 2026-03-03 — Pass 6A (Customer/public-status contract test expansion)

### Added contract-focused backend tests
- `apps/api/src/customers/customers.service.spec.ts`
  - Added filter contract test to verify `findAll` applies `branchId`, `isVip`, and `status` conditions to Prisma queries.
  - Added search-path contract test to verify `findAll` delegates to `SearchService` and bypasses Prisma pagination queries when search text is provided.
- `apps/api/src/orders/status.controller.spec.ts` (new)
  - Added public status endpoint tests for missing/invalid PIN validation and valid token+PIN forwarding to `OrdersService`.

### Tracking updates
- `docs/refactor-manifest.csv`
  - Regenerated manifest and marked new `apps/api/src/orders/status.controller.spec.ts` as `DN` with note `Sixth modernization pass`.
- `docs/refactor-status.md`
  - Updated Phase 6 manifest snapshot count (`DN` increment) and phase notes reflecting broader contract test coverage.
- `docs/refactor-edit-log.md`
  - Appended this Pass 6A section to keep every edit listed in one file.

### Verification run after edits
- `npm run test -w api -- --runInBand` ✅ (`14/14` suites, `24/24` tests)

## 2026-03-03 — Pass 7 (Frontend logging standardization + shared UI primitive consistency)

### Shared frontend logging utility
- `apps/web/lib/logger.ts` (new)
  - Added `logDevError(message, error?)` helper to centralize development-only error logging and prevent production console noise.
- `apps/web/lib/api.ts`
  - Replaced ad-hoc network diagnostics `console.error` call with `logDevError`.

### Replaced direct console logging in frontend modules
- `apps/web/components/layout/BranchSelector.tsx`
  - Replaced local `process.env.NODE_ENV` + `console.error` block with `logDevError`.
- `apps/web/components/customers/CustomerTable.tsx`
  - Replaced direct fetch failure logging with `logDevError`.
- `apps/web/components/customers/MeasurementForm.tsx`
  - Replaced category-load and save-failure console logging with `logDevError`.
- `apps/web/components/config/GarmentTypesTable.tsx`
  - Replaced fetch failure console logging with `logDevError`.
- `apps/web/components/config/MeasurementCategoriesTable.tsx`
  - Replaced fetch failure console logging with `logDevError`.
- `apps/web/components/config/UsersTable.tsx`
  - Replaced user stats fetch console logging with `logDevError`.
- `apps/web/components/config/GarmentPriceHistoryDialog.tsx`
  - Replaced history fetch console logging with `logDevError`.
- `apps/web/components/config/GarmentTypeDialog.tsx`
  - Replaced category-load/save-failure console logging with `logDevError`.
- `apps/web/components/config/BranchHubConfig.tsx`
  - Replaced branch hub fetch console logging with `logDevError`.
- `apps/web/components/config/MeasurementCategoryDetail.tsx`
  - Replaced category detail fetch console logging with `logDevError`.
- `apps/web/components/rates/CreateRateDialog.tsx`
  - Replaced submit failure console logging with `logDevError`.
- `apps/web/components/ui/confirm-dialog.tsx`
  - Replaced confirm-action failure console logging with `logDevError`.
- `apps/web/app/(dashboard)/settings/design-types/page.tsx`
  - Replaced fetch failure logging guard with `logDevError`.
- `apps/web/app/(dashboard)/settings/rates/page.tsx`
  - Replaced fetch failure logging guard with `logDevError`.
- `apps/web/app/(dashboard)/settings/garments/[id]/page.tsx`
  - Replaced fetch failure logging guard with `logDevError`.

### Shared UI primitive consistency updates
- `apps/web/components/ui/empty-state.tsx`
  - Replaced raw `h3`/`p` tags with shared `Typography` variants for standardized typographic rendering.
- `apps/web/components/ui/data-table.tsx`
  - Replaced header `<tr>` with `TableRow` to align with shadcn table primitives.
  - Replaced empty-state and pagination text blocks with `Typography` primitives for typography consistency.

### Sweep result
- All direct `console.error(...)` calls under `apps/web/app`, `apps/web/components`, and `apps/web/lib` are now centralized through `apps/web/lib/logger.ts`.
- No raw `h1/h2/h3` tags remain under `apps/web/app` and `apps/web/components`.

### Tracking updates
- `docs/refactor-manifest.csv`
  - Regenerated manifest for the new logger file and marked all Pass 7 touched files as `DN` with note `Seventh modernization pass`.
- `docs/refactor-status.md`
  - Updated checkpoint to “After Seventh Implementation Pass” and refreshed manifest snapshot counts.
- `docs/refactor-edit-log.md`
  - Appended this Pass 7 section to keep all edits documented in one file.

### Verification run after edits
- `npm run lint -w web` ✅
- `npm run build -w api` ✅
- `./scripts/verify-refactor-manifest.sh` ✅ (after manifest regeneration)

## 2026-03-03 — Pass 8 (Shared contracts/constants migration sweep)

### Shared-types contract expansion (canonical cross-app payloads)
- `packages/shared-types/src/reports.ts` (new)
  - Added canonical report payload contracts: `DesignAnalytics`, `AddonAnalytics`, `ReportSummary`, `RevenueVsExpenses`, `GarmentRevenue`, and `EmployeeProductivity`.
- `packages/shared-types/src/ledger.ts`
  - Added shared `LedgerStatementParams` query contract to replace local ledger statement filter interfaces.
- `packages/shared-types/src/employees.ts`
  - Added reusable `EmployeeLinkedUserAccount`, `EmployeeWithRelations`, and `EmployeeStatsSummary` contracts to replace app-local employee relation/stats shapes.
- `packages/shared-types/src/users.ts`
  - Added `UserStatsSummary` contract for user stats responses.
- `packages/shared-types/src/branches.ts`
  - Added `BranchStatsSummary` contract for branch stats responses.
- `packages/shared-types/src/index.ts`
  - Exported the new `reports` contract module.

### Web API client migration (removed local duplicate interfaces)
- `apps/web/lib/api/reports.ts`
  - Removed local report interface declarations and switched to shared report contracts from `@tbms/shared-types`.
  - Re-exported shared report types to preserve existing import paths in UI code.
- `apps/web/lib/api/ledger.ts`
  - Removed local `StatementParams` and `LedgerStatementResponse` interfaces.
  - Switched statement endpoint typing to shared `LedgerStatementParams` + `LedgerStatement`.
- `apps/web/lib/api/employees.ts`
  - Removed local employee relation/account interfaces and switched to shared employee contracts.
  - Added `normalizeEmployeeStats` adapter to keep `balance`/`currentBalance` compatibility in one place.
- `apps/web/lib/api/users.ts`
  - Replaced inline create/update/stats payload types with shared `CreateUserInput`, `UpdateUserInput`, and `UserStatsSummary`.
- `apps/web/lib/api/branches.ts`
  - Replaced inline create/update/stats payload types with shared `CreateBranchInput`, `UpdateBranchInput`, and `BranchStatsSummary`.

### Backend service boundary alignment to shared contracts
- `apps/api/src/reports/reports.service.ts`
  - Imported shared report payload types and used shared return signatures for analytics/report helper methods.
- `apps/api/src/ledger/ledger.service.ts`
  - Replaced inline statement query options with shared `LedgerStatementParams` contract.

### Tracking updates
- `docs/refactor-manifest.csv`
  - Regenerated and marked all Pass 8 touched files as `DN` with note `Eighth modernization pass`.
- `docs/refactor-status.md`
  - Updated checkpoint to “After Eighth Implementation Pass” and refreshed snapshot counts for phases 3 and 6.
- `docs/refactor-edit-log.md`
  - Appended this Pass 8 section so all changes remain tracked in one file.

### Verification run after edits
- `npm run build -w @tbms/shared-types` ✅
- `npm run lint -w web` ✅
- `npm run build -w api` ✅

## 2026-03-03 — Pass 9 (Complete remaining shared constants dedupe + remove created tests)

### Shared constants completion (remaining local workflow/rate duplicates)
- `packages/shared-constants/src/rates.ts`
  - Added shared workflow presets and seed constants to eliminate remaining local duplicates:
    - `DEFAULT_WORKFLOW_STEP_PRESETS`
    - `SHALWAR_KAMEEZ_WORKFLOW_STEP_PRESETS`
    - `COAT_WORKFLOW_STEP_PRESETS`
    - `RATE_SPLIT_HINTS`
    - `SHALWAR_KAMEEZ_INITIAL_RATES`
    - `COAT_INITIAL_RATES`
  - Kept existing `STEP_KEYS`, `STEP_KEY_LABELS`, currency helpers, and task-rate helper as canonical exports.

### Consumer migration to shared constants
- `apps/web/components/config/GarmentWorkflowStepsDialog.tsx`
  - Replaced hardcoded default workflow-step array with `DEFAULT_WORKFLOW_STEP_PRESETS`.
- `apps/api/prisma/seed.ts`
  - Replaced local workflow-step and initial-rate literal maps with shared constants:
    - `SHALWAR_KAMEEZ_WORKFLOW_STEP_PRESETS`
    - `COAT_WORKFLOW_STEP_PRESETS`
    - `SHALWAR_KAMEEZ_INITIAL_RATES`
    - `COAT_INITIAL_RATES`
  - Removed duplicate string/step/rate definitions from seed logic.
- `apps/api/scripts/seed-initial-rates.ts`
  - Replaced hardcoded step split rules (`CUTTING/STITCHING/PRESSING`) with shared `RATE_SPLIT_HINTS`.

### Removed assistant-created test files (per explicit request)
- `apps/api/src/orders/money.spec.ts` (deleted)
- `apps/api/src/orders/status.controller.spec.ts` (deleted)
- `apps/api/src/tasks/tasks.service.spec.ts` (deleted)

### Tracking updates
- `docs/refactor-manifest.csv`
  - Regenerated and marked pass-touched in-scope files as `DN` with note `Ninth modernization pass`.
  - Removed manifest rows for deleted test files (no longer present in repository scan).
- `docs/refactor-status.md`
  - Updated checkpoint label and refreshed manifest snapshot counts after Pass 9.
- `docs/refactor-edit-log.md`
  - Appended this Pass 9 section to keep all edits documented in one file.

### Verification run after edits
- `npm run build -w @tbms/shared-constants` ✅
- `npm run build -w @tbms/shared-types` ✅
- `npm run build -w api` ✅
- `npm run lint -w web` ✅
- `./scripts/verify-refactor-manifest.sh` ✅

## 2026-03-03 — Pass 10 (Frontend page decomposition: `orders/[id]` orchestration split)

### Reusable order detail sections/dialogs extracted
- `apps/web/components/orders/order-detail-breadcrumb.tsx` (new)
  - Extracted breadcrumb/navigation block for order detail pages.
- `apps/web/components/orders/order-detail-header-card.tsx` (new)
  - Extracted order summary header card and action controls (print/share/cancel/edit).
- `apps/web/components/orders/order-customer-insight-card.tsx` (new)
  - Extracted customer profile + measurements preview section.
- `apps/web/components/orders/order-items-table.tsx` (new)
  - Extracted garment-piece table, employee/task rendering, and table column definitions.
- `apps/web/components/orders/order-financial-summary-card.tsx` (new)
  - Extracted financial ledger summary and payment CTA card.
- `apps/web/components/orders/order-timeline-card.tsx` (new)
  - Extracted workflow timeline card with status-history rendering.
- `apps/web/components/orders/order-lifecycle-card.tsx` (new)
  - Extracted lifecycle advancement action card by status.
- `apps/web/components/orders/order-payment-dialog.tsx` (new)
  - Extracted payment capture dialog.
- `apps/web/components/orders/order-share-dialog.tsx` (new)
  - Extracted public status sharing dialog.

### Orchestrator page simplification
- `apps/web/app/(dashboard)/orders/[id]/page.tsx`
  - Converted to orchestration-only structure:
    - data/status/payment/share behavior sourced from `useOrderDetail`
    - local UI state only for dialog/task selection/form fields
    - composed from extracted order section/dialog components
    - clipboard action wrapped with toast-backed error handling.
- `apps/web/hooks/use-order-detail.ts`
  - Adopted as the canonical data/action hook for order-detail orchestration.

### Tracking/coverage hardening for decomposition work
- `scripts/generate-refactor-manifest.sh`
  - Added `apps/web/hooks` to manifest scope.
  - Added `apps/web/components/orders/*` and `apps/web/hooks/*` to Phase 5 (`web-domains`) classification.
- `scripts/verify-refactor-manifest.sh`
  - Added `apps/web/hooks` to expected-file verification set.
- `docs/refactor-manifest.csv`
  - Regenerated manifest and marked all pass-touched order decomposition files as `DN` with note `Tenth modernization pass`.
- `docs/refactor-status.md`
  - Updated checkpoint to “After Tenth Implementation Pass”.
  - Updated Phase 5 notes and snapshot counts after decomposition.
- `docs/refactor-edit-log.md`
  - Appended this Pass 10 section to keep all edits listed in one file.

### Verification run after edits
- `npm run lint -w web` ✅
- `./scripts/verify-refactor-manifest.sh` ✅
- `npx tsc -p apps/web/tsconfig.json --noEmit` ⚠️ fails due pre-existing unrelated issues in `apps/web/app/(dashboard)/page.tsx`, `apps/web/components/ui/typography.tsx`, and `apps/web/middleware.ts`

## 2026-03-03 — Pass 11 (Frontend page decomposition: `orders/new` + UX/design refinement)

### New order page orchestration and data hook extraction
- `apps/web/hooks/use-order-form-page.ts` (new)
  - Added canonical order-form hook for:
    - edit-mode detection via URL search params
    - bootstrap data loading (garments/customers/tailors/design types)
    - edit payload mapping and form reset
    - totals computation and line-item totals
    - garment default-rate application
    - addon add/remove helpers
    - create/update submission flow with toast + redirect handling.
- `apps/web/app/(dashboard)/orders/new/page.tsx`
  - Converted to orchestration page that composes reusable sections from `components/orders`.
  - Added initial loading skeleton path for better first-load UX.
  - Added top context strip (mode, piece count, due date) and standardized `PageHeader` copy/actions.

### Reusable order-form UI section extraction
- `apps/web/components/orders/order-form-skeleton.tsx` (new)
  - Added structured loading skeleton for the full order form layout.
- `apps/web/components/orders/order-form-customer-card.tsx` (new)
  - Extracted customer + due-date section with validation messages and loading-aware customer select.
- `apps/web/components/orders/order-form-item-card.tsx` (new)
  - Extracted per-piece editor with:
    - piece-level header/badges
    - live per-piece total preview
    - standardized garment/design/tailor/fabric/notes controls
    - addon charge management in a dedicated dashed panel.
- `apps/web/components/orders/order-form-items-card.tsx` (new)
  - Extracted items container with item-count badge, section guidance text, and add-piece action.
- `apps/web/components/orders/order-form-summary-card.tsx` (new)
  - Extracted sticky summary with improved information hierarchy:
    - customer + due-date snapshot
    - discount controls and computed totals
    - advance payment + balance due emphasis
    - consolidated submit action state.

### Tracking updates
- `docs/refactor-manifest.csv`
  - Regenerated and marked all pass-touched `orders/new` decomposition files as `DN` with note `Eleventh modernization pass`.
- `docs/refactor-status.md`
  - Updated checkpoint to “After Eleventh Implementation Pass”.
  - Updated Phase 5 note and manifest snapshot counts (`DN` increased).
- `docs/refactor-edit-log.md`
  - Appended this Pass 11 section to keep all edits listed in one file.

### Verification run after edits
- `npm run lint -w web` ✅
- `./scripts/verify-refactor-manifest.sh` ✅
- `npx tsc -p apps/web/tsconfig.json --noEmit` ⚠️ still reports only pre-existing unrelated type issues in `apps/web/app/(dashboard)/page.tsx`, `apps/web/components/ui/typography.tsx`, and `apps/web/middleware.ts`

## 2026-03-03 — Pass 12 (Frontend page decomposition: `orders` list + decomposition task board)

### Orders list page orchestration/data split
- `apps/web/hooks/use-orders-list-page.ts` (new)
  - Added canonical list-page hook for order fetching, debounced search, date/status filters, active-filter count, pagination, and reset behavior.
- `apps/web/app/(dashboard)/orders/page.tsx`
  - Converted to orchestration-only page that composes reusable list toolbar + table components from `components/orders`.
  - Reduced route file complexity and centralized list state logic in hook.

### Reusable orders list UI extraction + UX refinement
- `apps/web/components/orders/orders-list-toolbar.tsx` (new)
  - Extracted searchable/filterable toolbar with:
    - total results badge
    - active filter count badge
    - status/date filters
    - reset action disabled when no active filters.
- `apps/web/components/orders/orders-list-table.tsx` (new)
  - Extracted table columns/actions and standardized icon actions using shared `Button` variants.
  - Added receipt print action wiring for READY orders (`window.open` to receipt endpoint).

### Decomposition tracking task board
- `docs/frontend-page-decomposition-tracker.md` (new)
  - Added explicit decomposition task tracker covering all frontend route pages with statuses (`DN`/`NS`/`NJ`) and a prioritized next-task queue.
  - Marked completed and remaining pages so progress is visible each pass.

### Tracking updates
- `docs/refactor-manifest.csv`
  - Regenerated and marked pass-touched orders list decomposition files as `DN` with note `Twelfth modernization pass`.
- `docs/refactor-status.md`
  - Updated checkpoint to “After Twelfth Implementation Pass”.
  - Added decomposition tracker artifact entry.
  - Updated Phase 5 note and snapshot counts (`DN` increased).
- `docs/refactor-edit-log.md`
  - Appended this Pass 12 section to keep all edits listed in one file.

### Verification run after edits
- `npm run lint -w web` ✅
- `./scripts/verify-refactor-manifest.sh` ✅
- `npx tsc -p apps/web/tsconfig.json --noEmit` ⚠️ still reports only pre-existing unrelated type issues in `apps/web/app/(dashboard)/page.tsx`, `apps/web/components/ui/typography.tsx`, and `apps/web/middleware.ts` (no new `orders` list decomposition errors)

## 2026-03-03 — Pass 13 (Frontend page decomposition: dashboard home + employee detail)

### Dashboard home decomposition (`apps/web/app/(dashboard)/page.tsx`)
- `apps/web/hooks/use-dashboard-page.ts` (new)
  - Extracted dashboard data orchestration (stats, designs, productivity, garments, revenue-vs-expenses) and derived chart rows.
- `apps/web/components/dashboard/dashboard-kpi-card.tsx` (new)
  - Extracted reusable KPI tile primitive with loading state.
- `apps/web/components/dashboard/dashboard-overdue-banner.tsx` (new)
  - Extracted overdue/on-track alert banner and canonical overdue route constant.
- `apps/web/components/dashboard/dashboard-revenue-expenses-card.tsx` (new)
  - Extracted revenue-vs-expenses widget.
- `apps/web/components/dashboard/dashboard-garment-breakdown-card.tsx` (new)
  - Extracted garment share donut card.
- `apps/web/components/dashboard/dashboard-design-popularity-card.tsx` (new)
  - Extracted design popularity list/progress card.
- `apps/web/components/dashboard/dashboard-overdue-orders-card.tsx` (new)
  - Extracted recent overdue orders list card and canonical overdue query constant.
- `apps/web/components/dashboard/dashboard-productivity-card.tsx` (new)
  - Extracted employee productivity widget.
- `apps/web/app/(dashboard)/page.tsx`
  - Converted to orchestration-only dashboard composition using extracted hook and section components.

### Employee detail decomposition (`apps/web/app/(dashboard)/employees/[id]/page.tsx`)
- `apps/web/hooks/use-employee-detail-page.ts` (new)
  - Extracted employee detail orchestration:
    - profile/stats/items/tasks/attendance/settings loading
    - ledger filters/pagination loading
    - task status updates, ledger create/delete, document upload
    - dialog/form states for account/edit/document/ledger flows.
- `apps/web/components/employees/detail/employee-detail-header.tsx` (new)
  - Extracted profile header with back/provision/edit actions.
- `apps/web/components/employees/detail/employee-financial-cards.tsx` (new)
  - Extracted financial summary card row (earned/paid/balance).
- `apps/web/components/employees/detail/employee-profile-sidebar.tsx` (new)
  - Extracted personal/employment sidebar cards.
- `apps/web/components/employees/detail/employee-detail-tabs.tsx` (new)
  - Extracted tasks/history/ledger/attendance/documents/account tab container and table columns.
- `apps/web/components/employees/detail/employee-document-upload-dialog.tsx` (new)
  - Extracted document upload dialog.
- `apps/web/components/employees/detail/employee-ledger-entry-dialog.tsx` (new)
  - Extracted manual ledger entry dialog.
- `apps/web/components/employees/detail/employee-detail-skeleton.tsx` (new)
  - Extracted loading skeleton for detail page.
- `apps/web/app/(dashboard)/employees/[id]/page.tsx`
  - Converted to orchestration-only composition with reusable detail sections and dialogs.

### Tracking and planning updates
- `scripts/generate-refactor-manifest.sh`
  - Added `apps/web/components/dashboard/*` classification to Phase 5 (`web-domains`).
- `docs/frontend-page-decomposition-tracker.md` (new)
  - Added/updated decomposition task board with done/remaining statuses and prioritized next queue.
- `docs/refactor-manifest.csv`
  - Regenerated and marked all pass-touched dashboard/employee decomposition files as `DN` with note `Thirteenth modernization pass`.
- `docs/refactor-status.md`
  - Updated checkpoint to “After Thirteenth Implementation Pass” and refreshed Phase 5 counts/notes.
- `docs/refactor-edit-log.md`
  - Appended this Pass 13 section to keep all edits listed in one file.

### Verification run after edits
- `npm run lint -w web` ✅
- `./scripts/verify-refactor-manifest.sh` ✅
- `npx tsc -p apps/web/tsconfig.json --noEmit` ⚠️ still reports only pre-existing unrelated type issues in `apps/web/components/ui/typography.tsx` and `apps/web/middleware.ts` (no new dashboard/employee decomposition errors)

## 2026-03-03 — Pass 14 (Frontend page decomposition: expenses + payments)

### Expenses page decomposition (`apps/web/app/(dashboard)/expenses/page.tsx`)
- `apps/web/hooks/use-expenses-page.ts` (new)
  - Extracted expenses orchestration for:
    - expenses/category fetching
    - pagination + category/date filters
    - add-expense dialog/form state
    - destructive-delete confirmation state and actions.
- `apps/web/components/expenses/expenses-overview-cards.tsx` (new)
  - Added reusable spend/records summary cards with standardized KPI typography.
- `apps/web/components/expenses/expenses-filters-card.tsx` (new)
  - Added reusable filters section with active-filter badge, category/date controls, and reset behavior.
- `apps/web/components/expenses/expenses-table.tsx` (new)
  - Added reusable expenses table section with column definitions and row action wiring.
- `apps/web/components/expenses/expense-create-dialog.tsx` (new)
  - Added reusable create-expense dialog with validation-aware submit disabling.
- `apps/web/app/(dashboard)/expenses/page.tsx`
  - Converted route to orchestration-only composition using extracted hook + reusable sections.
  - Replaced browser `confirm()` flow with shared `ConfirmDialog` for consistent destructive-action UX.

### Payments page decomposition (`apps/web/app/(dashboard)/payments/page.tsx`)
- `apps/web/hooks/use-payments-page.ts` (new)
  - Extracted payments orchestration for:
    - employee selection loading
    - summary/history fetching and pagination
    - history date filters + reset behavior
    - disbursement dialog/form state and payout validation.
  - Added page-reset-aware refresh logic after payout to avoid duplicate history fetches.
- `apps/web/components/payments/payments-employee-selector-card.tsx` (new)
  - Added reusable selector section with employee count and selected-user context line.
- `apps/web/components/payments/payments-summary-cards.tsx` (new)
  - Added reusable summary KPI cards with loading skeleton state and contextual disburse action.
- `apps/web/components/payments/payments-history-section.tsx` (new)
  - Added reusable history section with shared filters, active-filter indicator, and paginated table.
- `apps/web/components/payments/payments-disburse-dialog.tsx` (new)
  - Added reusable payout dialog with balance guardrails and inline amount validation messaging.
- `apps/web/app/(dashboard)/payments/page.tsx`
  - Converted route to orchestration-only composition using extracted hook + reusable sections.
  - Improved top-level action UX by showing a primary disburse CTA only when payable balance exists.

### Tracking + manifest updates
- `scripts/generate-refactor-manifest.sh`
  - Added `apps/web/components/expenses/*` and `apps/web/components/payments/*` to Phase 5 (`web-domains`) classification.
- `docs/frontend-page-decomposition-tracker.md`
  - Marked expenses/payments routes as `DN` and advanced queue to the next pending decomposition pages.
- `docs/refactor-manifest.csv`
  - Regenerated and marked all pass-touched expenses/payments decomposition files as `DN` with note `Fourteenth modernization pass`.
- `docs/refactor-status.md`
  - Updated checkpoint to “After Fourteenth Implementation Pass” and refreshed Phase 5 snapshot counts.
- `docs/refactor-edit-log.md`
  - Appended this Pass 14 section so every edit remains centralized in one file.

### Verification run after edits
- `npm run lint -w web` ✅
- `./scripts/verify-refactor-manifest.sh` ✅
- `npx tsc -p apps/web/tsconfig.json --noEmit` ⚠️ still reports only pre-existing unrelated type issues in `apps/web/components/ui/typography.tsx` and `apps/web/middleware.ts`
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-03 — Pass 15 (Frontend page decomposition: customer detail + garment detail)

### Customer detail decomposition (`apps/web/app/(dashboard)/customers/[id]/page.tsx`)
- `apps/web/hooks/use-customer-detail-page.ts` (new)
  - Extracted customer detail orchestration for:
    - customer/profile/orders/categories loading
    - tab state management
    - edit + measurement dialog states
    - measurement label normalization map.
- `apps/web/components/customers/detail/customer-detail-skeleton.tsx` (new)
  - Added reusable skeleton state for customer detail loading.
- `apps/web/components/customers/detail/customer-detail-header.tsx` (new)
  - Extracted header section with back/edit actions and page-level identity chip line.
- `apps/web/components/customers/detail/customer-profile-card.tsx` (new)
  - Extracted profile summary panel with status and financial/order KPIs.
- `apps/web/components/customers/detail/customer-measurements-tab.tsx` (new)
  - Extracted measurements section with reusable empty state and update action.
- `apps/web/components/customers/detail/customer-orders-tab.tsx` (new)
  - Extracted order history section to standardized `DataTable` with status badges.
- `apps/web/components/customers/detail/customer-notes-tab.tsx` (new)
  - Extracted notes section into reusable card component.
- `apps/web/components/customers/detail/customer-detail-tabs.tsx` (new)
  - Extracted tab orchestration component for measurements/orders/notes sections.
- `apps/web/components/customers/detail/customer-measurement-dialog.tsx` (new)
  - Extracted measurement dialog wrapper so modal structure is reusable and route page stays thin.
- `apps/web/app/(dashboard)/customers/[id]/page.tsx`
  - Converted to orchestration-only page composing reusable customer detail sections and dialogs.
  - Added explicit not-found empty state instead of rendering `null`.

### Garment detail decomposition (`apps/web/app/(dashboard)/settings/garments/[id]/page.tsx`)
- `apps/web/hooks/use-garment-detail-page.ts` (new)
  - Extracted garment detail orchestration for:
    - garment + branches loading
    - create-rate dialog open state
    - rate create + detail refresh flow.
- `apps/web/components/config/garments/detail/garment-detail-skeleton.tsx` (new)
  - Added reusable garment detail loading skeleton.
- `apps/web/components/config/garments/detail/garment-detail-not-found.tsx` (new)
  - Added reusable not-found state for missing garment detail.
- `apps/web/components/config/garments/detail/garment-detail-header.tsx` (new)
  - Extracted header/back/actions block and replaced inert edit button with actionable “Manage Garments” link.
- `apps/web/components/config/garments/detail/garment-analytics-stats-grid.tsx` (new)
  - Extracted analytics KPI card grid.
- `apps/web/components/config/garments/detail/garment-overview-card.tsx` (new)
  - Extracted overview + pricing analysis card.
- `apps/web/components/config/garments/detail/garment-measurement-forms-card.tsx` (new)
  - Extracted connected measurement forms section with reusable empty state content.
- `apps/web/components/config/garments/detail/garment-pricing-logs-card.tsx` (new)
  - Extracted pricing timeline card.
- `apps/web/components/config/garments/detail/garment-pricing-sidebar.tsx` (new)
  - Extracted global pricing and top-tailors sidebar panels.
- `apps/web/components/config/garments/detail/garment-rates-section.tsx` (new)
  - Extracted rates list/update-rate dialog orchestration section.
- `apps/web/app/(dashboard)/settings/garments/[id]/page.tsx`
  - Converted to orchestration-only page composing extracted detail sections.

### Tracking + manifest updates
- `docs/frontend-page-decomposition-tracker.md`
  - Marked customer detail and garment detail routes as `DN` and moved queue to next pending pages.
- `docs/refactor-manifest.csv`
  - Regenerated and marked all pass-touched customer/garment decomposition files as `DN` with note `Fifteenth modernization pass`.
- `docs/refactor-status.md`
  - Updated checkpoint to “After Fifteenth Implementation Pass” and refreshed Phase 5 counts/notes.
- `docs/refactor-edit-log.md`
  - Appended this Pass 15 section so every edit remains centralized in one file.

### Verification run after edits
- `npm run lint -w web` ✅
- `./scripts/verify-refactor-manifest.sh` ✅
- `npx tsc -p apps/web/tsconfig.json --noEmit` ⚠️ still reports only pre-existing unrelated type issues in `apps/web/components/ui/typography.tsx` and `apps/web/middleware.ts`
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-03 — Pass 16 (Frontend page decomposition: employees list + reports)

### Employees list decomposition (`apps/web/app/(dashboard)/employees/page.tsx`)
- `apps/web/hooks/use-employees-page.ts` (new)
  - Extracted employees list orchestration for:
    - paginated/searchable employee fetching
    - debounced search behavior
    - add-dialog open state
    - list reset/filter state.
- `apps/web/components/employees/list/employees-list-toolbar.tsx` (new)
  - Extracted reusable list toolbar with search + reset control and active-filter-aware reset disabling.
- `apps/web/components/employees/list/employees-list-table.tsx` (new)
  - Extracted reusable employee table section with standardized status/designation/contact rendering and row action handling.
- `apps/web/app/(dashboard)/employees/page.tsx`
  - Converted route to orchestration-only composition using extracted hook + toolbar/table sections.

### Reports decomposition (`apps/web/app/(dashboard)/reports/page.tsx`)
- `apps/web/hooks/use-reports-page.ts` (new)
  - Extracted reports orchestration for:
    - summary loading for date range
    - date-range state updates
    - export generation/download flow
    - weekly print PDF generation/download flow.
- `apps/web/components/reports/reports-date-range-card.tsx` (new)
  - Extracted reusable date-range controls card.
- `apps/web/components/reports/reports-insights-section.tsx` (new)
  - Extracted reusable loading + analytics chart section.
- `apps/web/components/reports/reports-export-grid.tsx` (new)
  - Extracted reusable export cards grid with loading-aware button labels.
- `apps/web/components/reports/reports-weekly-print-card.tsx` (new)
  - Extracted weekly print export action card.
- `apps/web/app/(dashboard)/reports/page.tsx`
  - Converted route to orchestration-only composition with extracted report sections.

### Tracking + manifest updates
- `docs/frontend-page-decomposition-tracker.md`
  - Marked employees list and reports routes as `DN` and advanced queue to remaining pending pages.
- `docs/refactor-manifest.csv`
  - Regenerated and marked all pass-touched employees/reports decomposition files as `DN` with note `Sixteenth modernization pass`.
- `docs/refactor-status.md`
  - Updated checkpoint to “After Sixteenth Implementation Pass” and refreshed Phase 5 counts/notes.
- `docs/refactor-edit-log.md`
  - Appended this Pass 16 section so every edit remains centralized in one file.

### Verification run after edits
- `npm run lint -w web` ✅
- `./scripts/verify-refactor-manifest.sh` ✅
- `npx tsc -p apps/web/tsconfig.json --noEmit` ⚠️ still reports only pre-existing unrelated type issues in `apps/web/components/ui/typography.tsx` and `apps/web/middleware.ts`
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-03 — Pass 17 (Frontend page decomposition: my-orders + login)

### My-orders decomposition (`apps/web/app/(dashboard)/my-orders/page.tsx`)
- `apps/web/hooks/use-my-orders-page.ts` (new)
  - Extracted my-orders orchestration for:
    - assigned-items fetching
    - client-side search filtering
    - clear-search behavior
    - refresh state handling.
- `apps/web/components/orders/my-orders-toolbar.tsx` (new)
  - Extracted reusable search toolbar with total/filtered count badge and clear-search reset behavior.
- `apps/web/components/orders/my-orders-table.tsx` (new)
  - Extracted reusable assigned-items table section with shared status labels/badges and due-date/rate rendering.
- `apps/web/app/(dashboard)/my-orders/page.tsx`
  - Converted route to orchestration-only composition using extracted hook + toolbar/table sections.

### Login decomposition (`apps/web/app/login/page.tsx`)
- `apps/web/hooks/use-login-page.ts` (new)
  - Extracted login orchestration for:
    - session redirect handling
    - credential form state
    - password-visibility toggle
    - sign-in submission + toast feedback.
- `apps/web/components/auth/login-brand-panel.tsx` (new)
  - Extracted reusable branding/marketing left panel.
- `apps/web/components/auth/login-form-panel.tsx` (new)
  - Extracted reusable credential form panel and footer.
  - Replaced placeholder `Forgot Password` hash link with real support contact link (`mailto:${siteConfig.contact.email}`).
- `apps/web/app/login/page.tsx`
  - Converted route to orchestration-only composition using extracted auth panels + hook.

### Tracking + manifest updates
- `scripts/generate-refactor-manifest.sh`
  - Added `apps/web/components/auth/*` to Phase 5 (`web-domains`) classification.
- `docs/frontend-page-decomposition-tracker.md`
  - Marked my-orders and login routes as `DN` and advanced queue to remaining pending pages.
- `docs/refactor-manifest.csv`
  - Regenerated and marked all pass-touched my-orders/login decomposition files as `DN` with note `Seventeenth modernization pass`.
- `docs/refactor-status.md`
  - Updated checkpoint to “After Seventeenth Implementation Pass” and refreshed Phase 5 counts/notes.
- `docs/refactor-edit-log.md`
  - Appended this Pass 17 section so every edit remains centralized in one file.

### Verification run after edits
- `npm run lint -w web` ✅
- `./scripts/verify-refactor-manifest.sh` ✅
- `npx tsc -p apps/web/tsconfig.json --noEmit` ⚠️ still reports only pre-existing unrelated type issues in `apps/web/components/ui/typography.tsx` and `apps/web/middleware.ts`
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-03 — Pass 18 (Frontend page decomposition: public status + design types)

### Public order status decomposition (`apps/web/app/status/[token]/page.tsx`)
- `apps/web/hooks/use-public-order-status-page.ts` (new)
  - Extracted public status orchestration for:
    - PIN state + validation
    - token/PIN verification request flow
    - submitted/order/error/loading state management
    - resolved public status label/icon/variant mapping.
- `apps/web/components/status/status-pin-gate-card.tsx` (new)
  - Extracted reusable public PIN entry gate section.
- `apps/web/components/status/status-order-header-card.tsx` (new)
  - Extracted status hero card (order number + status badge/icon).
- `apps/web/components/status/status-order-details-card.tsx` (new)
  - Extracted order details summary card.
- `apps/web/components/status/status-order-items-card.tsx` (new)
  - Extracted itemized order list card.
- `apps/web/app/status/[token]/page.tsx`
  - Converted route to orchestration-only composition using extracted hook + status sections.

### Design types decomposition (`apps/web/app/(dashboard)/settings/design-types/page.tsx`)
- `apps/web/hooks/use-design-types-page.ts` (new)
  - Extracted design-types orchestration for:
    - design types/garments/branches loading
    - create/edit dialog state
    - remove flow state + refresh handling
    - create/update/remove success/error toasts.
- `apps/web/components/design-types/design-types-page-header.tsx` (new)
  - Extracted reusable header section with back/add actions.
- `apps/web/components/design-types/design-types-table.tsx` (new)
  - Extracted reusable design-types table with garment/branch mapping and edit/remove actions.
- `apps/web/app/(dashboard)/settings/design-types/page.tsx`
  - Converted route to orchestration-only composition using extracted hook + header/table sections.
  - Replaced browser `confirm()` delete flow with shared `ConfirmDialog` for consistent destructive-action UX.

### Tracking + manifest updates
- `scripts/generate-refactor-manifest.sh`
  - Added `apps/web/components/status/*` and `apps/web/hooks/use-public-order-status-page.ts` to Phase 7 (`reporting-public-status`) classification.
- `docs/frontend-page-decomposition-tracker.md`
  - Marked status and design-types routes as `DN`; queue now contains only remaining pages.
- `docs/refactor-manifest.csv`
  - Regenerated and marked all pass-touched public-status/design-types decomposition files as `DN` with note `Eighteenth modernization pass`.
- `docs/refactor-status.md`
  - Updated checkpoint to “After Eighteenth Implementation Pass” and refreshed Phase 5/7 snapshot counts.
- `docs/refactor-edit-log.md`
  - Appended this Pass 18 section so every edit remains centralized in one file.

### Verification run after edits
- `npm run lint -w web` ✅
- `./scripts/verify-refactor-manifest.sh` ✅
- `npx tsc -p apps/web/tsconfig.json --noEmit` ⚠️ still reports only pre-existing unrelated type issues in `apps/web/components/ui/typography.tsx` and `apps/web/middleware.ts`
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-03 — Pass 19 (Frontend page decomposition: rates + unauthorized)

### Rates decomposition (`apps/web/app/(dashboard)/settings/rates/page.tsx`)
- `apps/web/hooks/use-rates-page.ts` (new)
  - Extracted rates page orchestration for:
    - paginated/searchable rates loading
    - garments/branches dependency loading
    - create-rate dialog state
    - create-rate action + refresh flow.
- `apps/web/components/rates/rates-page-header.tsx` (new)
  - Extracted reusable header section with back/create actions.
- `apps/web/components/rates/rates-search-stats.tsx` (new)
  - Extracted reusable search + stats section with reset behavior.
- `apps/web/components/rates/rates-table.tsx` (new)
  - Extracted reusable rates table section with branch/effective-date formatting.
- `apps/web/app/(dashboard)/settings/rates/page.tsx`
  - Converted route to orchestration-only composition using extracted hook + reusable sections.

### Unauthorized page standardization (`apps/web/app/unauthorized/page.tsx`)
- `apps/web/components/auth/auth-state-card.tsx` (new)
  - Added reusable auth-state primitive for access and permission boundary pages.
- `apps/web/app/unauthorized/page.tsx`
  - Replaced standalone markup with `AuthStateCard` composition for consistent auth-state UX.

### Tracking + manifest updates
- `docs/frontend-page-decomposition-tracker.md`
  - Marked rates and unauthorized pages as `DN`; decomposition queue now fully cleared.
- `docs/refactor-manifest.csv`
  - Regenerated and marked all pass-touched rates/unauthorized decomposition files as `DN` with note `Nineteenth modernization pass`.
- `docs/refactor-status.md`
  - Updated checkpoint to “After Nineteenth Implementation Pass” and refreshed Phase 5 snapshot count.
- `docs/refactor-edit-log.md`
  - Appended this Pass 19 section so every edit remains centralized in one file.

### Verification run after edits
- `npm run lint -w web` ✅
- `./scripts/verify-refactor-manifest.sh` ✅
- `npx tsc -p apps/web/tsconfig.json --noEmit` ⚠️ still reports only pre-existing unrelated type issues in `apps/web/components/ui/typography.tsx` and `apps/web/middleware.ts`
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-03 — Pass 20 (TypeScript stabilization + users module decomposition)

### Frontend TypeScript stabilization
- `apps/web/middleware.ts`
  - Replaced tuple-based admin `includes` check with explicit role guards (`isKnownRole`, `isAdminRole`) so middleware role handling remains type-safe while preserving existing route behavior.
  - Removed unsafe casts when resolving `DEFAULT_HOME_BY_ROLE`.
- `apps/web/components/ui/typography.tsx`
  - Restricted polymorphic `as` prop to supported text-oriented HTML tags to avoid SVG intrinsic prop incompatibilities in strict TypeScript mode.

### Users settings module decomposition (`apps/web/components/config/UsersTable.tsx`)
- `apps/web/hooks/use-users-page.ts` (new)
  - Extracted full user-management orchestration for:
    - users/branches/stats loading
    - create/edit dialog state and payload submission
    - delete confirmation flow
    - active/inactive toggle flow
    - search + role filter UX with reset behavior.
- `apps/web/components/config/users/users-page-header.tsx` (new)
  - Extracted reusable header/action section.
- `apps/web/components/config/users/users-stats-grid.tsx` (new)
  - Extracted reusable stats cards section.
- `apps/web/components/config/users/users-list-toolbar.tsx` (new)
  - Extracted reusable search + role filter toolbar with clear filter controls and shown/total counters.
- `apps/web/components/config/users/users-access-table.tsx` (new)
  - Extracted reusable users access table with role/badge rendering and edit/delete/toggle actions.
- `apps/web/components/config/users/user-account-dialog.tsx` (new)
  - Extracted reusable create/edit account dialog.
- `apps/web/components/config/UsersTable.tsx`
  - Converted to orchestration-only composition using extracted hook + reusable sections/dialog.

### Tracking + manifest updates
- `docs/frontend-page-decomposition-tracker.md`
  - Updated settings/users note to reflect Pass 20 backing-module decomposition completion.
- `docs/refactor-manifest.csv`
  - Regenerated and marked all pass-touched users-module and TS-stabilization files as `DN` with note `Twentieth modernization pass`.
- `docs/refactor-status.md`
  - Updated checkpoint to “After Twentieth Implementation Pass” and refreshed web verification notes.
- `docs/refactor-edit-log.md`
  - Appended this Pass 20 section so every edit remains centralized in one file.

### Verification run after edits
- `npm run lint -w web` ✅
- `npx tsc -p apps/web/tsconfig.json --noEmit` ✅
- `./scripts/verify-refactor-manifest.sh` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-03 — Pass 21 (Branches module decomposition)

### Branch settings module decomposition (`apps/web/components/config/BranchesTable.tsx`)
- `apps/web/hooks/use-branches-page.ts` (new)
  - Extracted branches-page orchestration for:
    - debounced search and pagination state
    - branches loading and total-count synchronization
    - create/edit form dialog state and save flow
    - delete confirmation flow
    - branch active/inactive toggle flow.
- `apps/web/components/config/branches/branches-page-header.tsx` (new)
  - Extracted reusable page header and create action section.
- `apps/web/components/config/branches/branches-list-toolbar.tsx` (new)
  - Extracted reusable location-directory toolbar with search and reset-filters controls.
- `apps/web/components/config/branches/branches-directory-table.tsx` (new)
  - Extracted reusable paginated branches table with actions menu (manage, edit, activate/deactivate, delete).
- `apps/web/components/config/branches/branch-form-dialog.tsx` (new)
  - Extracted reusable create/edit branch form dialog based on `ScrollableDialog`.
- `apps/web/components/config/branches/branch-delete-summary.tsx` (new)
  - Extracted reusable delete-impact summary content for destructive confirmation UX.
- `apps/web/components/config/BranchesTable.tsx`
  - Converted to orchestration-only composition using extracted hook + reusable branches sections/dialogs.

### Tracking + manifest updates
- `docs/frontend-page-decomposition-tracker.md`
  - Updated settings/branches note to reflect Pass 21 backing-module decomposition completion.
- `docs/refactor-manifest.csv`
  - Regenerated and marked all pass-touched branches decomposition files as `DN` with note `Twenty-first modernization pass`.
- `docs/refactor-status.md`
  - Updated checkpoint to “After Twenty-first Implementation Pass” and refreshed Phase 5 manifest snapshot count.
- `docs/refactor-edit-log.md`
  - Appended this Pass 21 section so every edit remains centralized in one file.

### Verification run after edits
- `npm run lint -w web` ✅
- `npx tsc -p apps/web/tsconfig.json --noEmit` ✅
- `./scripts/verify-refactor-manifest.sh` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-03 — Pass 22 (Customer module decomposition)

### Customer settings/list module decomposition (`apps/web/components/customers/CustomerTable.tsx`)
- `apps/web/hooks/use-customers-page.ts` (new)
  - Extracted customers-page orchestration for:
    - debounced fetch lifecycle
    - search/status filter state and reset behavior
    - paginated customers listing state
    - create/edit dialog state.
- `apps/web/components/customers/list/customers-page-header.tsx` (new)
  - Extracted reusable customer page header + add action.
- `apps/web/components/customers/list/customers-list-toolbar.tsx` (new)
  - Extracted reusable customer search + status filter + reset controls.
- `apps/web/components/customers/list/customers-directory-table.tsx` (new)
  - Extracted reusable customer directory table with status badges, VIP markers, and view/edit row actions.
- `apps/web/components/customers/CustomerTable.tsx`
  - Converted to orchestration-only composition using extracted hook + reusable customer list sections.

### UX consistency updates
- Customer row click now opens customer detail directly, with action buttons preserving explicit view/edit controls.
- Filter reset button is now disabled unless a non-default filter is active.

### Tracking + manifest updates
- `docs/frontend-page-decomposition-tracker.md`
  - Updated customers page note to reflect Pass 22 backing-module decomposition completion.
- `docs/refactor-manifest.csv`
  - Regenerated and marked all pass-touched customer decomposition files as `DN` with note `Twenty-second modernization pass`.
- `docs/refactor-status.md`
  - Updated checkpoint to “After Twenty-second Implementation Pass” and refreshed Phase 5 manifest snapshot count.
- `docs/refactor-edit-log.md`
  - Appended this Pass 22 section so every edit remains centralized in one file.

### Verification run after edits
- `npm run lint -w web` ✅
- `npx tsc -p apps/web/tsconfig.json --noEmit` ✅
- `./scripts/verify-refactor-manifest.sh` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-03 — Pass 23 (Garments module decomposition)

### Garments settings/list module decomposition (`apps/web/components/config/GarmentTypesTable.tsx`)
- `apps/web/hooks/use-garment-types-page.ts` (new)
  - Extracted garments-page orchestration for:
    - debounced search and pagination state
    - garment types loading + total-count synchronization
    - create/edit dialog state
    - history/workflow dialog state
    - delete confirmation flow.
- `apps/web/components/config/garments/list/garment-types-page-header.tsx` (new)
  - Extracted reusable garments page header and add action section.
- `apps/web/components/config/garments/list/garment-types-list-toolbar.tsx` (new)
  - Extracted reusable search toolbar with reset behavior and results summary.
- `apps/web/components/config/garments/list/garment-types-inventory-table.tsx` (new)
  - Extracted reusable inventory table with edit/history/workflow/delete row actions.
- `apps/web/components/config/GarmentTypesTable.tsx`
  - Converted to orchestration-only composition using extracted hook + reusable list sections.

### UX + correctness improvements
- Fixed delete-confirm messaging to use the actual deletion target (`typeToDelete`) so the confirmation text always matches the selected garment.
- Added filter reset disabling when no filter is active for clearer interaction feedback.

### Tracking + manifest updates
- `docs/frontend-page-decomposition-tracker.md`
  - Updated settings/garments note to reflect Pass 23 backing-module decomposition completion.
- `docs/refactor-manifest.csv`
  - Regenerated and marked all pass-touched garments decomposition files as `DN` with note `Twenty-third modernization pass`.
- `docs/refactor-status.md`
  - Updated checkpoint to “After Twenty-third Implementation Pass” and refreshed Phase 5 manifest snapshot count.
- `docs/refactor-edit-log.md`
  - Appended this Pass 23 section so every edit remains centralized in one file.

### Verification run after edits
- `npm run lint -w web` ✅
- `npx tsc -p apps/web/tsconfig.json --noEmit` ✅
- `./scripts/verify-refactor-manifest.sh` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-03 — Pass 24 (Measurement categories module decomposition)

### Measurement settings/list module decomposition (`apps/web/components/config/MeasurementCategoriesTable.tsx`)
- `apps/web/hooks/use-measurement-categories-page.ts` (new)
  - Extracted measurement-categories page orchestration for:
    - debounced search and pagination state
    - categories loading + total count synchronization
    - create/edit dialog state
    - delete confirmation flow.
- `apps/web/components/config/measurements/list/measurement-categories-page-header.tsx` (new)
  - Extracted reusable measurements page header + add action section.
- `apps/web/components/config/measurements/list/measurement-categories-list-toolbar.tsx` (new)
  - Extracted reusable search toolbar with results count and reset behavior.
- `apps/web/components/config/measurements/list/measurement-categories-inventory-table.tsx` (new)
  - Extracted reusable categories table with view/edit/delete actions and row click navigation.
- `apps/web/components/config/MeasurementCategoriesTable.tsx`
  - Converted to orchestration-only composition using extracted hook + reusable list sections.

### UX + correctness improvements
- Fixed delete confirmation text source to use the actual delete target (`categoryToDelete`) instead of the currently selected edit item.
- Added reset button disable behavior when no search filter is active.

### Tracking + manifest updates
- `docs/frontend-page-decomposition-tracker.md`
  - Updated settings/measurements note to reflect Pass 24 backing-module decomposition completion.
- `docs/refactor-manifest.csv`
  - Regenerated and marked all pass-touched measurements decomposition files as `DN` with note `Twenty-fourth modernization pass`.
- `docs/refactor-status.md`
  - Updated checkpoint to “After Twenty-fourth Implementation Pass” and refreshed Phase 5 manifest snapshot count.
- `docs/refactor-edit-log.md`
  - Appended this Pass 24 section so every edit remains centralized in one file.

### Verification run after edits
- `npm run lint -w web` ✅
- `npx tsc -p apps/web/tsconfig.json --noEmit` ✅
- `./scripts/verify-refactor-manifest.sh` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-03 — Pass 25 (Measurement detail module decomposition)

### Measurement detail module decomposition (`apps/web/components/config/MeasurementCategoryDetail.tsx`)
- `apps/web/hooks/use-measurement-category-detail-page.ts` (new)
  - Extracted measurement-category detail orchestration for:
    - category detail loading
    - field create/edit dialog state
    - field delete confirmation flow.
- `apps/web/components/config/measurements/detail/measurement-category-breadcrumbs.tsx` (new)
  - Extracted reusable breadcrumbs section for measurement detail pages.
- `apps/web/components/config/measurements/detail/measurement-category-detail-header.tsx` (new)
  - Extracted reusable detail header + add-field action section.
- `apps/web/components/config/measurements/detail/measurement-fields-table.tsx` (new)
  - Extracted reusable measurement fields table with required/optional indicators and edit/delete actions.
- `apps/web/components/config/MeasurementCategoryDetail.tsx`
  - Converted to orchestration-only composition using extracted hook + reusable detail sections.

### Tracking + manifest updates
- `docs/frontend-page-decomposition-tracker.md`
  - Updated settings/measurements/[id] note to reflect Pass 25 backing-module decomposition completion.
- `docs/refactor-manifest.csv`
  - Regenerated and marked all pass-touched measurement-detail decomposition files as `DN` with note `Twenty-fifth modernization pass`.
- `docs/refactor-status.md`
  - Included Pass 25 in checkpoint rollup.
- `docs/refactor-edit-log.md`
  - Appended this Pass 25 section so every edit remains centralized in one file.

## 2026-03-03 — Pass 26 (Branch hub module decomposition)

### Branch hub module decomposition (`apps/web/components/config/BranchHubConfig.tsx`)
- `apps/web/hooks/use-branch-hub-config-page.ts` (new)
  - Extracted branch-hub orchestration for branch loading and error handling.
- `apps/web/components/config/branches/hub/branch-hub-breadcrumbs.tsx` (new)
  - Extracted reusable branch-hub breadcrumbs section.
- `apps/web/components/config/branches/hub/branch-hub-overview-header.tsx` (new)
  - Extracted reusable branch overview header with contact metadata and status badges.
- `apps/web/components/config/branches/hub/branch-hub-relations-grid.tsx` (new)
  - Extracted reusable relations stats grid (employees/customers/orders).
- `apps/web/components/config/branches/hub/branch-global-pricing-card.tsx` (new)
  - Extracted reusable global-pricing information panel and CTA.
- `apps/web/components/config/branches/hub/branch-hub-skeleton.tsx` (new)
  - Extracted reusable loading skeleton.
- `apps/web/components/config/BranchHubConfig.tsx`
  - Converted to orchestration-only composition using extracted hook + reusable hub sections.

### UX consistency updates
- Replaced remaining raw paragraph text in branch hub pricing panel with shared `Typography` primitive for design-system consistency.

### Tracking + manifest updates
- `docs/frontend-page-decomposition-tracker.md`
  - Updated settings/branches/[id] note to reflect Pass 26 backing-module decomposition completion.
- `docs/refactor-manifest.csv`
  - Regenerated and marked all pass-touched branch-hub decomposition files as `DN` with note `Twenty-sixth modernization pass`.
- `docs/refactor-status.md`
  - Updated checkpoint to “After Twenty-sixth Implementation Pass” and refreshed Phase 5 manifest snapshot count.
- `docs/refactor-edit-log.md`
  - Appended this Pass 26 section so every edit remains centralized in one file.

### Verification run after edits
- `npm run lint -w web` ✅
- `npx tsc -p apps/web/tsconfig.json --noEmit` ✅
- `./scripts/verify-refactor-manifest.sh` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)
