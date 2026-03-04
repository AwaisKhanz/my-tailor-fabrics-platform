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

## 2026-03-03 — Pass 27 (Measurement field dialog decomposition)

### Measurement field dialog decomposition (`apps/web/components/config/MeasurementFieldDialog.tsx`)
- `apps/web/hooks/use-measurement-field-dialog.ts` (new)
  - Extracted dialog orchestration for:
    - form reset and defaulting for create/edit flows
    - duplicate-label validation
    - dropdown option add/remove state
    - submit/create/update API behavior and error handling.
- `apps/web/components/config/measurements/detail/measurement-field-dialog-category-note.tsx` (new)
  - Extracted reusable category context note section.
- `apps/web/components/config/measurements/detail/measurement-field-dialog-basic-fields.tsx` (new)
  - Extracted reusable label/type/unit form section.
- `apps/web/components/config/measurements/detail/measurement-field-dialog-dropdown-options.tsx` (new)
  - Extracted reusable dropdown-options editor section with inline option adder.
- `apps/web/components/config/measurements/detail/measurement-field-dialog-required-toggle.tsx` (new)
  - Extracted reusable required-field toggle section.
- `apps/web/components/config/MeasurementFieldDialog.tsx`
  - Converted to orchestration-only composition using extracted hook + reusable dialog sections.

### UX consistency updates
- Replaced raw informational paragraph text with shared `Typography` primitives in dialog sections.
- Preserved inline “add option” UX while moving it into reusable dialog-section composition.

### Tracking + manifest updates
- `docs/frontend-page-decomposition-tracker.md`
  - Updated settings/measurements/[id] note to include Pass 27 dialog decomposition completion.
- `docs/refactor-manifest.csv`
  - Regenerated and marked all pass-touched measurement-field dialog files as `DN` with note `Twenty-seventh modernization pass`.
- `docs/refactor-status.md`
  - Updated checkpoint to “After Twenty-seventh Implementation Pass” and refreshed Phase 5 manifest snapshot counts.
- `docs/refactor-edit-log.md`
  - Appended this Pass 27 section so every edit remains centralized in one file.

### Verification run after edits
- `npm run lint -w web` ✅
- `npx tsc -p apps/web/tsconfig.json --noEmit` ✅
- `./scripts/verify-refactor-manifest.sh` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-03 — Pass 28 (Employee dialog consistency decomposition)

### Employee dialog decomposition (`apps/web/components/employees/EmployeeDialog.tsx`)
- `apps/web/hooks/use-employee-dialog.ts` (new)
  - Extracted employee dialog orchestration for:
    - create/edit form reset behavior
    - payload normalization for strict backend DTO expectations
    - submit/create/update API behavior and toast feedback.
- `apps/web/components/employees/dialog/employee-dialog-primary-fields.tsx` (new)
  - Extracted reusable primary identity/contact fields section.
- `apps/web/components/employees/dialog/employee-dialog-work-fields.tsx` (new)
  - Extracted reusable role/status/payment/joining fields section.
- `apps/web/components/employees/dialog/employee-dialog-contact-fields.tsx` (new)
  - Extracted reusable personal/emergency details section with shared typography heading.
- `apps/web/components/employees/EmployeeDialog.tsx`
  - Converted to orchestration-only composition using extracted hook + reusable dialog sections.

### Consistency improvements across app patterns
- Standardized employee dialog form controls to shared premium variants (`Input`, `SelectTrigger`, labels) to match other recently modernized dialogs.
- Replaced ad-hoc section heading markup with shared `Typography` primitive in dialog sections.

### Tracking + manifest updates
- `docs/frontend-page-decomposition-tracker.md`
  - Updated employees page note to include Pass 28 dialog decomposition completion.
- `docs/refactor-manifest.csv`
  - Regenerated and marked all pass-touched employee dialog files as `DN` with note `Twenty-eighth modernization pass`.
- `docs/refactor-status.md`
  - Updated checkpoint to “After Twenty-eighth Implementation Pass” and refreshed Phase 5 manifest snapshot counts.
- `docs/refactor-edit-log.md`
  - Appended this Pass 28 section so every edit remains centralized in one file.

### Verification run after edits
- `npm run lint -w web` ✅
- `npx tsc -p apps/web/tsconfig.json --noEmit` ✅
- `./scripts/verify-refactor-manifest.sh` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-03 — Pass 29 (Customer dialog consistency decomposition)

### Customer dialog decomposition (`apps/web/components/customers/CustomerDialog.tsx`)
- `apps/web/hooks/use-customer-dialog.ts` (new)
  - Extracted customer dialog orchestration for:
    - create/edit form reset behavior
    - create payload branch-assignment logic for super-admin context
    - submit/create/update API behavior and toast feedback.
- `apps/web/components/customers/dialog/customer-dialog-primary-fields.tsx` (new)
  - Extracted reusable customer identity/contact section (name, phone, WhatsApp).
- `apps/web/components/customers/dialog/customer-dialog-meta-fields.tsx` (new)
  - Extracted reusable customer metadata section (email, city, status).
- `apps/web/components/customers/dialog/customer-dialog-address-field.tsx` (new)
  - Extracted reusable customer address section.
- `apps/web/components/customers/CustomerDialog.tsx`
  - Converted to orchestration-only composition using extracted hook + reusable dialog sections.

### Consistency + type-safety follow-ups in touched areas
- `apps/web/hooks/use-order-form-page.ts`
  - Replaced tuple `includes` cast with explicit admin-role type guard for strict typing consistency with middleware role-check pattern.
- `apps/web/lib/api/payments.ts`
  - Added explicit legacy-payment-history type guard and narrowed normalization return typing for consistent API client contract handling.

### Tracking + manifest updates
- `docs/frontend-page-decomposition-tracker.md`
  - Updated customers page note to include Pass 29 dialog decomposition completion.
- `docs/refactor-manifest.csv`
  - Regenerated and marked all pass-touched customer-dialog and type-safety follow-up files as `DN` with note `Twenty-ninth modernization pass`.
- `docs/refactor-status.md`
  - Updated checkpoint to “After Twenty-ninth Implementation Pass” and refreshed Phase 3/5 manifest snapshot counts.
- `docs/refactor-edit-log.md`
  - Appended this Pass 29 section so every edit remains centralized in one file.

### Verification run after edits
- `npm run lint -w web` ✅
- `npx tsc -p apps/web/tsconfig.json --noEmit` ✅
- `./scripts/verify-refactor-manifest.sh` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-03 — Pass 30 (Design-type dialog consistency decomposition)

### Design-type dialog decomposition (`apps/web/components/design-types/CreateDesignTypeDialog.tsx`)
- `apps/web/hooks/use-design-type-dialog.ts` (new)
  - Extracted design-type dialog orchestration for:
    - create/edit form reset behavior
    - scoped field normalization (`ALL` -> `null`) for garment/branch selectors
    - submit lifecycle handling and post-save close behavior.
- `apps/web/components/design-types/dialog/design-type-dialog-basic-fields.tsx` (new)
  - Extracted reusable design name + pricing/rate fields section.
- `apps/web/components/design-types/dialog/design-type-dialog-scope-fields.tsx` (new)
  - Extracted reusable garment/branch scope selectors section.
- `apps/web/components/design-types/dialog/design-type-dialog-sort-field.tsx` (new)
  - Extracted reusable sort-order field section.
- `apps/web/components/design-types/CreateDesignTypeDialog.tsx`
  - Converted to orchestration-only composition using extracted hook + reusable dialog sections.

### Consistency improvements across the app
- Migrated design-type dialog to shared `ScrollableDialog` pattern used by other modernized dialogs.
- Standardized form controls to premium variants and shared form primitives (`FormLabel`, `SelectTrigger`, `Input`) for cross-module visual/behavior consistency.
- Replaced ad-hoc description markup with shared `Typography` primitive.

### Tracking + manifest updates
- `docs/frontend-page-decomposition-tracker.md`
  - Updated design-types page note to include Pass 30 dialog decomposition completion.
- `docs/refactor-manifest.csv`
  - Regenerated and marked all pass-touched design-type dialog files as `DN` with note `Thirtieth modernization pass`.
- `docs/refactor-status.md`
  - Updated checkpoint to “After Thirtieth Implementation Pass” and refreshed Phase 5 manifest snapshot counts.
- `docs/refactor-edit-log.md`
  - Appended this Pass 30 section so every edit remains centralized in one file.

### Verification run after edits
- `npm run lint -w web` ✅
- `npx tsc -p apps/web/tsconfig.json --noEmit` ✅
- `./scripts/verify-refactor-manifest.sh` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-03 — Pass 31 (Task assignment dialog consistency decomposition)

### Task-assignment dialog decomposition (`apps/web/app/(dashboard)/orders/[id]/TaskAssignmentDialog.tsx`)
- `apps/web/hooks/use-task-assignment-dialog.ts` (new)
  - Extracted task-assignment orchestration for:
    - task sorting
    - employee assignment updates
    - task status updates
    - task rate override edit/submit lifecycle.
- `apps/web/components/orders/task-assignment/task-assignment-table.tsx` (new)
  - Extracted reusable task-assignment table section containing step/assignee/status/rate columns and inline rate editing controls.
- `apps/web/app/(dashboard)/orders/[id]/TaskAssignmentDialog.tsx`
  - Converted to orchestration-only composition using extracted hook + reusable task table.
  - Standardized dialog shell to shared `ScrollableDialog` for consistent modal structure.

### Shared-type consistency improvements
- Switched `employees` prop typing from local inline shape to shared type composition: `Array<Pick<Employee, "id" | "fullName">>`.
- Kept task/status typing fully canonical through `@tbms/shared-types` and shared status labels from `@tbms/shared-constants`.

### Tracking + manifest updates
- `docs/frontend-page-decomposition-tracker.md`
  - Updated orders detail note to include Pass 31 task-assignment decomposition completion.
- `docs/refactor-manifest.csv`
  - Regenerated and marked all pass-touched task-assignment files as `DN` with note `Thirty-first modernization pass`.
- `docs/refactor-status.md`
  - Updated checkpoint to “After Thirty-first Implementation Pass” and refreshed Phase 5 manifest snapshot counts.
- `docs/refactor-edit-log.md`
  - Appended this Pass 31 section so every edit remains centralized in one file.

### Verification run after edits
- `npm run lint -w web` ✅
- `npx tsc -p apps/web/tsconfig.json --noEmit` ✅
- `./scripts/verify-refactor-manifest.sh` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-03 — Pass 32 (Measurement category dialog consistency decomposition)

### Measurement category dialog decomposition (`apps/web/components/config/MeasurementCategoryDialog.tsx`)
- `apps/web/hooks/use-measurement-category-dialog.ts` (new)
  - Extracted dialog orchestration for:
    - create/edit form reset behavior
    - submit/create/update API behavior
    - loading state and toast lifecycle.
  - Uses canonical shared contract types (`MeasurementCategory`, `CreateMeasurementCategoryInput`, `UpdateMeasurementCategoryInput`) from `@tbms/shared-types`.
- `apps/web/components/config/measurements/dialog/measurement-category-dialog-name-field.tsx` (new)
  - Extracted reusable category-name form section.
- `apps/web/components/config/MeasurementCategoryDialog.tsx`
  - Converted to orchestration-only composition using extracted hook + reusable dialog section.

### Consistency improvements across app patterns
- Standardized measurement category dialog to the same lightweight modern dialog pattern used in recent passes:
  - shared `ScrollableDialog` shell
  - shared `Form` primitives
  - premium input/label variants.
- Kept implementation intentionally simple (single hook + single field section) to avoid over-complexity while preserving consistency.

### Tracking + manifest updates
- `docs/frontend-page-decomposition-tracker.md`
  - Updated settings/measurements note to include Pass 32 category-dialog decomposition completion.
- `docs/refactor-manifest.csv`
  - Regenerated and marked all pass-touched measurement-category dialog files as `DN` with note `Thirty-second modernization pass`.
- `docs/refactor-status.md`
  - Updated checkpoint to “After Thirty-second Implementation Pass” and refreshed Phase 5 manifest snapshot counts.
- `docs/refactor-edit-log.md`
  - Appended this Pass 32 section so every edit remains centralized in one file.

### Verification run after edits
- `npm run lint -w web` ✅
- `npx tsc -p apps/web/tsconfig.json --noEmit` ✅
- `./scripts/verify-refactor-manifest.sh` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-03 — Pass 33 (Reports analytics decomposition + Phase 5 manifest closure)

### Reports analytics decomposition (`apps/web/components/reports/DesignAnalyticsCharts.tsx`)
- `apps/web/components/reports/reports-design-popularity-card.tsx` (new)
  - Extracted reusable design popularity card section with shared `Typography`/`Label` primitives and progress-bar visualization.
- `apps/web/components/reports/reports-addon-categories-card.tsx` (new)
  - Extracted reusable addon categories card section with standardized empty state and explicit total addon value footer.
- `apps/web/components/reports/reports-financial-summary-card.tsx` (new)
  - Extracted reusable financial summary card section with consistent stat typography and badge usage.
- `apps/web/components/reports/DesignAnalyticsCharts.tsx`
  - Converted into a lightweight orchestrator composed from the extracted reusable analytics cards.
  - Switched analytics type imports to canonical shared contracts from `@tbms/shared-types`.
  - Removed hardcoded comparative claim (`+8.4% vs last period`) and replaced with neutral selected-range summary text.
- `apps/web/components/orders/my-orders-toolbar.tsx`
  - Applied a lint-gate consistency fix by wiring `totalCount` into `TableToolbar` (`visibleCount`) so the prop is no longer dead and toolbar count semantics stay correct when filters are active.

### Phase 5 manifest completion (`docs/refactor-manifest.csv`)
- Marked reports analytics files as `DN` with note `Thirty-third modernization pass`.
- Marked `apps/web/components/orders/my-orders-toolbar.tsx` as `DN` with note `Thirty-third modernization pass` for the lint-driven follow-up.
- Reviewed and marked thin wrapper pages as `NJ` with explicit reasons:
  - `apps/web/app/(dashboard)/customers/page.tsx`
  - `apps/web/app/(dashboard)/settings/page.tsx`
  - `apps/web/app/(dashboard)/settings/branches/page.tsx`
  - `apps/web/app/(dashboard)/settings/branches/[id]/page.tsx`
  - `apps/web/app/(dashboard)/settings/garments/page.tsx`
  - `apps/web/app/(dashboard)/settings/measurements/page.tsx`
  - `apps/web/app/(dashboard)/settings/measurements/[id]/page.tsx`
  - `apps/web/app/(dashboard)/settings/users/page.tsx`
- Reviewed and marked non-page utility/leaf items as `NJ` with explicit reasons:
  - `apps/web/components/rates/RatesList.tsx`
  - `apps/web/hooks/use-debounce.ts`
  - `apps/web/hooks/use-toast.ts`
- Result: Phase 5 manifest rows are now fully covered as `DN`/`NJ` with `NS=0`.

### Tracking updates
- `docs/frontend-page-decomposition-tracker.md`
  - Updated reports page note to include Pass 33 insights-chart decomposition completion.
- `docs/refactor-status.md`
  - Updated checkpoint to “After Thirty-third Implementation Pass”.
  - Updated Phase 5 ledger status to `DN` and refreshed manifest snapshot counts.
- `docs/refactor-edit-log.md`
  - Appended this Pass 33 section so every edit remains centralized in one file.

### Verification run after edits
- `npm run lint -w web` ✅
- `npx tsc -p apps/web/tsconfig.json --noEmit` ✅
- `./scripts/verify-refactor-manifest.sh` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-03 — Pass 34 (Backend payroll disbursement hardening)

### Payments domain hardening (`apps/api/src/payments/*`)
- `apps/api/src/payments/payments.service.ts`
  - Refactored `disbursePay` to enforce branch-safe behavior and atomic payroll mutation:
    - validates target employee exists and is not soft-deleted
    - enforces branch scope (`actorBranchId` cannot disburse across branches)
    - executes balance check + payment create + ledger payout entry inside a single serializable transaction
    - retries transient serialization conflicts (`P2034`) with bounded retries and returns a clear conflict error on exhaustion.
  - Added helper utilities for safer payment-history query handling:
    - date parsing with invalid-input guard and end-of-day handling for `YYYY-MM-DD`
    - whitelist-based `sortBy` resolution (`paidAt`, `createdAt`, `amount`)
    - normalized pagination guards (positive page/limit with max cap).
- `apps/api/src/payments/payments.controller.ts`
  - Fixed branch context source for disbursement by passing `req.branchId` (BranchGuard-scoped context) instead of `req.user.branchId`.

### Ledger integration update
- `apps/api/src/ledger/ledger.service.ts`
  - Extended `createEntry` to accept an optional transaction client so payment + ledger writes can be committed atomically in one database transaction.

### Manifest updates (`docs/refactor-manifest.csv`)
- Marked backend hardening files as `DN` with note `Thirty-fourth modernization pass`:
  - `apps/api/src/payments/payments.service.ts`
  - `apps/api/src/payments/payments.controller.ts`
  - `apps/api/src/ledger/ledger.service.ts`
- Reviewed and marked unchanged files as `NJ` with explicit reasons:
  - `apps/api/src/payments/dto/payment.dto.ts` (`DTO already minimal and valid; no additional hardening needed this pass`)
  - `apps/api/src/payments/payments.module.ts` (`Module wiring remains correct after service/controller hardening`)

### Tracking updates
- `docs/refactor-status.md`
  - Updated checkpoint to “After Thirty-fourth Implementation Pass”.
  - Updated Phase 6 note and refreshed manifest snapshot counts.
- `docs/refactor-edit-log.md`
  - Appended this Pass 34 section so every edit remains centralized in one file.

### Verification run after edits
- `npx tsc -p apps/api/tsconfig.json --noEmit` ✅
- `npm run lint -w web` ✅
- `./scripts/verify-refactor-manifest.sh` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-04 — Pass 41 (Backend RBAC explicitness and secure endpoint hardening)

### Explicit role coverage and guard hardening
- `apps/api/src/common/guards/roles.guard.ts`
  - Changed non-public default from allow to deny when no `@Roles(...)` metadata exists.
  - Result: every protected handler must now declare explicit role policy.
- `apps/api/src/app.controller.ts`
  - Marked root `GET /` endpoint as `@Public()` to keep health/basic root access explicit under deny-by-default role guard.
- `apps/api/src/auth/auth.controller.ts`
  - Added `@Roles(...ALL_ROLES)` to authenticated identity endpoints (`POST /auth/logout`, `GET /auth/me`) so policy is explicit instead of implied by guard-only protection.

### Controller policy completion for previously implicit endpoints
- `apps/api/src/config/config.controller.ts`
  - Added explicit role decorators to previously implicit reads:
    - `GET /config/settings` -> `OPERATOR_ROLES`
    - `GET /config/garment-types` -> `OPERATOR_ROLES`
    - `GET /config/garment-types/:id` -> `OPERATOR_ROLES`
    - `GET /config/measurement-categories` -> `OPERATOR_ROLES`
    - `GET /config/measurement-categories/:id` -> `OPERATOR_ROLES`
    - `GET /config/measurement-stats` -> `ADMIN_ROLES`
- `apps/api/src/design-types/design-types.controller.ts`
  - Added explicit read-policy decorators:
    - `GET /design-types` -> `OPERATOR_ROLES`
    - `GET /design-types/:id` -> `OPERATOR_ROLES`

### Mail endpoint security tightening
- `apps/api/src/mail/mail.controller.ts`
  - Removed public access for mail integration endpoints by replacing `@Public()` with `@Roles(...SUPER_ADMIN_ONLY_ROLES)`:
    - `GET /mail/auth-url`
    - `POST /mail/test`
  - Existing env gate (`isPublicMailEndpointsEnabled`) remains as a second control, now behind authenticated super-admin authorization.

### Manifest/coverage tracking alignment
- `docs/refactor-manifest.csv`
  - Regenerated manifest to include newly added tracked files and restore full file-coverage verification.
  - Marked touched files as `DN` with note `Forty-first modernization pass`:
    - `apps/api/src/app.controller.ts`
    - `apps/api/src/auth/auth.controller.ts`
    - `apps/api/src/common/guards/roles.guard.ts`
    - `apps/api/src/config/config.controller.ts`
    - `apps/api/src/design-types/design-types.controller.ts`
    - `apps/api/src/mail/mail.controller.ts`

### Verification run after edits
- Explicit RBAC scan script (`controller handlers must have @Roles/@Public`) ✅
- `npx tsc -p apps/api/tsconfig.json --noEmit` ✅
- `npm run refactor:manifest:verify` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-04 — Pass 42 (RBAC escalation fix in role evaluation)

### Authorization correctness hardening
- `apps/api/src/common/guards/roles.guard.ts`
  - Replaced role-hierarchy comparison with strict explicit role-membership check (`requiredRoles.includes(user.role)`).
  - Security impact: prevents implicit privilege crossover into disjoint role scopes (for example, `EMPLOYEE_SELF_ROLES` no longer allows admin/operator/viewer access).
  - Maintains current policy model because controller decorators already use shared role-group constants (`ADMIN_ROLES`, `OPERATOR_ROLES`, `DASHBOARD_READ_ROLES`, etc.) to include intended elevated roles explicitly.

### Manifest/coverage tracking alignment
- `docs/refactor-manifest.csv`
  - Updated touched guard file tracking note to `Forty-second modernization pass`:
    - `apps/api/src/common/guards/roles.guard.ts`

### Verification run after edits
- `npx tsc -p apps/api/tsconfig.json --noEmit` ✅
- Explicit RBAC scan script (`controller handlers must have @Roles/@Public`) ✅
- `npm run refactor:manifest:verify` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-04 — Pass 43 (Branch-scope enforcement for financial endpoints)

### Branch guard normalization
- `apps/api/src/common/guards/branch.guard.ts`
  - Normalized `x-branch-id` header parsing for super-admin (`string | string[]` safe handling + trim).
  - Prevents malformed/array header values from leaking downstream as invalid branch scope.

### Ledger endpoint branch protection completion
- `apps/api/src/ledger/ledger.controller.ts`
  - Added `BranchGuard` so ledger endpoints now receive enforced branch scope.
  - Scoped read endpoints by active/request branch context:
    - `GET /ledger/:employeeId/balance`
    - `GET /ledger/:employeeId/statement`
    - `GET /ledger/:employeeId/earnings`
- `apps/api/src/ledger/ledger.service.ts`
  - Added employee-scope assertion helper for branch-constrained access.
  - Enforced scope checks in:
    - `createEntry`
    - `getBalance`
    - `getStatement`
    - `getEarningsByPeriod`
  - Hardened `remove` to scope by branch when provided and return deterministic `NotFoundException` when out-of-scope.

### Payments endpoint branch protection completion
- `apps/api/src/payments/payments.controller.ts`
  - Passed active/request branch scope into branch-sensitive reads:
    - `GET /payments/employee/:id/summary`
    - `GET /payments/employee/:id/history`
    - `GET /payments/weekly-report`
    - `GET /payments/weekly-report/pdf`
- `apps/api/src/payments/payments.service.ts`
  - Added employee-scope assertion helper to prevent cross-branch access by non-super-admin users.
  - Applied scope checks to:
    - `getEmployeeBalanceSummary`
    - `getHistory`
    - `disbursePay`
  - Weekly report now supports branch-scoped filtering and excludes soft-deleted payments/employees.
  - Updated ledger calls to pass branch scope context consistently.

### Manifest/coverage tracking alignment
- `docs/refactor-manifest.csv`
  - Marked touched files as `DN` with note `Forty-third modernization pass`:
    - `apps/api/src/common/guards/branch.guard.ts`
    - `apps/api/src/ledger/ledger.controller.ts`
    - `apps/api/src/ledger/ledger.service.ts`
    - `apps/api/src/payments/payments.controller.ts`
    - `apps/api/src/payments/payments.service.ts`

### Verification run after edits
- `npx tsc -p apps/api/tsconfig.json --noEmit` ✅
- `npm run refactor:manifest:verify` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-04 — Pass 44 (Design-types branch-scope hardening + compile guardrail fix)

### Design-types branch policy completion
- `apps/api/src/design-types/design-types.controller.ts`
  - Added `BranchGuard` to design-types routes to enforce active branch context.
  - Scoped `findAll` branch resolution:
    - non-super-admin -> forced to assigned branch context
    - super-admin -> optional explicit query branch override, otherwise active branch header scope
  - Hardened write paths to avoid cross-branch mutation by non-super-admin users:
    - `create` now forces branch assignment for non-super-admin
    - `update`/`remove` now pass branch scope to service-level guards
  - Scoped `findOne` to active branch/global defaults when branch scope is active.
- `apps/api/src/design-types/design-types.service.ts`
  - Added scope-aware `findOne` behavior (`branchId` or global default).
  - Added branch-scoped mutation checks before `update`/`remove` to prevent modifying records outside current branch scope.
  - Preserved super-admin global behavior when no branch scope is selected.

### Compile guardrail fix discovered during hardening
- `apps/api/src/customers/customers.controller.ts`
  - Fixed method signatures causing TS1016 (`required parameter cannot follow optional parameter`) by replacing optional decorator params with explicit union type (`string | undefined`) in customer list/summary filters.
  - No runtime behavior change; this was a type-level ordering fix to keep API compile gate green.

### Manifest/coverage tracking alignment
- `docs/refactor-manifest.csv`
  - Marked touched files as `DN` with note `Forty-fourth modernization pass`:
    - `apps/api/src/design-types/design-types.controller.ts`
    - `apps/api/src/design-types/design-types.service.ts`
    - `apps/api/src/customers/customers.controller.ts`

### Verification run after edits
- `npx tsc -p apps/api/tsconfig.json --noEmit` ✅
- `npm run refactor:manifest:verify` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-04 — Pass 45 (Branch-required mutation policy for core branch domains)

### Explicit branch-scope requirement for mutation endpoints
- `apps/api/src/customers/customers.controller.ts`
  - Added controller-level `requireBranchScope` helper to fail fast when branch context is missing.
  - Applied branch-required guardrail to mutation endpoints:
    - `POST /customers`
    - `PUT /customers/:id`
    - `DELETE /customers/:id`
    - `POST /customers/:id/measurements`
    - `PATCH /customers/:id/vip`
- `apps/api/src/employees/employees.controller.ts`
  - Added controller-level `requireBranchScope` helper.
  - Applied branch-required guardrail to mutation endpoints:
    - `POST /employees`
    - `PUT /employees/:id`
    - `DELETE /employees/:id`
    - `POST /employees/:id/user-account`
    - `POST /employees/:id/documents`
- `apps/api/src/orders/orders.controller.ts`
  - Added controller-level `requireBranchScope` helper.
  - Applied branch-required guardrail to branch-bound mutation endpoints:
    - `POST /orders`
    - `PATCH /orders/:id`
    - `DELETE /orders/:id`
    - `POST /orders/:id/items`
    - `PATCH /orders/:id/items/:itemId`
    - `DELETE /orders/:id/items/:itemId`
    - `POST /orders/:id/payment`
    - `PATCH /orders/:id/status`
    - `POST /orders/:id/share`
  - Behavior change: super-admin calls without `x-branch-id` now receive explicit `400` for these branch-bound mutations instead of implicit cross-branch mutation capability.

### Manifest/coverage tracking alignment
- `docs/refactor-manifest.csv`
  - Marked touched files as `DN` with note `Forty-fifth modernization pass`:
    - `apps/api/src/customers/customers.controller.ts`
    - `apps/api/src/employees/employees.controller.ts`
    - `apps/api/src/orders/orders.controller.ts`

### Verification run after edits
- `npx tsc -p apps/api/tsconfig.json --noEmit` ✅
- `npm run refactor:manifest:verify` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-04 — Pass 46 (Branch-required mutation policy extension)

### Extended branch-required mutation enforcement
- `apps/api/src/expenses/expenses.controller.ts`
  - Added controller-level `requireBranchScope` helper for explicit branch context validation.
  - Applied branch-required guardrail to mutation endpoints:
    - `POST /expenses`
    - `PUT /expenses/:id`
    - `DELETE /expenses/:id`
- `apps/api/src/tasks/tasks.controller.ts`
  - Added controller-level `requireBranchScope` helper.
  - Applied branch-required guardrail to mutation endpoints:
    - `PATCH /tasks/:id/assign`
    - `PATCH /tasks/:id/status`
    - `PATCH /tasks/:id/rate`
- `apps/api/src/payments/payments.controller.ts`
  - Added controller-level `requireBranchScope` helper.
  - Applied branch-required guardrail to mutation endpoint:
    - `POST /payments` (salary disbursement)

### Security outcome
- Super-admin mutation calls on these branch-bound APIs now require explicit `x-branch-id` and fail with a clear `400` error when missing, instead of relying on implicit/null branch behavior.

### Manifest/coverage tracking alignment
- `docs/refactor-manifest.csv`
  - Marked touched files as `DN` with note `Forty-sixth modernization pass`:
    - `apps/api/src/expenses/expenses.controller.ts`
    - `apps/api/src/tasks/tasks.controller.ts`
    - `apps/api/src/payments/payments.controller.ts`

### Verification run after edits
- `npx tsc -p apps/api/tsconfig.json --noEmit` ✅
- `npm run refactor:manifest:verify` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-04 — Pass 47 (Attendance mutation branch-scope enforcement)

### Attendance mutation hardening
- `apps/api/src/attendance/attendance.controller.ts`
  - Added controller-level `requireBranchScope` helper for explicit branch context validation.
  - Applied branch-required guardrail to mutation endpoints:
    - `POST /attendance/clock-in`
    - `POST /attendance/clock-out/:recordId`
  - Security outcome: super-admin mutation calls now require `x-branch-id` instead of implicitly deriving attendance branch from employee context.

### Manifest/coverage tracking alignment
- `docs/refactor-manifest.csv`
  - Marked touched file as `DN` with note `Forty-seventh modernization pass`:
    - `apps/api/src/attendance/attendance.controller.ts`

### Verification run after edits
- `npx tsc -p apps/api/tsconfig.json --noEmit` ✅
- `npm run refactor:manifest:verify` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-03 — Pass 35 (Backend expenses hardening)

### Expenses domain hardening (`apps/api/src/expenses/expenses.service.ts`)
- Added strict branch validation for branch-bound mutations:
  - `create` now requires a concrete branch context and fails fast with a clear `x-branch-id` requirement error when missing.
- Added safer query normalization in `findAll`:
  - bounded pagination defaults/caps (`DEFAULT_PAGE`, `DEFAULT_LIMIT`, `MAX_LIMIT`)
  - whitelist-based sorting (`expenseDate`, `amount`, `createdAt`)
  - defensive date parsing with inclusive end-of-day behavior for `YYYY-MM-DD` `to` values.
- Added category integrity checks:
  - new `assertActiveCategory` guard used on create/update to prevent assigning deleted/inactive categories.
- Improved category listing UX consistency:
  - switched expense category listing order from ID-desc to name-asc.
- Kept response shape backward-compatible (`{ data, meta }` for list endpoints) while making page metadata deterministic from normalized pagination inputs.

### Manifest updates (`docs/refactor-manifest.csv`)
- Marked service as `DN` with note `Thirty-fifth modernization pass`:
  - `apps/api/src/expenses/expenses.service.ts`
- Reviewed and marked unchanged files as `NJ` with explicit reasons:
  - `apps/api/src/expenses/dto/expense.dto.ts` (`DTO validation is already strict and aligned with service usage`)
  - `apps/api/src/expenses/expenses.module.ts` (`Module wiring is correct; no structural change needed for this pass`)

### Tracking updates
- `docs/refactor-status.md`
  - Updated checkpoint to “After Thirty-fifth Implementation Pass”.
  - Updated Phase 6 notes and refreshed manifest snapshot counts.
- `docs/refactor-edit-log.md`
  - Appended this Pass 35 section so every edit remains centralized in one file.

### Verification run after edits
- `npx tsc -p apps/api/tsconfig.json --noEmit` ✅
- `npm run lint -w web` ✅
- `./scripts/verify-refactor-manifest.sh` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-03 — Pass 36 (Backend rates hardening)

### Rates domain hardening (`apps/api/src/rates/*`)
- `apps/api/src/rates/rates.controller.ts`
  - Added `BranchGuard` to align rates endpoints with global branch-scoping policy.
  - Switched request typing to `AuthenticatedRequest` and fixed actor identity source from `req.user.id` to `req.user.userId`.
  - Enforced branch scoping consistently:
    - non-super-admins are forced to their branch for create/history/list
    - super-admins can use active branch scope (`x-branch-id`) and optional explicit history branch filter.
  - Normalized list response contract to include `data: { data, total }` (frontend-compatible) while preserving `meta`.
- `apps/api/src/rates/rates.service.ts`
  - Added safer pagination normalization (default + cap) and trimmed search handling.
  - Hardened `create` by validating `effectiveFrom` and rejecting non-forward-effective replacements.
  - Fixed history query behavior so omitted `branchId` no longer incorrectly forces global-only results.
  - Returned deterministic pagination metadata (`page`, `limit`, `lastPage`) from service.
- `apps/api/src/rates/dto/create-rate.dto.ts`
  - Replaced empty file with explicit shared-contract alias export (`CreateRateDto` -> `CreateRateCardInput`) for maintainable DTO intent.

### Manifest updates (`docs/refactor-manifest.csv`)
- Marked as `DN` with note `Thirty-sixth modernization pass`:
  - `apps/api/src/rates/rates.controller.ts`
  - `apps/api/src/rates/rates.service.ts`
  - `apps/api/src/rates/dto/create-rate.dto.ts`
- Marked as `NJ` with explicit reason:
  - `apps/api/src/rates/rates.module.ts` (`Module wiring remains correct after controller/service hardening`)

### Tracking updates
- `docs/refactor-status.md`
  - Updated checkpoint to “After Thirty-sixth Implementation Pass”.
  - Updated Phase 6 notes and refreshed manifest snapshot counts.
- `docs/refactor-edit-log.md`
  - Appended this Pass 36 section so every edit remains centralized in one file.

### Verification run after edits
- `npx tsc -p apps/api/tsconfig.json --noEmit` ✅
- `npm run lint -w web` ✅
- `./scripts/verify-refactor-manifest.sh` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-03 — Pass 37 (Backend search hardening)

### Search domain hardening (`apps/api/src/search/*`)
- `apps/api/src/search/search.service.ts`
  - Added defensive query normalization helpers:
    - minimum query-length guard
    - capped/normalized `limit` values
    - sanitized tokenized `to_tsquery` construction.
  - Added resilient fallback behavior:
    - when full-text query is not usable or yields no rows, fallback to `ILIKE` search for customers/employees.
  - Standardized cache behavior:
    - deterministic cache keys including branch scope + normalized limit
    - removed `@ts-ignore` and used typed cache `set` with TTL.
  - Preserved branch scoping behavior via SQL condition while making super-admin/global search paths explicit (`branchId` nullable).
- `apps/api/src/search/search.controller.ts`
  - Cleaned query parsing by using `@Query('limit')` directly (instead of `req.query.limit`).
  - Kept branch scope source as BranchGuard-injected `req.branchId` and normalized nullable handling.

### Verification-driven lint cleanup
- `apps/web/components/employees/AccountCreationDialog.tsx`
  - Removed unused `Button` import to satisfy lint gate.

### Manifest updates (`docs/refactor-manifest.csv`)
- Marked as `DN` with note `Thirty-seventh modernization pass`:
  - `apps/api/src/search/search.service.ts`
  - `apps/api/src/search/search.controller.ts`
  - `apps/web/components/employees/AccountCreationDialog.tsx`
- Marked as `NJ` with explicit reasons:
  - `apps/api/src/search/search.module.ts` (`Module wiring remains correct after search hardening`)
  - `apps/web/components/ui/form-layout.tsx` (`Shared form-layout primitive reviewed; no additional refactor required in this pass`)

### Tracking updates
- `docs/refactor-status.md`
  - Updated checkpoint to “After Thirty-seventh Implementation Pass”.
  - Updated Phase 6 notes and refreshed manifest snapshot counts.
- `docs/refactor-edit-log.md`
  - Appended this Pass 37 section so every edit remains centralized in one file.

### Verification run after edits
- `./scripts/generate-refactor-manifest.sh` ✅
- `npx tsc -p apps/api/tsconfig.json --noEmit` ✅
- `npm run lint -w web` ✅
- `./scripts/verify-refactor-manifest.sh` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-03 — Pass 38 (Backend employees consistency + shared-calculation reuse)

### Employees domain hardening (`apps/api/src/employees/*`)
- `apps/api/src/employees/employees.service.ts`
  - Reused canonical ledger calculation source instead of duplicating earning/payment math:
    - `getStats` now delegates to `ledgerService.getBalance` and maps response to existing employee stats shape (`totalEarned`, `totalPaid`, `balance`, `currentBalance`).
  - Added deterministic pagination normalization helper (`page`, `limit`, cap) and reused it across list/items methods.
  - Fixed employee search/list contract consistency:
    - search path now returns `{ data, total }` (matching non-search path and frontend expectation) instead of mixed `{ data, meta }` shape.
  - Added stricter branch-safe access for items:
    - `getItems` now validates scoped access via `findOne` before querying order items.
  - Reduced repeated date-conversion logic via helper and standardized create/update date handling.
- `apps/api/src/employees/employees.module.ts`
  - Imported `LedgerModule` so employees service can consume shared ledger summary logic instead of maintaining a duplicate calculation path.

### Shared-contract consistency rationale
- This pass intentionally removed a second independent earnings/balance implementation and aligned employee stats to the same ledger source used by the payments domain.
- Result: one financial source of truth for employee balance calculations across backend services.

### Manifest updates (`docs/refactor-manifest.csv`)
- Marked as `DN` with note `Thirty-eighth modernization pass`:
  - `apps/api/src/employees/employees.service.ts`
  - `apps/api/src/employees/employees.module.ts`
- Marked as `NJ` with explicit reason:
  - `apps/api/src/employees/dto/create-employee.dto.ts` (`DTO already uses shared enums and strict validation; no extra change needed`)

### Tracking updates
- `docs/refactor-status.md`
  - Updated checkpoint to “After Thirty-eighth Implementation Pass”.
  - Updated Phase 6 notes and refreshed manifest snapshot counts.
- `docs/refactor-edit-log.md`
  - Appended this Pass 38 section so every edit remains centralized in one file.

### Verification run after edits
- `npx tsc -p apps/api/tsconfig.json --noEmit` ✅
- `npm run lint -w web` ✅
- `./scripts/verify-refactor-manifest.sh` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-03 — Pass 39 (Backend users shared-contract cleanup)

### Users domain hardening (`apps/api/src/users/users.service.ts`)
- Centralized repeated user-service logic into reusable private helpers:
  - `normalizeEmail`
  - `ensureEmailAvailable` (single conflict behavior for create/update/setup)
  - `resolveBranchId`
  - `generateTempPassword` (secure random source)
- Replaced ad-hoc repeated field selections with one canonical `USER_SELECT` projection (`Prisma.UserSelect`), used across create/update/findAll/setup paths.
- Standardized password hashing policy using one constant (`PASSWORD_HASH_ROUNDS`) across create/update/setup.
- Replaced weak temp-password generation (`Math.random`) with cryptographic randomness (`randomBytes`).
- Adopted shared role-group constant in stats aggregation:
  - `ADMIN_ROLES` from `@tbms/shared-constants` now drives privileged-user counting, removing local duplicate role lists.

### Verification-driven lint cleanup (web)
- `apps/web/components/expenses/expense-create-dialog.tsx`
  - Removed unused `Button` import.
- `apps/web/components/payments/payments-disburse-dialog.tsx`
  - Removed unused `Button` import.

### Manifest updates (`docs/refactor-manifest.csv`)
- Marked as `DN` with note `Thirty-ninth modernization pass`:
  - `apps/api/src/users/users.service.ts`
  - `apps/web/components/expenses/expense-create-dialog.tsx`
  - `apps/web/components/payments/payments-disburse-dialog.tsx`
- Marked as `NJ` with explicit reason:
  - `apps/api/src/users/users.module.ts` (`Module wiring remains correct after shared-logic service refactor`)

### Tracking updates
- `docs/refactor-status.md`
  - Updated checkpoint to “After Thirty-ninth Implementation Pass”.
  - Updated Phase 6 notes and refreshed manifest snapshot counts.
- `docs/refactor-edit-log.md`
  - Appended this Pass 39 section so every edit remains centralized in one file.

### Verification run after edits
- `npx tsc -p apps/api/tsconfig.json --noEmit` ✅
- `npm run lint -w web` ✅
- `./scripts/verify-refactor-manifest.sh` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-03 — Pass 40 (Branches + shared order-status constant unification)

### Shared constants cleanup (`packages/shared-constants/src/orders.ts`)
- Added canonical `OPEN_ORDER_STATUSES` constant for statuses representing active pipeline work:
  - `NEW`, `IN_PROGRESS`, `READY`, `OVERDUE`.
- Purpose: remove repeated local active-status arrays and ensure one shared source across backend/frontend consumers.

### Branches domain hardening (`apps/api/src/branches/branches.service.ts`)
- Replaced local inline active-order status list in branch deletion guard with shared `OPEN_ORDER_STATUSES`.
- Added normalized helper logic to reduce repeated ad-hoc handling:
  - `normalizeCode`
  - `normalizePagination`
  - `ensureCodeAvailable`
- Hardened list/search behavior:
  - trims search input
  - applies bounded pagination when `limit` provided
  - preserves backward-compatible non-paginated behavior when `limit` is omitted.
- Hardened create path:
  - code is normalized once and validated through shared conflict helper.

### Manifest updates (`docs/refactor-manifest.csv`)
- Marked as `DN` with note `Fortieth modernization pass`:
  - `apps/api/src/branches/branches.service.ts`
  - `packages/shared-constants/src/orders.ts`
- Marked as `NJ` with explicit reason:
  - `apps/api/src/branches/branches.module.ts` (`Module wiring remains correct after service hardening`)

### Tracking updates
- `docs/refactor-status.md`
  - Updated checkpoint to “After Fortieth Implementation Pass”.
  - Updated Phase 3/6 notes and refreshed manifest snapshot counts.
- `docs/refactor-edit-log.md`
  - Appended this Pass 40 section so every edit remains centralized in one file.

### Verification run after edits
- `npx tsc -p apps/api/tsconfig.json --noEmit` ✅
- `npm run lint -w web` ✅
- `./scripts/verify-refactor-manifest.sh` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-04 — Pass 48 (Backend branch-scope helper deduplication)

### Shared branch-scope utility extraction
- Added `apps/api/src/common/utils/branch-scope.util.ts` as the single reusable source for branch-required mutation validation:
  - `requireBranchScope(req)`
  - canonical error message constant `BRANCH_SCOPE_REQUIRED_MESSAGE`
- Purpose: remove repeated controller-local implementations and keep branch-scope failure semantics identical everywhere.

### Controller cleanup (duplicate helper removal)
- Replaced local `private requireBranchScope(...)` methods with shared utility usage in:
  - `apps/api/src/customers/customers.controller.ts`
  - `apps/api/src/employees/employees.controller.ts`
  - `apps/api/src/orders/orders.controller.ts`
  - `apps/api/src/expenses/expenses.controller.ts`
  - `apps/api/src/tasks/tasks.controller.ts`
  - `apps/api/src/payments/payments.controller.ts`
  - `apps/api/src/attendance/attendance.controller.ts`
- Result: one policy implementation, no repeated helper logic, and cleaner controller classes.

### Nullable branch-scope typing alignment
- Updated `apps/api/src/common/interfaces/request.interface.ts`:
  - `AuthenticatedRequest.branchId` now correctly reflects guard behavior as `string | null`.
- Updated read-path services/controllers to handle nullable branch context explicitly (instead of relying on implicit runtime behavior):
  - `apps/api/src/attendance/attendance.service.ts`
  - `apps/api/src/customers/customers.service.ts`
  - `apps/api/src/employees/employees.service.ts`
  - `apps/api/src/orders/orders.service.ts`
  - `apps/api/src/orders/receipt.service.tsx`
  - `apps/api/src/tasks/tasks.service.ts`
  - `apps/api/src/reports/reports.controller.ts`
  - `apps/api/src/design-types/design-types.controller.ts`
- Safety outcome:
  - Branch filters on read paths are now conditionally applied when branch scope is present.
  - Super-admin no-branch context is handled explicitly and type-safely.

### Manifest/coverage tracking alignment
- `docs/refactor-manifest.csv`
  - Added new tracked file:
    - `apps/api/src/common/utils/branch-scope.util.ts` (`DN`, `Forty-eighth modernization pass`)
  - Updated touched files to `Forty-eighth modernization pass`:
    - `apps/api/src/common/interfaces/request.interface.ts`
    - `apps/api/src/customers/customers.controller.ts`
    - `apps/api/src/customers/customers.service.ts`
    - `apps/api/src/employees/employees.controller.ts`
    - `apps/api/src/employees/employees.service.ts`
    - `apps/api/src/orders/orders.controller.ts`
    - `apps/api/src/orders/orders.service.ts`
    - `apps/api/src/orders/receipt.service.tsx`
    - `apps/api/src/expenses/expenses.controller.ts`
    - `apps/api/src/tasks/tasks.controller.ts`
    - `apps/api/src/tasks/tasks.service.ts`
    - `apps/api/src/payments/payments.controller.ts`
    - `apps/api/src/attendance/attendance.controller.ts`
    - `apps/api/src/attendance/attendance.service.ts`
    - `apps/api/src/reports/reports.controller.ts`
    - `apps/api/src/design-types/design-types.controller.ts`

### Tracking updates
- `docs/refactor-status.md`
  - Updated checkpoint to “After Forty-eighth Implementation Pass”.
  - Updated Phase 2 note and manifest snapshot counts.

### Verification run after edits
- `npx tsc -p apps/api/tsconfig.json --noEmit` ✅
- `npm run refactor:manifest:verify` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-04 — Pass 49 (Backend branch-resolution logic centralization)

### Shared branch-resolution utility
- Added `apps/api/src/common/utils/branch-resolution.util.ts` with reusable branch-scope helpers:
  - `resolveBranchScopeForRead`
  - `resolveBranchScopeForReadOrNull`
  - `resolveBranchScopeForMutation`
- Purpose: remove repeated super-admin/non-super-admin branch resolution logic and standardize handling of `all` and active branch context.

### Controller consistency refactor
- `apps/api/src/reports/reports.controller.ts`
  - Replaced local `resolveBranch` method and inline branch-scoping logic with shared utility calls.
  - Preserved existing `branchId=all` behavior for super-admin reads/exports through centralized option handling.
- `apps/api/src/rates/rates.controller.ts`
  - Replaced duplicated branch resolution in list/stats/history with shared utility usage.
  - Replaced inline create-branch assignment logic with `resolveBranchScopeForMutation`.
- `apps/api/src/design-types/design-types.controller.ts`
  - Replaced local create/findAll branch-scoping logic with shared branch-resolution helpers.
  - Added super-admin `branchId=all` consistency for design-type list filtering.
- `apps/api/src/search/search.controller.ts`
  - Replaced direct `req.branchId ?? null` usage with shared nullable read-scope helper.

### Consistency outcome
- One canonical implementation now governs:
  - active branch fallback
  - super-admin request-branch override
  - `all` token handling for global reads
  - mutation branch assignment defaults
- This removes duplicated branching rules and reduces drift risk across controllers.

### Manifest/coverage tracking alignment
- `docs/refactor-manifest.csv`
  - Added new tracked utility file:
    - `apps/api/src/common/utils/branch-resolution.util.ts` (`DN`, `Forty-ninth modernization pass`)
  - Updated touched file notes to `Forty-ninth modernization pass`:
    - `apps/api/src/reports/reports.controller.ts`
    - `apps/api/src/rates/rates.controller.ts`
    - `apps/api/src/design-types/design-types.controller.ts`
    - `apps/api/src/search/search.controller.ts`

### Verification run after edits
- `npx tsc -p apps/api/tsconfig.json --noEmit` ✅
- `npm run refactor:manifest:verify` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-04 — Pass 50 (Controller query parsing consistency sweep)

### Shared query parsing utility
- Added `apps/api/src/common/utils/query-parsing.util.ts` with reusable numeric query parsers:
  - `parsePositiveInt(value, defaultValue)`
  - `parseOptionalPositiveInt(value)`
- Purpose: replace repeated ad-hoc numeric parsing (`Number(...) || ...`, `parseInt(...)`) with one canonical implementation for safer, consistent behavior.

### Controller consistency refactor
- Replaced repeated page/limit/number query parsing with shared utility usage in:
  - `apps/api/src/attendance/attendance.controller.ts`
  - `apps/api/src/config/config.controller.ts`
  - `apps/api/src/branches/branches.controller.ts`
  - `apps/api/src/expenses/expenses.controller.ts`
  - `apps/api/src/customers/customers.controller.ts`
  - `apps/api/src/orders/orders.controller.ts`
  - `apps/api/src/ledger/ledger.controller.ts`
  - `apps/api/src/employees/employees.controller.ts`
  - `apps/api/src/payments/payments.controller.ts`
  - `apps/api/src/reports/reports.controller.ts`
  - `apps/api/src/rates/rates.controller.ts`
  - `apps/api/src/search/search.controller.ts`
- Specific consistency outcomes:
  - invalid/non-positive numeric query values now consistently fall back to explicit defaults where required.
  - optional pagination inputs now consistently resolve to `undefined` when not valid.
  - removed controller-level parsing drift between `Number(...)` and `parseInt(...)` patterns.

### Verification-driven type stability fixes
- `apps/api/src/customers/customers.service.ts`
  - Reworked `toPrismaMeasurementValues` conversion to avoid mutating `Prisma.InputJsonObject` (readonly index signature), using `Object.fromEntries` with explicit `Prisma.JsonValue` casting.
- `apps/api/src/orders/receipt.service.tsx`
  - Restored explicit `renderToStream` cast workaround (`element as never`) to keep React PDF typing compatible under current toolchain.

### Manifest/coverage tracking alignment
- `docs/refactor-manifest.csv`
  - Added new tracked utility file:
    - `apps/api/src/common/utils/query-parsing.util.ts` (`DN`, `Fiftieth modernization pass`)
  - Updated touched file notes to `Fiftieth modernization pass`:
    - `apps/api/src/attendance/attendance.controller.ts`
    - `apps/api/src/config/config.controller.ts`
    - `apps/api/src/branches/branches.controller.ts`
    - `apps/api/src/expenses/expenses.controller.ts`
    - `apps/api/src/customers/customers.controller.ts`
    - `apps/api/src/orders/orders.controller.ts`
    - `apps/api/src/ledger/ledger.controller.ts`
    - `apps/api/src/employees/employees.controller.ts`
    - `apps/api/src/payments/payments.controller.ts`
    - `apps/api/src/reports/reports.controller.ts`
    - `apps/api/src/rates/rates.controller.ts`
    - `apps/api/src/search/search.controller.ts`
    - `apps/api/src/customers/customers.service.ts`
    - `apps/api/src/orders/receipt.service.tsx`

### Tracking updates
- `docs/refactor-status.md`
  - Updated checkpoint to “After Fiftieth Implementation Pass”.
  - Updated Phase 8 note and manifest snapshot counts.

### Verification run after edits
- `npx tsc -p apps/api/tsconfig.json --noEmit` ✅
- `npm run refactor:manifest:verify` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-04 — Pass 51 (Controller response-envelope consistency sweep)

### Shared response utility
- Added `apps/api/src/common/utils/response.util.ts` with reusable response envelope helpers:
  - `success(data)`
  - `successOnly()`
  - `successSpread(payload)`
  - `successWithMeta(data, meta)`
- Purpose: remove repeated inline `return { success: true, ... }` boilerplate and enforce one consistent success-response construction pattern.

### Controller consistency refactor
- Replaced repeated inline success envelopes with shared helpers in:
  - `apps/api/src/branches/branches.controller.ts`
  - `apps/api/src/attendance/attendance.controller.ts`
  - `apps/api/src/customers/customers.controller.ts`
  - `apps/api/src/employees/employees.controller.ts`
  - `apps/api/src/orders/orders.controller.ts`
  - `apps/api/src/expenses/expenses.controller.ts`
  - `apps/api/src/payments/payments.controller.ts`
  - `apps/api/src/ledger/ledger.controller.ts`
  - `apps/api/src/search/search.controller.ts`
  - `apps/api/src/rates/rates.controller.ts`
  - `apps/api/src/reports/reports.controller.ts`
- Pattern outcomes:
  - Standard single-data responses now use `success(data)`.
  - No-body mutation responses now use `successOnly()`.
  - Existing spread responses (list + meta payload forms) now use `successSpread(...)`.
  - Explicit data+meta responses now use `successWithMeta(...)`.
- Response shapes remain backward-compatible (same field names and structure).

### Manifest/coverage tracking alignment
- `docs/refactor-manifest.csv`
  - Added new tracked utility file:
    - `apps/api/src/common/utils/response.util.ts` (`DN`, `Fifty-first modernization pass`)
  - Updated touched file notes to `Fifty-first modernization pass`:
    - `apps/api/src/branches/branches.controller.ts`
    - `apps/api/src/attendance/attendance.controller.ts`
    - `apps/api/src/customers/customers.controller.ts`
    - `apps/api/src/employees/employees.controller.ts`
    - `apps/api/src/orders/orders.controller.ts`
    - `apps/api/src/expenses/expenses.controller.ts`
    - `apps/api/src/payments/payments.controller.ts`
    - `apps/api/src/ledger/ledger.controller.ts`
    - `apps/api/src/search/search.controller.ts`
    - `apps/api/src/rates/rates.controller.ts`
    - `apps/api/src/reports/reports.controller.ts`

### Tracking updates
- `docs/refactor-status.md`
  - Updated checkpoint to “After Fifty-first Implementation Pass”.
  - Updated Phase 8 note and manifest snapshot counts.

### Verification run after edits
- `npx tsc -p apps/api/tsconfig.json --noEmit` ✅
- `npm run refactor:manifest:verify` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-04 — Pass 52 (Shared query DTO normalization sweep)

### Shared query DTO introduction
- Added reusable pagination query DTO:
  - `apps/api/src/common/dto/pagination-query.dto.ts`
- Purpose: standardize `page`/`limit` query normalization through one validated DTO shape (with transform support) instead of ad-hoc per-handler parsing.

### Controller adoption
- Switched paginated handlers to consume `PaginationQueryDto` and use normalized numeric values directly (`query.page ?? default`, `query.limit ?? default`) in:
  - `apps/api/src/branches/branches.controller.ts`
  - `apps/api/src/attendance/attendance.controller.ts`
  - `apps/api/src/customers/customers.controller.ts`
  - `apps/api/src/employees/employees.controller.ts`
  - `apps/api/src/orders/orders.controller.ts`
  - `apps/api/src/expenses/expenses.controller.ts`
  - `apps/api/src/payments/payments.controller.ts`
  - `apps/api/src/ledger/ledger.controller.ts`
  - `apps/api/src/config/config.controller.ts`
  - `apps/api/src/rates/rates.controller.ts`
  - `apps/api/src/search/search.controller.ts`
- Kept existing behavior-compatible defaults in controllers/services while removing manual repeated parsing logic.

### Cleanup
- Removed unused temporary DTO file:
  - `apps/api/src/common/dto/limit-query.dto.ts`

### Manifest coverage hardening
- Added missing tracked files discovered during verification:
  - `apps/api/src/common/dto/pagination-query.dto.ts` (`DN`, `Fifty-second modernization pass`)
  - `apps/web/app/(dashboard)/settings/system/page.tsx` (`NS`, unassigned)
  - `apps/web/components/config/system/system-settings-page.tsx` (`NS`, unassigned)
- Updated touched API controller notes to `Fifty-second modernization pass`.

### Tracking updates
- `docs/refactor-status.md`
  - Updated checkpoint to “After Fifty-second Implementation Pass”.
  - Updated Phase 8 note and manifest snapshot counts.

### Verification run after edits
- `npx tsc -p apps/api/tsconfig.json --noEmit` ✅
- `npm run refactor:manifest:verify` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-04 — Pass 53 (Inline request-body DTO normalization)

### Task/attendance/mail body-contract hardening
- Replaced inline ad-hoc body parsing with validated DTO contracts:
  - `apps/api/src/tasks/dto/create-task.dto.ts`
    - added `AssignTaskDto` with required `employeeId` validation.
  - `apps/api/src/tasks/dto/update-task.dto.ts`
    - added `UpdateTaskStatusDto` (`TaskStatus` enum validation)
    - added `UpdateTaskRateDto` (numeric non-negative validation)
  - `apps/api/src/attendance/dto/clock-in.dto.ts`
    - added `ClockInDto` for `employeeId` + optional bounded `note`.
  - `apps/api/src/mail/dto/send-test-mail.dto.ts`
    - added `SendTestMailDto` with `IsEmail` validation.
- Updated controllers to consume DTOs directly (no `@Body('field')`/inline objects):
  - `apps/api/src/tasks/tasks.controller.ts`
  - `apps/api/src/attendance/attendance.controller.ts`
  - `apps/api/src/mail/mail.controller.ts`

### Order item assignment DTO alignment
- Added dedicated DTO for order-item patch operations:
  - `apps/api/src/orders/dto/update-order.dto.ts`
    - added `UpdateOrderItemAssignmentDto` (`status` enum + optional `employeeId`).
- Updated usage to remove inline body type and align service contract:
  - `apps/api/src/orders/orders.controller.ts`
  - `apps/api/src/orders/orders.service.ts`

### Additional query DTO consistency extension
- Expanded reusable pagination DTO to carry shared query keys used by controller `@Query()` usage:
  - `apps/api/src/common/dto/pagination-query.dto.ts`
- This keeps global validation/whitelisting safe when `@Query()` DTOs are combined with additional query params in controllers.

### Manifest coverage hardening
- Added newly introduced backend files to manifest:
  - `apps/api/src/attendance/dto/clock-in.dto.ts` (`DN`, `Fifty-third modernization pass`)
  - `apps/api/src/mail/dto/send-test-mail.dto.ts` (`DN`, `Fifty-third modernization pass`)
- Added missing frontend files discovered by verifier (tracked as `NS`):
  - `apps/web/app/(dashboard)/settings/attendance/page.tsx`
  - `apps/web/app/(dashboard)/settings/expense-categories/page.tsx`
  - `apps/web/components/config/attendance/attendance-settings-page.tsx`
  - `apps/web/components/config/expenses/expense-categories-page.tsx`
  - `apps/web/hooks/use-attendance-settings-page.ts`
  - `apps/web/hooks/use-expense-categories-page.ts`
- Updated touched backend file notes to `Fifty-third modernization pass`:
  - `apps/api/src/tasks/dto/create-task.dto.ts`
  - `apps/api/src/tasks/dto/update-task.dto.ts`
  - `apps/api/src/tasks/tasks.controller.ts`
  - `apps/api/src/attendance/attendance.controller.ts`
  - `apps/api/src/mail/mail.controller.ts`
  - `apps/api/src/orders/dto/update-order.dto.ts`
  - `apps/api/src/orders/orders.controller.ts`
  - `apps/api/src/orders/orders.service.ts`
  - `apps/api/src/common/dto/pagination-query.dto.ts`

### Tracking updates
- `docs/refactor-status.md`
  - Updated checkpoint to “After Fifty-third Implementation Pass”.
  - Updated Phase 6/7 notes and manifest snapshot counts.

### Verification run after edits
- `npx tsc -p apps/api/tsconfig.json --noEmit` ✅
- `npm run refactor:manifest:verify` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-04 — Pass 54 (Backend auth/security and branch-integrity hardening)

### Auth refresh flow correctness + consistency
- `apps/api/src/auth/auth.service.ts`
  - Re-enabled real refresh-token lifecycle: login now issues refresh token, stores a hashed copy, and refresh endpoint rotates tokens with hash update.
  - Added shared token payload/token issuance helpers to remove duplicated JWT signing logic.
- `apps/api/src/auth/auth.controller.ts`
  - Centralized refresh-cookie options via helper methods (`setRefreshCookie`, `clearRefreshCookie`) to avoid duplicated cookie config.
  - Normalized refresh identity extraction (`userId`/`sub`) and refresh-token handling for safer compatibility across strategies.
- `apps/api/src/auth/strategies/jwt-refresh.strategy.ts`
  - Hardened cookie extraction with strict string checks.
  - Returned normalized auth shape (`userId`, role/branch/employee fields, refreshToken) so controller/service contracts match.
- `apps/api/src/common/interfaces/request.interface.ts`
  - Extended request user shape with optional refresh fields used in refresh flow typing.
- `apps/api/src/common/env.ts`
  - Added `getJwtRefreshExpiresIn()` for explicit refresh-token TTL management (`JWT_REFRESH_EXPIRES_IN`, default `30d`).

### Public status and global API protection hardening
- `apps/api/src/orders/orders.service.ts`
  - Replaced `Math.random()` share token/PIN generation with cryptographically secure `randomBytes` + `randomInt`.
  - Fixed `removeItem` integrity by validating the item belongs to the target order before soft-delete.
- `apps/api/src/app.module.ts`
  - Added global `ThrottlerGuard` provider so throttling config is actively enforced at runtime.

### Branch ownership enforcement hardening
- `apps/api/src/attendance/attendance.service.ts`
  - Enforced active-employee-only clock-in and strict employee-branch ownership validation before creating attendance records.
- `apps/api/src/tasks/tasks.service.ts`
  - Enforced assignment-only-to-active-employee and same-branch employee validation in task assignment path.

### Tracking updates
- `docs/refactor-manifest.csv`
  - Regenerated manifest after verifier detected untracked files, preserving existing statuses/notes and adding new `NS` entries for:
    - `apps/api/src/audit-logs/audit-logs.controller.ts`
    - `apps/api/src/audit-logs/audit-logs.module.ts`
    - `apps/api/src/audit-logs/audit-logs.service.ts`
    - `apps/web/app/(dashboard)/settings/audit-logs/page.tsx`
    - `apps/web/app/(dashboard)/settings/integrations/page.tsx`
    - `apps/web/components/config/audit-logs/audit-logs-page.tsx`
    - `apps/web/components/config/integrations/integrations-settings-page.tsx`
    - `apps/web/hooks/use-audit-logs-page.ts`
    - `apps/web/hooks/use-integrations-settings-page.ts`
    - `apps/web/lib/api/audit-logs.ts`
    - `apps/web/lib/api/mail.ts`
    - `packages/shared-types/src/audit.ts`
    - `packages/shared-types/src/integrations.ts`
  - Marked/touched entries as `Fifty-fourth modernization pass`:
    - `apps/api/src/app.module.ts`
    - `apps/api/src/auth/auth.controller.ts`
    - `apps/api/src/auth/auth.service.ts`
    - `apps/api/src/auth/strategies/jwt-refresh.strategy.ts`
    - `apps/api/src/common/env.ts`
    - `apps/api/src/common/interfaces/request.interface.ts`
    - `apps/api/src/orders/orders.service.ts`
    - `apps/api/src/attendance/attendance.service.ts`
    - `apps/api/src/tasks/tasks.service.ts`
- `docs/refactor-status.md`
  - Updated checkpoint to “After Fifty-fourth Implementation Pass”.
  - Updated Phase 1/6/7/8 notes and manifest snapshot counts.

### Verification run after edits
- `npm run build -w api` ✅

## 2026-03-04 — Pass 76 (Auth stability fix: access-token auto-refresh in NextAuth)

### Root-cause addressed
- API logs confirmed repeated `jwt expired` from `JwtAuthGuard` while `/api/auth/session` was still valid.
- Cause: web session lifetime and access token lifetime drift (`session` remained active while API JWT expired), with no automatic refresh path.

### Web auth refresh implementation
- `apps/web/app/api/auth/[...nextauth]/route.ts`
  - Removed hardcoded access-token expiry assumption.
  - Added JWT `exp` decoding utility and now derives `accessTokenExpires` from the real API-issued token.
  - Added refresh-token extraction from API `Set-Cookie` headers on login (`Refresh-Token` cookie parsing server-side).
  - Added `refreshAccessToken(...)` flow in NextAuth `jwt` callback:
    - when access token is near expiry (30s buffer), call `POST /auth/refresh`
    - send refresh token via `Cookie` header
    - rotate refresh token when API returns updated `Set-Cookie`
    - persist new access token + expiry into NextAuth JWT
  - Added session-level `error` propagation for refresh failures.
  - Increased NextAuth session `maxAge` to 30 days so session wrapper stays stable while access tokens rotate transparently.

### Shared auth typing alignment
- `apps/web/types/next-auth.d.ts`
  - Added `refreshToken` + `error` fields where needed.
  - Relaxed `next-auth/jwt` field optionality to match pre-sign-in token lifecycle and refresh callback behavior.

### Verification run after edits
- `npm run lint -w web` ✅
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run build -w web` ⚠️ blocked by offline font fetch (`fonts.googleapis.com` DNS/network in current environment), not by auth code changes.

## 2026-03-04 — Pass 77 (Auth stability hardening: legacy session self-heal + 401 retry recovery)

### Why this pass
- Logs still showed `jwt expired` bursts because some existing sessions had stale `accessTokenExpires` metadata from earlier logic, and multiple page-load API calls raced before refresh.

### Session self-heal for old tokens
- `apps/web/app/api/auth/[...nextauth]/route.ts`
  - In `jwt` callback, always reconcile `accessTokenExpires` from real JWT `exp` when `accessToken` exists.
  - This repairs previously-issued NextAuth JWTs that had mismatched long expiry metadata without requiring manual cookie surgery.

### Client API retry recovery
- `apps/web/lib/api.ts`
  - Added token-expiry parsing and proactive near-expiry refresh check before each request (30s buffer).
  - Added shared refresh lock to prevent parallel refresh storms.
  - Added one-time 401 retry path:
    - force fetch fresh `/api/auth/session` (no-store)
    - if token refreshed, retry failed API request once with new bearer token
    - otherwise fall back to existing login redirect handling
  - Kept branch-header behavior unchanged.

### Verification run after edits
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run lint -w web` ✅

## 2026-03-04 — Pass 78 (Auth architecture decision and long-term consistency baseline)

### Documentation baseline (single source auth model)
- `docs/auth-architecture.md` (new)
  - Documented long-term decision:
    - backend is single auth authority
    - web/NextAuth is session façade and token-rotation shell
    - shared packages are canonical for auth contracts/permissions
  - Documented anti-pattern to avoid (independent dual auth lifecycles).
  - Documented migration path for shared auth contracts and CI auth regressions.

## 2026-03-04 — Pass 79 (Refresh-token contract fix + stale-session flood protection)

### Root issue observed
- `/api/auth/session` payload showed `error: "MissingRefreshToken"` while API calls failed with `jwt expired`.
- This indicates refresh flow had no usable refresh token in the web session state.

### Backend auth contract hardening
- `apps/api/src/auth/auth.controller.ts`
  - Updated `POST /auth/login` response to include `refreshToken` in `data`.
  - Updated `POST /auth/refresh` response to include rotated `refreshToken` in `data`.
  - Cookie behavior remains unchanged; this adds deterministic body contract for server-to-server/BFF consumers.

### Web NextAuth token source hardening
- `apps/web/app/api/auth/[...nextauth]/route.ts`
  - Login path now reads `refreshToken` from response body first, then falls back to `Set-Cookie` parsing.
  - Refresh path now reads rotated `refreshToken` from response body first, then falls back to `Set-Cookie` parsing.
  - This removes dependency on runtime-specific `set-cookie` header accessibility.

### Stale-session request storm protection
- `apps/web/lib/api.ts`
  - Added early request guard: if session error is `MissingRefreshToken`, stop API request and force redirect to login.
  - Prevents repeated backend 401 floods from known invalid auth session state.

### Verification run after edits
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run lint -w web` ✅
- `npm run build -w api` ✅

## 2026-03-04 — Pass 80 (Shared auth contract extraction for multi-portal consistency)

### Shared auth contracts
- `packages/shared-types/src/auth.ts` (new)
  - Added canonical auth payload contracts:
    - `AuthenticatedUserSnapshot`
    - `AuthLoginResponseData`
    - `AuthRefreshResponseData`
- `packages/shared-types/src/index.ts`
  - Exported shared auth contracts from package entrypoint.

### API/Web adoption
- `apps/api/src/auth/auth.controller.ts`
  - Adopted shared auth response contracts via typed `ApiResponse<AuthLoginResponseData>` and `ApiResponse<AuthRefreshResponseData>`.
  - Normalized role casting at response boundary to match shared `Role` enum contract.
- `apps/web/app/api/auth/[...nextauth]/route.ts`
  - Typed login/refresh API calls against shared auth contracts.
  - Keeps refresh-token body-first extraction logic for runtime consistency.

### Verification run after edits
- `npm run build -w @tbms/shared-types` ✅
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run build -w api` ✅
- `npm run lint -w web` ✅

## 2026-03-04 — Pass 81 (Auth-expired redirect loop fix + scope alignment)

### Issue addressed
- After introducing stale-session protection, login redirect loops were observed (`/login?expired=1` and `/api/auth/session` repeating rapidly).
- Root cause: session could remain `authenticated` while carrying auth error state, causing dashboard/login guards to bounce.

### Loop-prevention and invalid-session handling
- `apps/web/hooks/use-login-page.ts`
  - Updated authenticated redirect logic:
    - if `session.error` exists, clear session via `signOut({ redirect: false })`
    - keep user on `/login?expired=1` instead of redirecting to dashboard.
- `apps/web/app/(dashboard)/layout.tsx`
  - Added `session.error` guard:
    - clears invalid session
    - routes to `/login?expired=1` deterministically.
- `apps/web/lib/api.ts`
  - Added debounced one-time handling for `MissingRefreshToken` session state:
    - sign out invalid session
    - throttle redirects with sessionStorage marker
    - prevent API-request flood + repeated navigation loops.

### Scope correction per request
- Removed in-progress Google sign-in additions (not requested in this workstream):
  - `apps/api/src/auth/dto/google-login.dto.ts` deleted
  - Removed temporary Google-login endpoint/service logic that had been started.
- Kept only shared-auth/session consistency work relevant to current issue.

### Verification run after edits
- `npm run build -w @tbms/shared-types` ✅
- `npm run build -w api` ✅
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run lint -w web` ✅

## 2026-03-04 — Pass 76 (Customers/global search SQL parameter typing fix)

### Backend search hardening for customer/employee raw queries
- `apps/api/src/search/search.service.ts`
  - Replaced branch-scope SQL pattern:
    - from: `("branchId" = ${branchId} OR ${branchId} IS NULL)`
    - to: conditional SQL fragment via `Prisma.sql` / `Prisma.empty`
  - Added branch filter fragment once per request:
    - `const branchFilter = branchId ? Prisma.sql\`AND "branchId" = ${branchId}\` : Prisma.empty`
  - Applied this change across all customer and employee raw-search query branches (prefix, full-text, fallback ILIKE).

### Why this fixes the reported error
- The previous query shape could leave one prepared-statement parameter only used in `IS NULL` context, which PostgreSQL can treat as untyped (`42P18`, “could not determine data type of parameter ...”) for specific search inputs/paths.
- Conditional SQL fragments remove the untyped-null placeholder pattern entirely.

### Verification run after edits
- `npm run build -w api` ✅

## 2026-03-04 — Pass 75 (Staff Access Directory API pagination/search/filter parity)

### Backend users query contract hardening
- `apps/api/src/users/dto/user.dto.ts`
  - Added `ListUsersQueryDto` (extends `PaginationQueryDto`) with explicit optional `role` and `branchId`.
- `apps/api/src/users/users.controller.ts`
  - Updated `GET /users` to consume typed list-query DTO instead of a single `branchId` query field.
- `apps/api/src/users/users.service.ts`
  - Refactored `findAll` to support server-side:
    - `page` / `limit`
    - `search` (name/email/branch-name/branch-code)
    - `role`
    - `branchId`
  - Added bounded pagination (`limit` capped to `100`) and deterministic `{ data, total, page, limit }` response payload.

### Shared contract migration for users list filters
- `packages/shared-types/src/users.ts`
  - Added canonical `UserAccountsQueryInput` for cross-app users list querying.

### Frontend users page parity with orders/customers pattern
- `apps/web/lib/api/users.ts`
  - Migrated `getUsers` from `branchId`-only to canonical query object (`page`, `limit`, `search`, `role`, `branchId`).
- `apps/web/hooks/use-users-page.ts`
  - Replaced client-only filtering with API-driven filtering/pagination state:
    - added `page`, `pageSize`, `total`
    - sends `search` + `role` + pagination to backend
    - keeps debounce behavior for search-driven requests
    - resets to page 1 on filter changes
- `apps/web/components/config/users/users-access-table.tsx`
  - Wired shared `DataTable` pagination props (`page`, `total`, `limit`, `onPageChange`).
- `apps/web/components/config/users/users-list-toolbar.tsx`
  - Updated toolbar total to use API total results count.
  - Refined search placeholder to align with backend search fields.
- `apps/web/components/config/UsersTable.tsx`
  - Connected page state and total count through toolbar and table components.

### Verification run after edits
- `npm run build -w @tbms/shared-types` ✅
- `npm run build -w api` ✅
- `npx tsc -p apps/web/tsconfig.json --noEmit` ✅
- `npm run refactor:manifest:verify` ✅

## 2026-03-04 — Pass 74 (Login-path fix: web API target + deterministic admin credential reset)

### Authentication path fix
- `apps/web/.env`
  - Updated local API endpoints used by web/NextAuth server route:
    - `NEXT_PUBLIC_API_URL=http://localhost:3001`
    - `INTERNAL_API_URL=http://localhost:3001`
- `apps/web/.env.local`
  - Updated local API endpoints used by web/NextAuth server route:
    - `NEXT_PUBLIC_API_URL=http://localhost:3001`
    - `INTERNAL_API_URL=http://localhost:3001`
- `apps/web/.env.local.example`
  - Updated template defaults for local API endpoints to `http://localhost:3001`.

### Deterministic admin login credential fix
- `apps/api/prisma/seed.ts`
  - Updated super-admin upsert behavior:
    - existing `admin@tbms.com` record is now actively normalized on seed (`name`, `role`, `isActive`, `branchId`, `deletedAt`).
    - `passwordHash` is now refreshed on update to match `admin123`.
  - This removes stale-password drift when admin user already exists in DB.

### Verification run after edits
- `npm run build -w api` ✅
- `npm run env:verify` ✅

## 2026-03-04 — Pass 73 (Redis dev-start resilience hardening)

### Backend runtime hardening
- `apps/api/src/app.module.ts`
  - Added guarded Redis-store initialization in cache module setup.
  - New behavior:
    - production: Redis connection errors still fail fast.
    - non-production: Redis connection errors log a warning and fall back to in-memory cache (`store: 'memory'`, `ttl: 30000`).
  - This prevents local-dev startup crashes when Redis is not running.

### Verification run after edits
- `npm run build -w api` ✅
- `npm run start:dev -w api` ✅ cache-layer fallback observed
  - Redis unavailable warning emitted from `CacheModule`.
  - App then proceeded to route bootstrap.
  - Remaining local blocker is DB connectivity (`localhost:5432`) in this execution environment.

## 2026-03-04 — Pass 72 (Admin-only default seed mode for end-to-end flow testing)

### Seed behavior refinement (default to admin-only)
- `apps/api/prisma/seed.ts`
  - Added `SEED_CORE_DATA` toggle and effective core gating logic:
    - `SEED_CORE_DATA=true` seeds settings/catalog templates.
    - `SEED_DEMO_DATA=true` now implies core data as prerequisite.
  - Changed default `npm run prisma:seed` behavior to seed only:
    - super-admin user (`admin@tbms.com`)
  - Moved all settings/catalog bootstrap data behind explicit core mode:
    - system settings
    - default branch
    - garment/workflow templates
    - rate cards
    - measurement category template
    - design types
  - Kept employee/customer/order demo records behind demo mode.
  - Added clear seed-mode logs for admin/core/demo behavior.

### Seed command and env template updates
- `package.json`
  - Added `prisma:seed:core`:
    - `SEED_CORE_DATA=true npm exec -w api prisma db seed`
  - Updated `prisma:seed:demo` to force core + demo:
    - `SEED_CORE_DATA=true SEED_DEMO_DATA=true npm exec -w api prisma db seed`
- `apps/api/.env.example`
  - Added `SEED_CORE_DATA=false` default.
- `apps/api/.env.local.example`
  - Added `SEED_CORE_DATA=false` default.
- `apps/api/.env.production.example`
  - Added `SEED_CORE_DATA=false` and `SEED_DEMO_DATA=false` defaults for explicitness.

### Verification run after edits
- `npm run build -w api` ✅

## 2026-03-04 — Pass 71 (Core-only seed mode for flow testing)

### Seed behavior hardening (default to non-demo data)
- `apps/api/prisma/seed.ts`
  - Added `SEED_DEMO_DATA` toggle support.
  - Default behavior now seeds only core baseline data:
    - system settings
    - default branch
    - super admin user
    - garment/workflow/rate templates
    - measurement category template
    - design types
  - Moved employee/customer/order demo records behind:
    - `SEED_DEMO_DATA=true`
  - Added explicit logs that indicate whether demo transactional data is enabled or skipped.

### Developer workflow updates
- `package.json`
  - Added `prisma:seed:demo` script:
    - `SEED_DEMO_DATA=true npm exec -w api prisma db seed`
- `apps/api/.env.example`
  - Added `SEED_DEMO_DATA=false` documentation default.
- `apps/api/.env.local.example`
  - Added `SEED_DEMO_DATA=false` documentation default.

### Verification run after edits
- `npm run build -w api` ✅
- `npm run prisma:seed` ❌ (local runtime DB unreachable at `localhost:5432` in this environment)
  - Confirmed seed mode log before DB connect: `Demo transactional data seeding: disabled`

## 2026-03-04 — Pass 70 (Root Prisma schema-path fix for direct `npx prisma` usage)

### Developer-experience fix
- `package.json`
  - Added root Prisma CLI mapping:
    - `"prisma": { "schema": "apps/api/prisma/schema.prisma" }`
  - This makes direct root commands like `npx prisma generate` resolve the monorepo schema without requiring `--schema`.

### Verification run after edits
- `npx prisma generate` ✅
  - Prisma schema resolved from `apps/api/prisma/schema.prisma`.
  - Prisma client generated successfully.
- `npm run prisma:migrate:deploy` ❌
  - Blocked by DB connectivity: datasource points to `localhost:5432/tbms`, but host/port is unreachable in the current environment.

### Operational note
- Schema creation on a new empty database should be run after database connectivity is available:
  - `npm run prisma:migrate:deploy` (preferred, applies migration history)
  - optional: `npm run prisma:seed` (if seed data is needed)

## 2026-03-04 — Pass 63 (Controller guard deduplication + policy consistency)

### Backend guard consistency cleanup
- `apps/api/src/attendance/attendance.controller.ts`
- `apps/api/src/audit-logs/audit-logs.controller.ts`
- `apps/api/src/branches/branches.controller.ts`
- `apps/api/src/config/config.controller.ts`
- `apps/api/src/customers/customers.controller.ts`
- `apps/api/src/design-types/design-types.controller.ts`
- `apps/api/src/employees/employees.controller.ts`
- `apps/api/src/expenses/expenses.controller.ts`
- `apps/api/src/ledger/ledger.controller.ts`
- `apps/api/src/orders/orders.controller.ts`
- `apps/api/src/payments/payments.controller.ts`
- `apps/api/src/rates/rates.controller.ts`
- `apps/api/src/reports/reports.controller.ts`
- `apps/api/src/search/search.controller.ts`
- `apps/api/src/tasks/tasks.controller.ts`
- `apps/api/src/users/users.controller.ts`
  - Removed redundant class-level `@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)` and `@UseGuards(JwtAuthGuard, RolesGuard)` now that equivalent guards are already registered globally in `AppModule`.
  - Removed now-unused explicit guard imports from these controllers to reduce policy duplication noise at endpoint layer.

### Auth controller alignment
- `apps/api/src/auth/auth.controller.ts`
  - Removed redundant method-level `@UseGuards(JwtAuthGuard)` on `POST /auth/logout` and `GET /auth/me` (covered by global JWT guard + role metadata).
  - Kept route-specific `@UseGuards(AuthGuard('jwt-refresh'))` on `POST /auth/refresh` (special strategy requirement).

### Why this change
- Authorization policy is now easier to audit: controller endpoints declare `@Roles`/`@RequirePermissions`, while shared global guards enforce authentication/role/permission/branch consistently.
- This reduces repeated decorator/config drift and avoids partial guard changes between controllers.

### Tracking updates
- `docs/refactor-manifest.csv`
  - Marked/touched entries as `Sixty-third modernization pass` for all updated backend controllers and `auth.controller`.
- `docs/refactor-status.md`
  - Updated checkpoint to “After Sixty-third Implementation Pass”.
  - Added explicit guard-dedup completion bullet under backend hardening checklist.

### Verification run after edits
- `npm run build -w api` ✅
- `npm run refactor:manifest:verify` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-04 — Pass 64 (Backend security guardrails automation)

### New backend guardrail script
- `scripts/security-backend-guardrails.sh` (new)
  - Added explicit repository guardrails to fail fast when backend runtime code introduces:
    - unsafe SQL primitives (`$queryRawUnsafe`, `$executeRawUnsafe`, `Prisma.raw(...)`)
    - direct `console.*` logging in `apps/api/src` (Nest `Logger` only policy)
    - redundant controller class-level guard stacks (`@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)` / `@UseGuards(JwtAuthGuard, RolesGuard)`)
    - `dev-only-*` secret placeholder leakage outside `apps/api/src/common/env.ts`

### Script wiring
- `package.json`
  - Added root script: `security:backend:guardrails`.
- `apps/api/package.json`
  - Added workspace script: `security:guardrails`.

### Tracking updates
- `docs/refactor-manifest.csv`
  - Updated touched package manifest entries as `Sixty-fourth modernization pass`:
    - `apps/api/package.json`
    - `package.json`
- `docs/refactor-status.md`
  - Updated checkpoint to “After Sixty-fourth Implementation Pass”.
  - Added guardrail verification entries and hardening bullet.

### Verification run after edits
- `npm run security:backend:guardrails` ✅
- `npm run security:guardrails -w api` ✅
- `npm run build -w api` ✅
- `npm run refactor:manifest:verify` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-04 — Pass 65 (Env-access centralization + guardrail expansion)

### Shared env helper expansion
- `apps/api/src/common/env.ts`
  - Added reusable runtime helpers:
    - `isProductionEnvironment()`
    - `getServerPort()` (validated numeric port)
    - `getRedisUrl()` (trimmed optional redis URL)
    - `getGoogleMailEnvironment()` (normalized Google mail env bundle + redirect URI default)
  - Added `GoogleMailEnvironment` type contract.
  - Included `getServerPort()` in startup env assertion flow.

### Direct `process.env` usage removal from backend runtime modules
- `apps/api/src/app.module.ts`
  - Replaced direct `process.env.NODE_ENV` and `process.env.REDIS_URL` reads with shared env helpers.
- `apps/api/src/main.ts`
  - Replaced inline `process.env.PORT ?? 5000` with `getServerPort()`.
- `apps/api/src/auth/auth.controller.ts`
  - Replaced cookie secure-flag env check with `isProductionEnvironment()`.
- `apps/api/src/common/filters/all-exceptions.filter.ts`
  - Removed local `process.env` helper and reused shared env helper.
- `apps/api/src/mail/mail.service.ts`
  - Replaced repeated direct Google env reads with `getGoogleMailEnvironment()` in both status and client init paths.

### Guardrail expansion
- `scripts/security-backend-guardrails.sh`
  - Added new failing check for direct `process.env` usage outside `apps/api/src/common/env.ts`.

### Tracking updates
- `docs/refactor-manifest.csv`
  - Marked touched backend files as `Sixty-fifth modernization pass`:
    - `apps/api/src/common/env.ts`
    - `apps/api/src/app.module.ts`
    - `apps/api/src/main.ts`
    - `apps/api/src/auth/auth.controller.ts`
    - `apps/api/src/common/filters/all-exceptions.filter.ts`
    - `apps/api/src/mail/mail.service.ts`
  - Updated `apps/api/src/mail/mail.service.ts` from `NS` to `DN`.
- `docs/refactor-status.md`
  - Updated checkpoint to “After Sixty-fifth Implementation Pass”.
  - Added env-centralization and expanded guardrail completion bullets.
  - Updated manifest snapshot counts for Phase 7.

### Verification run after edits
- `npm run security:backend:guardrails` ✅
- `npm run build -w api` ✅
- `npm run refactor:manifest:verify` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-04 — Pass 66 (Monorepo env contract standardization + setup automation)

### Environment contract and setup automation
- `.env.example`
  - Reworked into explicit monorepo env contract sections (core runtime, DB, cache/proxy, API security, web auth/routing, mail, storage).
  - Added missing production-relevant keys consumed by runtime/contracts:
    - `NEXTAUTH_URL`
    - `STATUS_PIN_PEPPER`
    - `TRUST_PROXY`
    - `GOOGLE_CLIENT_ID`
    - `GOOGLE_CLIENT_SECRET`
    - `GOOGLE_REFRESH_TOKEN`
    - `GOOGLE_EMAIL`
    - `GOOGLE_REDIRECT_URI`
- `scripts/setup-env.sh` (new)
  - Added idempotent setup script that:
    - creates root `.env` from `.env.example` if missing
    - links `apps/api/.env -> ../../.env`
    - links `apps/web/.env.local -> ../../.env` (copy fallback when symlinks are unavailable)
- `scripts/verify-env-contract.sh` (new)
  - Added env contract verification script that:
    - ensures `.env.example` contains all env keys used by API/web env loaders and Prisma schema
    - enforces direct `process.env` access centralization:
      - allowed only in `apps/api/src/common/env.ts`
      - allowed only in `apps/web/lib/env.ts`

### Script wiring and runtime loading
- `package.json`
  - Added:
    - `env:setup`
    - `env:verify`
  - Updated root `dev` script to run `env:setup` before concurrently launching workspaces.
- `apps/api/package.json`
  - Updated Nest start scripts to load root env explicitly using `--env-file ../../.env`:
    - `start`
    - `start:dev`
    - `start:debug`

### Web env consistency hardening
- `apps/web/lib/env.ts`
  - Added:
    - `isWebProductionEnvironment()`
    - `getNextAuthUrl()` (production-required validation with local fallback)
- `apps/web/lib/logger.ts`
  - Removed direct `process.env` usage; now consumes shared web env helper.
- `apps/web/app/api/auth/[...nextauth]/route.ts`
  - Added startup validation call for `NEXTAUTH_URL` through shared env helper.

### Documentation updates
- `docs/environment-setup.md` (new)
  - Added canonical monorepo env workflow documentation, ownership matrix, and guardrail rules.
- `apps/web/README.md`
  - Added `env:setup` prerequisite note.
- `apps/api/README.md`
  - Added `env:setup` prerequisite note.

### Tracking updates
- `docs/refactor-manifest.csv`
  - Marked/touched entries as `Sixty-sixth modernization pass`:
    - `package.json`
    - `apps/api/package.json`
    - `apps/api/src/common/env.ts`
    - `apps/web/lib/env.ts`
    - `apps/web/lib/logger.ts`
    - `apps/web/app/api/auth/[...nextauth]/route.ts`
- `docs/refactor-status.md`
  - Updated checkpoint to “After Sixty-sixth Implementation Pass”.
  - Added env setup/verification + runtime loading completion bullets.

### Verification run after edits
- `npm run env:setup` ✅
- `npm run env:verify` ✅
- `npm run security:backend:guardrails` ✅
- `npm run build -w api` ✅
- `npx tsc -p apps/web/tsconfig.json --noEmit` ✅
- `npm run refactor:manifest:verify` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-04 — Pass 67 (App-separated env files migration)

### Requested env layout migration
- Migrated from root-linked env approach to explicit app-separated runtime env files:
  - `apps/web/.env`
  - `apps/web/.env.local`
  - `apps/web/.env.production`
  - `apps/api/.env`
  - `apps/api/.env.local`
  - `apps/api/.env.production`

### Setup/verification script rewrite
- `scripts/setup-env.sh`
  - Replaced link-based setup with file-based setup.
  - Converts existing symlinked env files into regular files.
  - Creates missing app env files from app-specific templates.
- `scripts/verify-env-contract.sh`
  - Reworked contract checks to app-scoped mode.
  - Validates required templates:
    - `apps/api/.env.example`
    - `apps/api/.env.local.example`
    - `apps/api/.env.production.example`
    - `apps/web/.env.example`
    - `apps/web/.env.local.example`
    - `apps/web/.env.production.example`
  - Ensures runtime app env files exist and are not symlinks.
  - Keeps `process.env` centralization guardrails intact.

### New app-specific env templates
- `apps/api/.env.example` (new)
- `apps/api/.env.local.example` (new)
- `apps/api/.env.production.example` (new)
- `apps/web/.env.example` (new)
- `apps/web/.env.local.example` (new)
- `apps/web/.env.production.example` (new)

### Runtime loading and docs alignment
- `apps/api/package.json`
  - Updated env-file mapping:
    - `start` -> `.env`
    - `start:dev` -> `.env.local`
    - `start:debug` -> `.env.local`
- `.env.example`
  - Converted root env example into a pointer/deprecation note to app-specific templates.
- `docs/environment-setup.md`
  - Rewritten for app-separated env workflow.
- `apps/web/.gitignore`
  - Added `.env`, `.env.local`, `.env.production` ignore entries.
- `apps/api/.gitignore`
  - Added `.env.local`, `.env.production` ignore entries.
- `apps/web/README.md`, `apps/api/README.md`
  - Updated wording from env links to env files.

### Tracking updates
- `docs/refactor-manifest.csv`
  - Updated `apps/api/package.json` note to `Sixty-seventh modernization pass`.
- `docs/refactor-status.md`
  - Updated checkpoint to “After Sixty-seventh Implementation Pass”.
  - Added app-separated env migration completion bullets.

### Verification run after edits
- `npm run env:setup` ✅
- `npm run env:verify` ✅
- `npm run security:backend:guardrails` ✅
- `npm run build -w api` ✅
- `npx tsc -p apps/web/tsconfig.json --noEmit` ✅
- `npm run refactor:manifest:verify` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-04 — Pass 68 (Root env removal per app-scoped env policy)

### Requested cleanup
- `.env` (deleted)
  - Removed root runtime env file to enforce app-scoped env ownership only.
- `.gitignore`
  - Added root `.env` ignore rule to prevent accidental re-addition.

### Why this change
- Runtime env has been intentionally migrated to app-local files (`apps/web/*` and `apps/api/*`).
- Keeping root `.env` after migration causes ambiguity and misconfiguration risk.

### Verification run after edits
- `npm run env:verify` ✅
- `npm run env:setup` ✅
- `npm run security:backend:guardrails` ✅
- `npm run refactor:manifest:verify` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-04 — Pass 69 (Prisma root-command workflow fix + DB reachability diagnosis)

### Root Prisma command usability fix
- `package.json`
  - Added monorepo-root Prisma scripts to avoid `schema.prisma not found` errors when running from repo root:
    - `prisma:generate`
    - `prisma:migrate:status`
    - `prisma:migrate:deploy`
    - `prisma:db:push`
    - `prisma:seed`

### Diagnosis outcome for current local environment
- `npm run prisma:generate` ✅
  - Works correctly from monorepo root through API workspace.
- `npm run prisma:migrate:status` ❌
  - Prisma now resolves schema/env correctly, but DB is unreachable at current configured target:
    - host: `localhost`
    - port: `5432`
  - `pg_isready -h localhost -p 5432` reports `no response`, so migration cannot be applied until DB URL/availability is corrected.

### Tracking updates
- `docs/refactor-manifest.csv`
  - Updated `package.json` note to `Sixty-ninth modernization pass`.
- `docs/refactor-status.md`
  - Updated checkpoint to “After Sixty-ninth Implementation Pass”.
  - Added Prisma script pass/fail status notes.

## 2026-03-04 — Pass 59 (Backend security consistency hardening continuation)

### Public status endpoint hardening
- `apps/api/src/orders/status.controller.ts`
  - Reworked public status anti-bruteforce flow to avoid trusting raw `x-forwarded-for` parsing and rely on request IP abstraction.
  - Added token-level + token+IP failed-attempt throttling state (both dimensions must now pass).
  - Added hashed token cache keying (no raw share tokens in cache keys).
  - Replaced raw token logging with token fingerprint logging in structured security events.
  - Preserved existing public API shape (`GET /status/:token?pin=XXXX`) while tightening abuse controls.

### Production cache/throttle safety
- `apps/api/src/app.module.ts`
  - Enforced fail-fast behavior in production when `REDIS_URL` is missing/invalid.
  - Kept in-memory cache fallback only for non-production local/dev usage.

### Branch-scope financial/history correctness
- `apps/api/src/ledger/ledger.service.ts`
  - Added branch filters to ledger balance, statement, and earnings-by-period calculations when a branch scope is present.
- `apps/api/src/payments/payments.service.ts`
  - Added branch-scoped filtering to payment history via linked ledger payout entries.
  - Reworked weekly payment report to scope by ledger payout branch context (historical branch-safe) instead of employee current branch.
- `apps/api/src/employees/employees.service.ts`
  - Ensured employee financial stats pass branch scope into ledger balance.
  - Added branch scoping to employee item-history queries.

### Reusability and duplication cleanup
- `apps/api/src/common/utils/branch-scope.util.ts`
  - Added reusable `requireBranchId(...)` utility.
  - Refactored `requireBranchScope(req)` to delegate to the shared helper.
- `apps/api/src/expenses/expenses.service.ts`
  - Removed duplicated local branch-require helper and reused shared `requireBranchId(...)`.

### Shared email normalization consistency
- `apps/api/src/common/utils/email.util.ts` (new)
  - Added canonical `normalizeEmailAddress(...)` helper.
- `apps/api/src/users/users.service.ts`
  - Switched user email normalization to the shared helper.
- `apps/api/src/employees/employees.service.ts`
  - Normalized employee user-account email before lookup/create.
  - Updated uniqueness check to case-insensitive lookup (`findFirst` with insensitive match) for safer duplicate prevention.
  - Added deleted-user collision handling so account creation returns explicit conflict messaging instead of DB unique-index failure noise.

### Raw SQL safety cleanup
- `apps/api/src/reports/reports.service.ts`
  - Removed generic column-name SQL interpolation pattern and replaced with enum-backed static SQL fragment mapping.
  - Removed remaining `Prisma.raw(...)` usage in trend/date-condition helpers.
  - Kept query behavior/response shapes unchanged while reducing injection-risk surface.

### Verification run after edits
- `npm run build -w @tbms/shared-types` ✅
- `npm run build -w @tbms/shared-constants` ✅
- `npm run build -w api` ✅

## 2026-03-04 — Pass 60 (Proxy/IP trust hardening + email uniqueness guardrail)

### Proxy trust hardening
- `apps/api/src/common/env.ts`
  - Added `getTrustProxyConfig()` with strict parsing for `TRUST_PROXY` values (`true/false`, numeric hop count, CSV trusted proxies, or named presets).
  - Enforced explicit `TRUST_PROXY` in production via `assertSecurityEnvironment()`.
- `apps/api/src/main.ts`
  - Wired Express `trust proxy` setting from `getTrustProxyConfig()` before middleware stack to ensure `req.ip` behavior follows explicit deployment policy.

### Database guardrail for email uniqueness
- `apps/api/prisma/migrations/20260304201500_user_email_case_insensitive_unique/migration.sql` (new)
  - Added migration to enforce case-insensitive uniqueness for user emails with:
    - duplicate-detection precheck
    - unique functional index on `LOWER("email")`
  - Keeps API response contracts unchanged while preventing case-only account duplication at DB layer.

### Verification run after edits
- `npm run build -w @tbms/shared-types` ✅
- `npm run build -w @tbms/shared-constants` ✅
- `npm run build -w api` ✅
- `npm run refactor:manifest:verify` ✅

## 2026-03-04 — Pass 62 (Security-event logging deduplication + guard observability)

### Reusable security-event logging utility
- `apps/api/src/common/utils/security-event.util.ts` (new)
  - Added shared `emitSecurityEvent(...)` helper for consistent structured security log emission.
  - Standardizes event payload shape (`event`, `at`, additional metadata) and avoids repeated inline logger JSON formatting.

### Auth/status/permissions deduplication
- `apps/api/src/auth/auth.service.ts`
  - Replaced local `logSecurityEvent(...)` implementation with shared `emitSecurityEvent(...)`.
- `apps/api/src/orders/status.controller.ts`
  - Replaced local `logSecurityEvent(...)` implementation with shared `emitSecurityEvent(...)`.
- `apps/api/src/common/guards/permissions.guard.ts`
  - Replaced inline security-event logging formatter with shared utility.

### Guard-level deny observability improvements
- `apps/api/src/common/guards/roles.guard.ts`
  - Added structured deny logs for:
    - missing authorization metadata
    - missing user role
    - role not allowed
- `apps/api/src/common/guards/branch.guard.ts`
  - Added structured deny logs for:
    - missing user role
    - user without branch assignment
- `apps/api/src/common/guards/jwt-auth.guard.ts`
  - Added structured auth-failure logs (`jwt_auth_failed`) with request metadata in `handleRequest(...)`.

### Verification run after edits
- `npm run build -w api` ✅
- `npm run refactor:manifest:verify` ✅

## 2026-03-04 — Pass 60 (Security-first backend hardening implementation)

### Phase 1 — Immediate security correctness
- `apps/api/src/auth/strategies/jwt.strategy.ts`
  - Switched request principal enrichment to source `role`, `branchId`, `employeeId`, and permission set from current DB user record (not token role/branch claims).
  - Added token payload email consistency check against current DB user email.
- `apps/api/src/auth/strategies/jwt-refresh.strategy.ts`
  - Applied the same DB-sourced identity/authorization model for refresh flow.
  - Added token payload email consistency check against DB user email.
- `apps/api/src/auth/auth.controller.ts`
  - Added targeted throttling decorators:
    - `POST /auth/login`
    - `POST /auth/refresh`
  - Removed local refresh `try/catch` response handling and `console.error`; refresh now throws framework exceptions for centralized handling.
- `apps/api/src/common/env.ts`
  - Hardened JWT duration env behavior to fail closed in production (`JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` now required).
  - Added `getStatusPinPepper()` for public-status PIN hashing secret management.
  - Added `assertSecurityEnvironment()` startup validator.
- `apps/api/src/main.ts`
  - Added early `assertSecurityEnvironment()` call during bootstrap to fail fast on missing security-critical envs.

### Phase 2 — Public status PIN hardening with backward compatibility
- `apps/api/prisma/schema.prisma`
  - Added `Order.sharePinHash` and `Order.sharePinMigratedAt`.
- `apps/api/prisma/migrations/20260304170000_security_hardening_auth_status_audit/migration.sql` (new)
  - Added migration SQL for share PIN hash columns and audit actor nullable support.
- `apps/api/src/orders/orders.service.ts`
  - Added HMAC-based PIN hashing (`STATUS_PIN_PEPPER`).
  - Updated share-link generation to store hash-only for new links (`sharePin` no longer persisted for new links).
  - Kept response compatibility by still returning the generated PIN in API response payload.
  - Updated public status verification to:
    - Validate hashed PIN for new links.
    - Validate legacy plaintext PIN for old links.
    - Opportunistically migrate legacy records to hash-only on successful legacy PIN use.
- `apps/api/src/orders/status.controller.ts`
  - Added targeted route throttling for `GET /status/:token`.
  - Added per-token+IP failed-attempt backoff policy with cache-based counters and temporary block windows.
  - Added structured security-event logging for blocked and invalid status attempts.

### Phase 3 — Authorization consistency / reuse
- `apps/api/src/tasks/tasks.service.ts`
  - Removed duplicate service-layer permission gate checks for assignment/rate override where controller decorators already enforce capability.
- `apps/api/src/tasks/tasks.controller.ts`
  - Updated service calls after service signature simplification.
- `apps/api/src/common/guards/permissions.guard.ts`
  - Added structured security-event logs on permission-denied decisions for better centralized observability.

### Phase 4 — Audit completeness + observability
- `apps/api/prisma/schema.prisma`
  - Made `AuditLog.userId` nullable and relation optional.
  - Added `AuditLog.actorEmail` for unknown-actor auth events.
- `apps/api/src/common/interceptors/audit.interceptor.ts`
  - Extended actor resolution to persist `LOGIN_FAILED` even when email is unknown / user does not exist.
  - Added actor email capture and nullable user linkage.
  - Added deterministic entity fallback when userId is absent.
- `apps/api/src/audit-logs/audit-logs.service.ts`
  - Adjusted unique-user stats query to ignore `null` userId rows.
- `packages/shared-types/src/audit.ts`
  - Updated audit entry contract to support nullable/optional `userId` and optional `actorEmail`.
- `apps/web/components/config/audit-logs/audit-logs-page.tsx`
  - Improved actor display to show `actorEmail` when user relation is absent (unknown-account failed-login visibility).
- `apps/api/src/auth/auth.service.ts`
  - Added structured security-event logs for failed login and failed refresh conditions.

### Tracking updates
- `docs/refactor-manifest.csv`
  - Marked/touched entries as `Sixtieth modernization pass`:
    - `apps/api/src/common/env.ts`
    - `apps/api/src/main.ts`
    - `apps/api/src/auth/auth.controller.ts`
    - `apps/api/src/auth/auth.service.ts`
    - `apps/api/src/auth/strategies/jwt.strategy.ts`
    - `apps/api/src/auth/strategies/jwt-refresh.strategy.ts`
    - `apps/api/src/orders/status.controller.ts`
    - `apps/api/src/orders/orders.service.ts`
    - `apps/api/src/common/guards/permissions.guard.ts`
    - `apps/api/src/tasks/tasks.controller.ts`
    - `apps/api/src/tasks/tasks.service.ts`
    - `apps/api/src/common/interceptors/audit.interceptor.ts`
    - `apps/api/src/audit-logs/audit-logs.service.ts`
    - `packages/shared-types/src/audit.ts`
    - `apps/web/components/config/audit-logs/audit-logs-page.tsx`

### Verification run after edits
- `npm run prisma:generate -w api` ✅
- `npm run build -w @tbms/shared-types` ✅
- `npm run build -w @tbms/shared-constants` ✅
- `npm run build -w api` ✅
- `npx tsc -p apps/web/tsconfig.json --noEmit` ⚠️ fails on pre-existing duplicate default export in `apps/web/app/(dashboard)/settings/integrations/page.tsx` (not introduced in this pass)

## 2026-03-04 — Pass 59 (Audit action coverage and entity mapping completeness)

### Shared audit contract expansion
- `packages/shared-constants/src/audit.ts`
  - Expanded canonical audit actions to include auth lifecycle coverage:
    - `LOGIN_FAILED`
    - `LOGOUT`
    - `TOKEN_REFRESH`
  - Added `ExpenseCategory` to canonical audit entities so expense-category mutations are classified explicitly (instead of generic `Expense`/`Unknown`).

### Backend audit interceptor hardening
- `apps/api/src/common/interceptors/audit.interceptor.ts`
  - Extended action resolver:
    - `POST /auth/logout` -> `LOGOUT`
    - `POST /auth/refresh` -> `TOKEN_REFRESH`
    - `POST /auth/login` failures -> `LOGIN_FAILED` (success remains `LOGIN`)
  - Extended entity resolver:
    - `/expenses/categories` now maps to `ExpenseCategory`.
  - Extended old-value loader:
    - Added `ExpenseCategory` model lookup for update/delete audit diffs.
  - Extended actor resolution for auth failures:
    - `LOGIN_FAILED` now follows same actor-resolution path as `LOGIN` (existing-user email lookup), improving failed-login event capture for known accounts.

### Frontend audit UX consistency
- `apps/web/components/config/audit-logs/audit-logs-page.tsx`
  - Added dedicated badge variants/summaries for new auth actions (`TOKEN_REFRESH`, `LOGOUT`, `LOGIN_FAILED`) for clearer audit readability.
- `apps/web/hooks/use-audit-logs-page.ts`
  - Exported `ALL_FILTER` to align hook exports with consumer imports and keep type-check clean.

### Tracking updates
- `docs/refactor-manifest.csv`
  - Marked/touched entries as `Fifty-ninth modernization pass`:
    - `apps/api/src/common/interceptors/audit.interceptor.ts`
    - `apps/web/components/config/audit-logs/audit-logs-page.tsx`
    - `apps/web/hooks/use-audit-logs-page.ts`
    - `packages/shared-constants/src/audit.ts`
  - Added missing manifest coverage entries discovered by verifier sweep:
    - `apps/web/lib/authz.ts`
    - `apps/web/components/auth/can.tsx`
    - `apps/web/components/auth/with-role-guard.tsx`

### Verification run after edits
- `npm run build -w @tbms/shared-constants` ✅
- `npm run build -w api` ✅
- `npx tsc -p apps/web/tsconfig.json --noEmit` ✅
- `npm run refactor:manifest:verify` ✅
- `npm run lint -w api` ⚠️ fails due existing strict-eslint backlog in legacy files (not introduced by this pass)
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-04 — Pass 55 (Order assignment integrity + shared backend validation consistency)

### Shared employee-scope validation utility
- `apps/api/src/common/utils/employee-scope.util.ts` (new)
  - Added canonical helper `requireEmployeeInScope(...)` for employee existence, branch ownership, and optional active-status enforcement.
  - Added configurable violation messaging and inactive-violation mode (`bad_request` / `forbidden`) so domains can keep behavior-appropriate HTTP semantics while reusing one validation flow.

### Backend service hardening using shared validator
- `apps/api/src/orders/orders.service.ts`
  - Replaced local employee-branch validation with shared `requireEmployeeInScope`.
  - Hardened order flows to prevent cross-order item updates by validating `itemDto.id` ownership (`orderId`) before update.
  - Enforced branch-scoped active employee validation for all assignment entry points:
    - order creation item assignment
    - add-item assignment
    - order update item reassignment
    - item assignment patch endpoint
  - Increased share-link token entropy from 8-byte hex to 16-byte hex for stronger tracking link resistance.
- `apps/api/src/attendance/attendance.service.ts`
  - Replaced inline employee validation with shared employee-scope helper (active + branch ownership).
- `apps/api/src/tasks/tasks.service.ts`
  - Replaced inline assignment validation with shared employee-scope helper while preserving forbidden semantics for inactive/cross-branch assignment.
- `apps/api/src/payments/payments.service.ts`
  - Replaced duplicated employee scope lookup logic with shared employee-scope helper.

### Response envelope consistency sweep
- `apps/api/src/users/users.controller.ts`
  - Standardized all responses to shared response helpers (`success`, `successOnly`) instead of ad-hoc inline objects.
- `apps/api/src/design-types/design-types.controller.ts`
  - Standardized create/read/update/delete/seed responses to shared response helpers.
- `apps/api/src/config/config.controller.ts`
  - Standardized all config endpoints (settings/garment/measurement CRUD and stats/history flows) to shared response helpers.

### Tracking updates
- `docs/refactor-manifest.csv`
  - Marked/touched entries as `Fifty-fifth modernization pass`:
    - `apps/api/src/common/utils/employee-scope.util.ts`
    - `apps/api/src/orders/orders.service.ts`
    - `apps/api/src/attendance/attendance.service.ts`
    - `apps/api/src/tasks/tasks.service.ts`
    - `apps/api/src/payments/payments.service.ts`
    - `apps/api/src/users/users.controller.ts`
    - `apps/api/src/design-types/design-types.controller.ts`
    - `apps/api/src/config/config.controller.ts`
- `docs/refactor-status.md`
  - Updated checkpoint to “After Fifty-fifth Implementation Pass”.
  - Updated phase notes for Phase 6/8 and refreshed manifest snapshot counts.

### Verification run after edits
- `npm run build -w api` ✅
- `npm run refactor:manifest:verify` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-04 — Pass 56 (Cross-cutting audit/guard/scheduler hardening)

### Audit interceptor hardening (security + type safety)
- `apps/api/src/common/interceptors/audit.interceptor.ts`
  - Replaced dynamic unsafe `prisma[model]` lookup (`@ts-ignore` path) with explicit entity-to-model lookup switch.
  - Added strict request typing for interceptor input to reduce unsafe access paths.
  - Added sensitive payload redaction for audit logging (`password`, token/secret/auth headers, API keys, cookies, etc.) before persistence.
  - Added safe JSON conversion helper for audit payload storage and fallback-to-`JsonNull` behavior for unserializable values.
  - Added deterministic entity/action resolution helpers and safer response/entity-id extraction.
  - Normalized branch attribution preference (`request.branchId` first, then user branch).
  - Added structured audit-write failure logging with context.

### Guard typing consistency hardening
- `apps/api/src/common/guards/roles.guard.ts`
  - Added typed request contract for role extraction, removing implicit `any` user-role access.
- `apps/api/src/common/guards/branch.guard.ts`
  - Added typed request contract and safer `x-branch-id` parsing for super-admin branch selection.

### Audit logs branch-scope parity
- `apps/api/src/audit-logs/audit-logs.controller.ts`
  - Added optional `branchId` query support and normalized scoping through shared `resolveBranchScopeForReadOrNull(...)` (including super-admin `all` behavior), aligning with report/rates branch-resolution style.

### Scheduler typing cleanup
- `apps/api/src/scheduler/scheduler.service.ts`
  - Replaced ad-hoc inline transaction-client type import with `Prisma.TransactionClient`.
  - Normalized error logging for cron failures to structured stack/message output.

### Tracking updates
- `docs/refactor-manifest.csv`
  - Regenerated manifest after verifier detected additional untracked files, preserving prior statuses and adding new `NS` coverage entries for:
    - `apps/web/components/config/appearance/appearance-stats-grid.tsx`
    - `apps/web/components/config/appearance/appearance-preset-directory.tsx`
    - `apps/web/components/config/system/system-settings-state-card.tsx`
    - `apps/web/components/config/system/system-settings-stats-grid.tsx`
    - `apps/web/components/config/system/system-settings-workflow-card.tsx`
    - `apps/web/hooks/use-appearance-settings-page.ts`
    - `apps/web/hooks/use-system-settings-page.ts`
  - Marked/touched entries as `Fifty-sixth modernization pass`:
    - `apps/api/src/common/interceptors/audit.interceptor.ts`
    - `apps/api/src/common/guards/roles.guard.ts`
    - `apps/api/src/common/guards/branch.guard.ts`
    - `apps/api/src/audit-logs/audit-logs.controller.ts`
    - `apps/api/src/scheduler/scheduler.service.ts`
- `docs/refactor-status.md`
  - Updated checkpoint to “After Fifty-sixth Implementation Pass”.
  - Updated Phase 2/8 notes and manifest snapshot counts.

### Verification run after edits
- `npm run build -w api` ✅
- `npm run refactor:manifest:verify` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-04 — Pass 57 (Shared audit constants + exception/auth guard hardening)

### Shared audit constants canonicalization
- `packages/shared-constants/src/audit.ts` (new)
  - Added canonical audit constants:
    - `AUDIT_ACTIONS`
    - `AUDIT_ENTITIES`
    - `AUDIT_FILTER_ENTITIES`
    - `AUDIT_UNKNOWN_ENTITY`
- `packages/shared-constants/src/index.ts`
  - Exported new audit constants module from shared constants entrypoint.

### Shared type contract alignment
- `packages/shared-types/src/audit.ts`
  - Added optional `branchId` to `AuditLogsQueryInput` for frontend/backend filter contract parity.

### Backend audit/security hardening
- `apps/api/src/audit-logs/audit-logs.service.ts`
  - Normalized and whitelisted `action`/`entity` filter inputs using shared constants.
  - Added user-id normalization before query composition.
- `apps/api/src/common/interceptors/audit.interceptor.ts`
  - Switched to shared audit constants for action/entity domain consistency.
  - Kept typed/sanitized audit flow from prior pass while removing remaining local audit-entity/action drift.
- `apps/api/src/common/filters/all-exceptions.filter.ts`
  - Hardened exception message handling:
    - parses `HttpException` response safely
    - preserves useful 4xx messages
    - masks internal 5xx messages in production to avoid leaking internals
  - Kept detailed server-side logging for debugging.
- `apps/api/src/common/guards/jwt-auth.guard.ts`
  - Added typed `handleRequest` override to enforce explicit unauthorized responses when auth context is missing/invalid.
  - Kept public-route bypass behavior unchanged.

### Frontend audit filter consistency
- `apps/web/hooks/use-audit-logs-page.ts`
  - Replaced local hardcoded audit action/entity lists with shared constants (`AUDIT_ACTIONS`, `AUDIT_FILTER_ENTITIES`) so UI filter options match backend canonical values.

### Tracking updates
- `docs/refactor-manifest.csv`
  - Marked/touched entries as `Fifty-seventh modernization pass`:
    - `apps/api/src/common/guards/jwt-auth.guard.ts`
    - `apps/api/src/common/filters/all-exceptions.filter.ts`
    - `apps/api/src/audit-logs/audit-logs.service.ts`
    - `apps/api/src/common/interceptors/audit.interceptor.ts`
    - `apps/web/hooks/use-audit-logs-page.ts`
    - `packages/shared-constants/src/audit.ts`
    - `packages/shared-constants/src/index.ts`
    - `packages/shared-types/src/audit.ts`
- `docs/refactor-status.md`
  - Updated checkpoint to “After Fifty-seventh Implementation Pass”.
  - Updated Phase 2/3/5/8 notes and manifest snapshot counts.

### Verification run after edits
- `npm run build -w @tbms/shared-constants` ✅
- `npm run build -w @tbms/shared-types` ✅
- `npm run build -w api` ✅
- `npm run refactor:manifest:verify` ✅
- `npm run test -w api -- --runInBand` intentionally not run in this pass (per request to avoid test work)

## 2026-03-04 — Pass 58 (Audit persistence reliability for complete event capture)

### Backend audit reliability fix
- `apps/api/src/common/interceptors/audit.interceptor.ts`
  - Replaced fire-and-forget audit writes (`void persistAuditLog`) with awaited RxJS flow so request success/failure paths both wait for audit persistence attempt.
  - Added `PersistAuditLogInput` typed payload for consistent audit write arguments.
  - Added `safelyPersistAuditLog` wrapper to ensure audit write failures never break business API responses, while still logging internal audit persistence errors.
  - Kept existing success/error audit capture behavior and sensitive-field redaction intact.

### Why this change
- Audit writes were previously asynchronous side effects in `tap/catchError`, which could make logs appear missing or delayed under rapid client refresh/load.
- Persisting within the request observable flow improves deterministic save behavior for mutation events.

### Verification run after edits
- `npm run build -w api` ✅

## 2026-03-04 — Pass 82 (Comprehensive auth hardening + redirect-loop elimination)

### Web auth/session robustness
- `apps/web/app/api/auth/[...nextauth]/route.ts`
  - Hardened refresh failure handling:
    - on missing/failed refresh, clears `accessToken` and expiry metadata (prevents stale-expired token reuse).
  - Session callback no longer throws for invalid role payloads; now marks session with `InvalidSessionRole` error and strips access token.
  - Preserves refresh rotation behavior while failing safely into explicit invalid-session state.

- `apps/web/lib/api.ts`
  - Added shared session cache + in-flight dedupe for `getSession()` calls to reduce session endpoint request storms.
  - Added unified `handleInvalidSession(...)` flow:
    - debounced sign-out + redirect to `/login?expired=1`
    - cache invalidation and deterministic handling of any session error state.
  - Kept one-time 401 retry path, now backed by centralized invalid-session fallback if refresh does not recover.

- `apps/web/hooks/use-login-page.ts`
  - Added one-time guard for invalid authenticated sessions to prevent repeated signOut/redirect loops on login page.

- `apps/web/app/(dashboard)/layout.tsx`
  - Added one-time guard for invalid authenticated sessions to prevent dashboard/login bounce loops.

- `apps/web/middleware.ts`
  - Added token error-state guard for protected routes (`token.error` => redirect to `/login?expired=1`) for early server-side enforcement.

- `apps/web/components/AuthProvider.tsx`
  - Disabled `SessionProvider` focus/offline refetch behavior to reduce noisy/redundant `/api/auth/session` churn during normal usage/devtools focus shifts.

### Backend auth refresh hardening
- `apps/api/src/auth/auth.service.ts`
  - Tightened refresh path: inactive users can no longer refresh tokens (`user.isActive` required).
  - Added explicit security-event reason mapping for not-found/inactive/missing-refresh-token states.

### Verification run after edits
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run lint -w web` ✅
- `npm run build -w api` ✅

## 2026-03-04 — Pass 83 (Auth lifecycle stabilization + expiry-loop fix)

### Backend auth refresh stabilization
- `apps/api/src/auth/auth.service.ts`
  - Removed per-refresh refresh-token rotation to eliminate concurrent refresh race invalidation.
  - Refresh flow now:
    - validates hashed stored refresh token
    - issues a new access token
    - returns the same session refresh token for compatibility
  - Login flow still issues and stores hashed refresh token at session start.

### Backend auth logging signal cleanup
- `apps/api/src/common/filters/all-exceptions.filter.ts`
  - Changed non-5xx exception logging from `error` stack traces to `warn` messages.
  - Keeps 5xx as full error logs, reducing noise from expected auth 401 events while preserving security-event logs.

### Web auth/session invalid-state hardening
- `apps/web/app/api/auth/[...nextauth]/route.ts`
  - Replaced invalid-role throw path with deterministic invalid-session state (`InvalidSessionRole`), clearing token auth fields.
  - Added strict guards for missing refresh/access tokens:
    - `MissingRefreshToken`
    - `MissingAccessToken`
  - Session callback now marks missing-access-token sessions as invalid instead of returning a seemingly authenticated session.
  - Removed permissions persistence from NextAuth JWT cookie and now derives permissions from role during session hydration to reduce cookie payload and auth-state drift risk.

- `apps/web/lib/api.ts`
  - Request interceptor now proactively invalidates session when:
    - session has explicit auth error
    - session exists but `accessToken` is missing
    - token is expiring and forced refresh fails
  - Prevents unauthorized request storms and converges all invalid states to one controlled sign-out path.

- `apps/web/hooks/use-login-page.ts`
  - Treats authenticated session without access token as invalid and signs out once.

- `apps/web/app/(dashboard)/layout.tsx`
  - Treats authenticated session without access token as invalid and redirects once.

- `apps/web/middleware.ts`
  - Protected routes now also require token `accessToken` presence (in addition to token existence and no token error).

### Local env alignment for auth correctness
- `apps/web/.env`
- `apps/web/.env.local`
  - Corrected `NEXTAUTH_URL` to `http://localhost:3000` (web origin).

- `apps/api/.env`
  - Aligned default local runtime values with local-dev contract:
    - `PORT=3001`
    - `JWT_EXPIRES_IN=15m`

### Architecture notes updated
- `docs/auth-architecture.md`
  - Updated to match implemented strategy:
    - backend remains auth authority
    - refresh token is session-stable (hashed at rest), not per-refresh rotating
    - avoids concurrent refresh self-revocation in NextAuth multi-request scenarios.

### Verification run after edits
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run lint -w web` ✅
- `npm run build -w web` ⚠️ blocked in current environment by offline Google Fonts fetch (`fonts.googleapis.com` DNS), not by auth code
- `npm run build -w api` ✅
- `npm run build -w @tbms/shared-types` ✅
- `npm run rbac:audit` ✅
- `npm run security:backend:guardrails` ✅

## 2026-03-04 — Pass 84 (API env loading consistency for mail/auth config)

### Problem addressed
- Mail status endpoint reported all Google configuration flags as `false` even when values existed in `apps/api/.env`.
- Root cause: dev runtime was started with only `--env-file .env.local`, where Google values were empty.

### Fix implemented
- `apps/api/package.json`
  - Updated dev/debug start scripts to load env files in layered order:
    - base: `.env`
    - override: `.env.local`
  - Updated scripts:
    - `start:dev` -> `nest start --watch --env-file .env --env-file .env.local`
    - `start:debug` -> `nest start --debug --watch --env-file .env --env-file .env.local`

- `apps/api/.env.local`
- `apps/api/.env.local.example`
  - Commented out empty `GOOGLE_*` keys to prevent overriding non-empty `.env` values with blank strings.
  - Added inline note: define `GOOGLE_*` in `.env.local` only when intentionally overriding.

### Verification run after edits
- `npm run start:dev -w api -- --help` ✅ (confirmed multi `--env-file` parsing and script validity)

## 2026-03-04 — Pass 85 (Theme Token V2 migration foundation)

### Phase 0 baseline + tracking controls
- `docs/theme-token-migration.csv` (new)
  - Added full migration inventory for Theme Token V2 scope.
  - Columns: `path,module,phase,status,notes`.
  - Includes coverage for:
    - `apps/web/app/**/*.tsx`
    - `apps/web/components/**/*.tsx`
    - `apps/web/lib/*theme*`
    - `apps/web/app/globals.css`
    - `apps/web/tailwind.config.ts`
    - `packages/shared-theme/src/*`
- `scripts/verify-theme-token-migration.sh` (new)
  - Added strict verifier that fails when:
    - scoped files are missing from manifest
    - invalid status appears (`NS/IP/DN/NJ` only)
    - `NJ` row has no reason in notes
- `docs/theme-token-migration-status.md` (new)
  - Added phase ledger and current rollout snapshot.

### Phase 1 shared contract upgrade
- `packages/shared-theme/src/theme-presets.ts`
  - Replaced legacy palette with canonical `ThemePaletteV2` field contract.
  - Fixed `ThemePreset.id` typing from `any` to `ThemePresetId`.
  - Aligned `THEME_PRESET_IDS` to actual preset IDs only:
    - `google-ai-studio-v2`
    - `console-minimalist-xai`
  - Updated `DEFAULT_THEME_PRESET` to valid ID.
  - Expanded preset light/dark palettes with complete V2 semantic fields.
- `packages/shared-theme/src/index.ts`
  - Marked as `NJ` in migration manifest (no code change needed; canonical re-export remains correct).

### Phase 2/3 token surface and compatibility layer
- `apps/web/lib/theme-css.ts`
  - Migrated generator input type to `ThemePaletteV2`.
  - Added CSS variable output for full V2 token set:
    - layout, typography, borders, interactions, forms, muted semantic states, code, utilities.
  - Preserved compatibility behavior with alias variables and readable foreground fallbacks.
  - Kept backward-safe values for legacy token usage during migration cycle.
- `apps/web/tailwind.config.ts`
  - Added Tailwind color namespaces for V2 token families:
    - `surface`, `appBar`, `sidebar`, `text`, `borderStrong`, `divider`, `interaction`,
      `inputSurface`, semantic muted variants, `code`, `scrollbar`, `shadowColor`.
  - Added canonical `error` namespace (`error`, `error.foreground`, `error.muted`) while preserving `destructive` compatibility keys.
- `apps/web/app/globals.css`
  - Added defaults for all newly introduced CSS variables in both root and dark blocks.
  - Added utility classes for shell/layout and technical utilities:
    - `bg-app-bar`, `bg-sidebar-surface`, `bg-surface-elevated`, `code-surface`, `scrollbar-theme`.

### Phase 4 shell migration (in progress)
- `apps/web/app/(dashboard)/layout.tsx`
  - Applied tokenized shell classes (`surface`, `text-secondary`, `scrollbar-theme`) for consistent app shell behavior.
- `apps/web/app/login/page.tsx`
  - Switched login container surface to semantic elevated token and stronger semantic border.
- `apps/web/components/layout/Sidebar.tsx`
  - Replaced broad background/muted usage with dedicated sidebar/app interaction tokens.
  - Standardized active/inactive nav states with `sidebarActive`, `sidebarBorder`, and `interaction-hover`.
- `apps/web/components/layout/Topbar.tsx`
  - Migrated topbar wrapper to `appBar` semantic tokens and aligned border semantics.
- `apps/web/components/layout/ThemeToggle.tsx`
  - Migrated trigger styling to semantic sidebar/interaction tokens.
- `apps/web/components/auth/login-brand-panel.tsx`
  - Replaced broad foreground classes with semantic inverse token usage for brand panel consistency.
- `apps/web/components/auth/auth-state-card.tsx`
  - Migrated shell card/error accent usage to semantic elevated + muted error tokens.
- `apps/web/app/status/[token]/page.tsx`
  - Migrated public status page shell background classes to semantic surface tokens.
- `apps/web/app/unauthorized/page.tsx`
  - Marked as `NJ` in migration manifest because it delegates shell/layout rendering to `AuthStateCard` (already migrated).

### Phase 5 primitive migration (in progress)
- Updated core UI primitives to consume semantic tokens consistently:
  - `apps/web/components/ui/button.tsx`
  - `apps/web/components/ui/badge.tsx`
  - `apps/web/components/ui/card.tsx`
  - `apps/web/components/ui/input.tsx`
  - `apps/web/components/ui/select.tsx`
  - `apps/web/components/ui/dialog.tsx`
  - `apps/web/components/ui/sheet.tsx`
  - `apps/web/components/ui/table.tsx`
  - `apps/web/components/ui/tabs.tsx`
  - `apps/web/components/ui/toast.tsx`
  - `apps/web/components/ui/typography.tsx`
  - `apps/web/components/ui/stat-card.tsx`
  - `apps/web/components/ui/empty-state.tsx`
  - `apps/web/components/ui/data-table.tsx`
  - `apps/web/components/ui/dropdown-menu.tsx`
  - `apps/web/components/ui/command.tsx`
- Result: removed overloaded generic muted/accent usage across these primitives and replaced with explicit semantic layout/form/interaction/semantic-muted tokens.

### Phase 7 guardrails bootstrap
- `scripts/audit-theme-usage.mjs` (new)
  - Added non-tokenized color audit for app/component code paths to detect raw color usage patterns.
- `package.json`
  - Added scripts:
    - `theme:migration:verify`
    - `theme:usage:audit`

### Tracking updates
- `docs/theme-token-migration.csv`
  - Marked this pass completed files as `DN` for Phases 4 and 5 with explicit migration notes.
- `docs/theme-token-migration-status.md`
  - Updated phase ledger and completion snapshot.

### Verification run after edits
- `npm run build -w @tbms/shared-theme` ✅
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run lint -w web` ✅
- `npm run theme:migration:verify` ✅
- `npm run theme:usage:audit` ✅
- `npm run build -w web` ⚠️ blocked in current environment by offline Google Fonts fetch (`fonts.googleapis.com` DNS), not by theme-token code

## 2026-03-04 — Pass 86 (Theme Token V2 Phase 5 completion + Phase 6 Wave 1)

### Phase 5 primitive migration completed
- Migrated remaining token-bearing UI primitives:
  - `apps/web/components/ui/avatar.tsx`
  - `apps/web/components/ui/chart-empty-state.tsx`
  - `apps/web/components/ui/chart-shell.tsx`
  - `apps/web/components/ui/checkbox.tsx`
  - `apps/web/components/ui/confirm-dialog.tsx`
  - `apps/web/components/ui/form-layout.tsx`
  - `apps/web/components/ui/form.tsx`
  - `apps/web/components/ui/label.tsx`
  - `apps/web/components/ui/multi-select.tsx`
  - `apps/web/components/ui/popover.tsx`
  - `apps/web/components/ui/scroll-area.tsx`
  - `apps/web/components/ui/scrollable-dialog.tsx`
  - `apps/web/components/ui/separator.tsx`
  - `apps/web/components/ui/skeleton.tsx`
  - `apps/web/components/ui/switch.tsx`
  - `apps/web/components/ui/table-layout.tsx`
  - `apps/web/components/ui/table-skeleton.tsx`
- Marked structural wrappers as `NJ` with explicit reasons in manifest:
  - `apps/web/components/ui/chart-loading-state.tsx`
  - `apps/web/components/ui/page-header.tsx`
  - `apps/web/components/ui/page-shell.tsx`
  - `apps/web/components/ui/toaster.tsx`

### Phase 6 domain migration wave 1 (dashboard/orders/reports route orchestrators)
- Updated route-level semantic token usage in:
  - `apps/web/app/(dashboard)/page.tsx`
  - `apps/web/app/(dashboard)/orders/page.tsx`
  - `apps/web/app/(dashboard)/orders/new/page.tsx`
  - `apps/web/app/(dashboard)/orders/[id]/page.tsx`
  - `apps/web/app/(dashboard)/reports/page.tsx`
- Changes include replacing broad card/muted/background usages with semantic surface/divider/input/interaction/error-muted/info-muted/warning-muted token classes.

### Tracking updates
- `docs/theme-token-migration.csv`
  - Updated Phase 5 to fully complete (`33 DN`, `4 NJ`).
  - Marked Phase 6 Wave 1 files as `DN`.
- `docs/theme-token-migration-status.md`
  - Updated phase ledger and coverage snapshot.

### Verification run after edits
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run lint -w web` ✅
- `npm run theme:migration:verify` ✅
- `npm run theme:usage:audit` ✅

## 2026-03-04 — Pass 87 (Theme Token V2 Phase 6 Wave 1 component sweep)

### Scope completed in this pass
- Migrated token usage from broad legacy classes to semantic V2 tokens in wave-1 domain components (dashboard/payments/reports + related order list/task tables).
- Standardized classes toward:
  - `bg-surface` / `bg-surface-elevated`
  - `border-divider`
  - `text-text-primary` / `text-text-secondary`
  - `bg-interaction-hover`
  - semantic muted tracks (`bg-pending-muted`) and semantic alert surfaces (`bg-error-muted`, `bg-success-muted`).

### Files updated
- `apps/web/components/dashboard/dashboard-design-popularity-card.tsx`
- `apps/web/components/dashboard/dashboard-garment-breakdown-card.tsx`
- `apps/web/components/dashboard/dashboard-kpi-card.tsx`
- `apps/web/components/dashboard/dashboard-overdue-banner.tsx`
- `apps/web/components/dashboard/dashboard-overdue-orders-card.tsx`
- `apps/web/components/dashboard/dashboard-productivity-card.tsx`
- `apps/web/components/dashboard/dashboard-revenue-expenses-card.tsx`
- `apps/web/components/payments/payments-disburse-dialog.tsx`
- `apps/web/components/payments/payments-employee-selector-card.tsx`
- `apps/web/components/payments/payments-history-section.tsx`
- `apps/web/components/payments/payments-summary-cards.tsx`
- `apps/web/components/reports/reports-chart-legend.tsx`
- `apps/web/components/reports/reports-distribution-chart.tsx`
- `apps/web/components/reports/reports-export-grid.tsx`
- `apps/web/components/reports/reports-exports-tab.tsx`
- `apps/web/components/reports/reports-financial-trend-chart.tsx`
- `apps/web/components/reports/reports-overview-tab.tsx`
- `apps/web/components/reports/reports-productivity-chart.tsx`
- `apps/web/components/reports/reports-weekly-print-card.tsx`
- `apps/web/components/reports/reports-workspace-filters.tsx`
- `apps/web/components/orders/my-orders-table.tsx`
- `apps/web/components/orders/orders-list-table.tsx`
- `apps/web/components/orders/order-detail-breadcrumb.tsx`
- `apps/web/components/orders/task-assignment/task-assignment-table.tsx`

### Migration tracker updates
- `docs/theme-token-migration.csv`
  - Marked above files as `DN` in Phase 6 with note: `Phase 6 domain token migration wave 1 component sweep`.
- `docs/theme-token-migration-status.md`
  - Updated phase 6 note and coverage snapshot to current manifest state (`DN=74`, `NS=173`, `NJ=6`).

### Verification run after edits
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run lint -w web` ✅
- `npm run theme:migration:verify` ✅
- `npm run theme:usage:audit` ✅

## 2026-03-05 — Pass 88 (Theme Token V2 Phase 6 Orders detail/form sweep)

### Scope completed in this pass
- Continued Phase 6 domain migration for the Orders module by converting local component styles from broad legacy classes to semantic V2 tokens.
- Standardized this batch to:
  - `bg-surface` / `bg-surface-elevated`
  - `border-divider`
  - `text-text-primary` / `text-text-secondary`
  - `bg-pending-muted` for neutral state blocks
  - semantic info/success/error muted surfaces where appropriate.

### Files migrated (`DN`)
- `apps/web/components/orders/order-customer-insight-card.tsx`
- `apps/web/components/orders/order-detail-header-card.tsx`
- `apps/web/components/orders/order-financial-summary-card.tsx`
- `apps/web/components/orders/order-form-customer-card.tsx`
- `apps/web/components/orders/order-form-item-card.tsx`
- `apps/web/components/orders/order-form-items-card.tsx`
- `apps/web/components/orders/order-form-summary-card.tsx`
- `apps/web/components/orders/order-items-table.tsx`
- `apps/web/components/orders/order-lifecycle-card.tsx`
- `apps/web/components/orders/order-payment-dialog.tsx`
- `apps/web/components/orders/order-share-dialog.tsx`
- `apps/web/components/orders/order-timeline-card.tsx`

### Files reviewed as no-change justified (`NJ`)
- `apps/web/components/orders/my-orders-toolbar.tsx`
  - No direct color semantics; fully delegates styling to tokenized table primitives.
- `apps/web/components/orders/orders-list-toolbar.tsx`
  - No direct color semantics; fully delegates styling to tokenized table/select/button primitives.
- `apps/web/components/orders/order-form-skeleton.tsx`
  - Structural loading layout; color semantics delegated to tokenized `Card` and `Skeleton` primitives.

### Migration tracker updates
- `docs/theme-token-migration.csv`
  - Updated above files to `DN`/`NJ` for Phase 6 with explicit notes.
- `docs/theme-token-migration-status.md`
  - Updated phase note and coverage snapshot.

### Snapshot after this pass
- Total scoped files: `253`
- `DN`: `86`
- `NS`: `158`
- `NJ`: `9`
- Phase 6 breakdown: `DN=41`, `NS=156`, `NJ=3`

### Verification run after edits
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run lint -w web` ✅
- `npm run theme:migration:verify` ✅
- `npm run theme:usage:audit` ✅

## 2026-03-05 — Pass 89 (Theme Token V2 Phase 6 Customers sweep)

### Scope completed in this pass
- Completed the Customers domain migration sweep for Phase 6.
- Replaced broad token usage with semantic V2 tokens in customer list/detail/profile/measurement UI.
- Marked wrapper/structural files as `NJ` where no direct color semantics existed.

### Files migrated (`DN`)
- `apps/web/components/customers/CustomerTable.tsx`
- `apps/web/components/customers/MeasurementForm.tsx`
- `apps/web/components/customers/detail/customer-detail-breadcrumb.tsx`
- `apps/web/components/customers/detail/customer-detail-header.tsx`
- `apps/web/components/customers/detail/customer-measurements-tab.tsx`
- `apps/web/components/customers/detail/customer-notes-tab.tsx`
- `apps/web/components/customers/detail/customer-orders-tab.tsx`
- `apps/web/components/customers/detail/customer-profile-card.tsx`
- `apps/web/components/customers/list/customers-directory-table.tsx`

### Files reviewed as no-change justified (`NJ`)
- `apps/web/app/(dashboard)/customers/[id]/page.tsx`
- `apps/web/app/(dashboard)/customers/page.tsx`
- `apps/web/components/customers/CustomerDialog.tsx`
- `apps/web/components/customers/detail/customer-detail-skeleton.tsx`
- `apps/web/components/customers/detail/customer-detail-tabs.tsx`
- `apps/web/components/customers/detail/customer-measurement-dialog.tsx`
- `apps/web/components/customers/dialog/customer-dialog-address-field.tsx`
- `apps/web/components/customers/dialog/customer-dialog-meta-fields.tsx`
- `apps/web/components/customers/dialog/customer-dialog-primary-fields.tsx`
- `apps/web/components/customers/list/customers-list-toolbar.tsx`
- `apps/web/components/customers/list/customers-page-header.tsx`

### Migration tracker updates
- `docs/theme-token-migration.csv`
  - Updated all customer domain rows to `DN`/`NJ` with explicit notes.
- `docs/theme-token-migration-status.md`
  - Updated phase note and coverage snapshot.

### Snapshot after this pass
- Total scoped files: `253`
- `DN`: `95`
- `NS`: `138`
- `NJ`: `20`
- Phase 6 breakdown: `DN=50`, `NS=136`, `NJ=14`

### Verification run after edits
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run lint -w web` ✅
- `npm run theme:migration:verify` ✅
- `npm run theme:usage:audit` ✅

## 2026-03-05 — Pass 90 (Theme Token V2 Phase 6 Employees sweep)

### Scope completed in this pass
- Completed the Employees domain migration sweep for Phase 6.
- Replaced remaining broad token classes in employee detail/list/contact surfaces with semantic V2 tokens.
- Marked orchestrator/wrapper-only employee files as `NJ` where styles are delegated to shared primitives.

### Files migrated (`DN`)
- `apps/web/app/(dashboard)/employees/page.tsx`
- `apps/web/components/employees/AccountCreationDialog.tsx`
- `apps/web/components/employees/detail/employee-detail-breadcrumb.tsx`
- `apps/web/components/employees/detail/employee-detail-header.tsx`
- `apps/web/components/employees/detail/employee-detail-tabs.tsx`
- `apps/web/components/employees/detail/employee-ledger-entry-dialog.tsx`
- `apps/web/components/employees/detail/employee-profile-sidebar.tsx`
- `apps/web/components/employees/dialog/employee-dialog-contact-fields.tsx`
- `apps/web/components/employees/list/employees-list-table.tsx`

### Files reviewed as no-change justified (`NJ`)
- `apps/web/app/(dashboard)/employees/[id]/page.tsx`
- `apps/web/components/employees/EmployeeDialog.tsx`
- `apps/web/components/employees/detail/employee-detail-skeleton.tsx`
- `apps/web/components/employees/detail/employee-document-upload-dialog.tsx`
- `apps/web/components/employees/detail/employee-financial-cards.tsx`
- `apps/web/components/employees/dialog/employee-dialog-primary-fields.tsx`
- `apps/web/components/employees/dialog/employee-dialog-work-fields.tsx`
- `apps/web/components/employees/list/employees-list-toolbar.tsx`

### Tracking updates
- `docs/theme-token-migration.csv`
  - Updated all employee rows in Phase 6 to `DN`/`NJ` with explicit notes.
- `docs/theme-token-migration-status.md`
  - Updated phase note, coverage snapshot, and latest-pass list.

### Snapshot after this pass
- Total scoped files: `253`
- `DN`: `104`
- `NS`: `121`
- `NJ`: `28`
- Phase 6 breakdown: `DN=59`, `NS=119`, `NJ=22`

### Verification run after edits
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run lint -w web` ✅
- `npm run theme:migration:verify` ✅
- `npm run theme:usage:audit` ✅

## 2026-03-05 — Pass 91 (Theme Token V2 Phase 6 Expenses sweep)

### Scope completed in this pass
- Completed the Expenses domain migration sweep for Phase 6.
- Replaced remaining broad token classes in expense dialogs/tables with semantic V2 tokens.
- Marked filters/overview components as `NJ` where styling already delegates to shared tokenized primitives.

### Files migrated (`DN`)
- `apps/web/app/(dashboard)/expenses/page.tsx`
- `apps/web/components/expenses/expense-create-dialog.tsx`
- `apps/web/components/expenses/expenses-table.tsx`

### Files reviewed as no-change justified (`NJ`)
- `apps/web/components/expenses/expenses-filters-card.tsx`
- `apps/web/components/expenses/expenses-overview-cards.tsx`

### Tracking updates
- `docs/theme-token-migration.csv`
  - Updated all expenses rows to `DN`/`NJ` with explicit notes.
- `docs/theme-token-migration-status.md`
  - Updated phase note, coverage snapshot, and latest-pass section.

### Snapshot after this pass
- Total scoped files: `253`
- `DN`: `107`
- `NS`: `116`
- `NJ`: `30`
- Phase 6 breakdown: `DN=62`, `NS=114`, `NJ=24`

## 2026-03-05 — Pass 92 (Theme Token V2 Phase 6 Users settings sweep)

### Scope completed in this pass
- Completed the Settings Users subdomain migration for Phase 6.
- Replaced remaining broad token usage in the users access directory with semantic V2 tokens.
- Marked route/header/stats wrappers as `NJ` where visuals are delegated to shared primitives.

### Files migrated (`DN`)
- `apps/web/components/config/UsersTable.tsx`
- `apps/web/components/config/users/user-account-dialog.tsx`
- `apps/web/components/config/users/users-access-table.tsx`
- `apps/web/components/config/users/users-list-toolbar.tsx`

### Files reviewed as no-change justified (`NJ`)
- `apps/web/app/(dashboard)/settings/users/page.tsx`
- `apps/web/components/config/users/users-page-header.tsx`
- `apps/web/components/config/users/users-stats-grid.tsx`

### Tracking updates
- `docs/theme-token-migration.csv`
  - Updated settings users rows to `DN`/`NJ` with explicit reasons.
- `docs/theme-token-migration-status.md`
  - Updated phase note, coverage snapshot, and latest-pass list.

### Snapshot after this pass
- Total scoped files: `253`
- `DN`: `111`
- `NS`: `109`
- `NJ`: `33`
- Phase 6 breakdown: `DN=66`, `NS=107`, `NJ=27`

### Verification run after edits
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run lint -w web` ✅
- `npm run theme:migration:verify` ✅
- `npm run theme:usage:audit` ✅

## 2026-03-05 — Pass 93 (Theme Token V2 Phase 6 Branches sweep)

### Scope completed in this pass
- Completed the Settings Branches subdomain migration for Phase 6.
- Replaced broad token usage in branch directory, branch hub cards, and destructive summaries with semantic V2 tokens.
- Marked route/orchestrator/stat/skeleton wrappers as `NJ` where visuals are delegated to shared primitives.

### Files migrated (`DN`)
- `apps/web/components/config/BranchesTable.tsx`
- `apps/web/components/config/branches/branch-delete-summary.tsx`
- `apps/web/components/config/branches/branch-form-dialog.tsx`
- `apps/web/components/config/branches/branches-directory-table.tsx`
- `apps/web/components/config/branches/hub/branch-global-pricing-card.tsx`
- `apps/web/components/config/branches/hub/branch-hub-breadcrumbs.tsx`
- `apps/web/components/config/branches/hub/branch-hub-meta-card.tsx`
- `apps/web/components/config/branches/hub/branch-hub-overview-header.tsx`

### Files reviewed as no-change justified (`NJ`)
- `apps/web/app/(dashboard)/settings/branches/page.tsx`
- `apps/web/app/(dashboard)/settings/branches/[id]/page.tsx`
- `apps/web/components/config/BranchHubConfig.tsx`
- `apps/web/components/config/branches/branches-list-toolbar.tsx`
- `apps/web/components/config/branches/branches-page-header.tsx`
- `apps/web/components/config/branches/hub/branch-hub-relations-grid.tsx`
- `apps/web/components/config/branches/hub/branch-hub-skeleton.tsx`

### Tracking updates
- `docs/theme-token-migration.csv`
  - Updated settings branches rows to `DN`/`NJ` with explicit reasons.
- `docs/theme-token-migration-status.md`
  - Updated phase note, coverage snapshot, and latest-pass list.

### Snapshot after this pass
- Total scoped files: `253`
- `DN`: `119`
- `NS`: `94`
- `NJ`: `40`
- Phase 6 breakdown: `DN=74`, `NS=92`, `NJ=34`

### Verification run after edits
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run lint -w web` ✅
- `npm run theme:migration:verify` ✅
- `npm run theme:usage:audit` ✅

## 2026-03-05 — Pass 94 (Theme Token V2 Phase 6 Platform settings sweep)

### Scope completed in this pass
- Completed the platform settings domain sweep for appearance, attendance, audit logs, integrations, and system settings.
- Replaced broad legacy token usage in settings cards/tables/panels with semantic V2 tokens.
- Marked route wrappers and stat/orchestrator components as `NJ` where they delegate all visuals to shared primitives.

### Files migrated (`DN`)
- `apps/web/components/config/appearance/appearance-mode-card.tsx`
- `apps/web/components/config/appearance/appearance-preset-directory.tsx`
- `apps/web/components/config/attendance/attendance-settings-page.tsx`
- `apps/web/components/config/audit-logs/audit-logs-page.tsx`
- `apps/web/components/config/integrations/integrations-settings-page.tsx`
- `apps/web/components/config/system/system-settings-state-card.tsx`
- `apps/web/components/config/system/system-settings-workflow-card.tsx`

### Files reviewed as no-change justified (`NJ`)
- `apps/web/app/(dashboard)/settings/appearance/page.tsx`
- `apps/web/app/(dashboard)/settings/attendance/page.tsx`
- `apps/web/app/(dashboard)/settings/audit-logs/page.tsx`
- `apps/web/app/(dashboard)/settings/integrations/page.tsx`
- `apps/web/app/(dashboard)/settings/system/page.tsx`
- `apps/web/components/config/appearance/appearance-settings-page.tsx`
- `apps/web/components/config/appearance/appearance-stats-grid.tsx`
- `apps/web/components/config/system/system-settings-page.tsx`
- `apps/web/components/config/system/system-settings-stats-grid.tsx`

### Tracking updates
- `docs/theme-token-migration.csv`
  - Updated platform settings rows to `DN`/`NJ` with explicit reasons.
- `docs/theme-token-migration-status.md`
  - Updated phase note, coverage snapshot, and latest-pass list.

### Snapshot after this pass
- Total scoped files: `253`
- `DN`: `126`
- `NS`: `78`
- `NJ`: `49`
- Phase 6 breakdown: `DN=81`, `NS=76`, `NJ=43`

### Verification run after edits
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run lint -w web` ✅
- `npm run theme:migration:verify` ✅
- `npm run theme:usage:audit` ✅

## 2026-03-05 — Pass 95 (Theme Token V2 Phase 6 Design Types sweep)

### Scope completed in this pass
- Completed the Design Types settings subdomain sweep for Phase 6.
- Migrated the remaining token-drift in the design types directory table to semantic V2 tokens.
- Marked all route/dialog/header/stats orchestration files as `NJ` where they already relied on shared tokenized primitives.

### Files migrated (`DN`)
- `apps/web/components/design-types/design-types-table.tsx`

### Files reviewed as no-change justified (`NJ`)
- `apps/web/app/(dashboard)/settings/design-types/page.tsx`
- `apps/web/components/design-types/CreateDesignTypeDialog.tsx`
- `apps/web/components/design-types/design-types-page-header.tsx`
- `apps/web/components/design-types/design-types-stats-grid.tsx`
- `apps/web/components/design-types/dialog/design-type-dialog-basic-fields.tsx`
- `apps/web/components/design-types/dialog/design-type-dialog-scope-fields.tsx`
- `apps/web/components/design-types/dialog/design-type-dialog-sort-field.tsx`

### Tracking updates
- `docs/theme-token-migration.csv`
  - Updated design types rows to `DN`/`NJ` with explicit reasons.
- `docs/theme-token-migration-status.md`
  - Updated phase note, coverage snapshot, and latest-pass list.

### Snapshot after this pass
- Total scoped files: `253`
- `DN`: `127`
- `NS`: `70`
- `NJ`: `56`
- Phase 6 breakdown: `DN=82`, `NS=68`, `NJ=50`

### Verification run after edits
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run lint -w web` ✅
- `npm run theme:migration:verify` ✅
- `npm run theme:usage:audit` ✅

## 2026-03-05 — Pass 96 (Theme Token V2 Phase 6 Rates sweep)

### Scope completed in this pass
- Completed the Rates settings subdomain sweep for Phase 6.
- Replaced remaining broad token usage in rates list/table/dialog with semantic V2 tokens.
- Marked rates header/search/stats components as `NJ` where visuals are already delegated to shared primitives.

### Files migrated (`DN`)
- `apps/web/app/(dashboard)/settings/rates/page.tsx`
- `apps/web/components/rates/CreateRateDialog.tsx`
- `apps/web/components/rates/RatesList.tsx`
- `apps/web/components/rates/rates-table.tsx`

### Files reviewed as no-change justified (`NJ`)
- `apps/web/components/rates/rates-page-header.tsx`
- `apps/web/components/rates/rates-search-stats.tsx`
- `apps/web/components/rates/rates-stats-grid.tsx`

### Tracking updates
- `docs/theme-token-migration.csv`
  - Updated rates rows to `DN`/`NJ` with explicit reasons.
- `docs/theme-token-migration-status.md`
  - Updated phase note, coverage snapshot, and latest-pass list.

### Snapshot after this pass
- Total scoped files: `253`
- `DN`: `131`
- `NS`: `63`
- `NJ`: `59`
- Phase 6 breakdown: `DN=86`, `NS=61`, `NJ=53`

### Verification run after edits
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run lint -w web` ✅
- `npm run theme:migration:verify` ✅
- `npm run theme:usage:audit` ✅

## 2026-03-05 — Pass 97 (Theme Token V2 Phase 6 Garments + Measurements + Expense Categories sweep)

### Scope completed in this pass
- Completed the largest remaining settings-domain sweep for garments, measurements, and expense categories.
- Migrated legacy broad token usage (`foreground/muted/card/background/border`) to semantic V2 tokens across detail/list/dialog surfaces.
- Marked route wrappers, stat cards, and form shell components as `NJ` where visual semantics are delegated to shared tokenized primitives.

### Files migrated (`DN`)
- `apps/web/components/config/GarmentPriceHistoryDialog.tsx`
- `apps/web/components/config/GarmentTypeDialog.tsx`
- `apps/web/components/config/GarmentWorkflowStepsDialog.tsx`
- `apps/web/components/config/MeasurementCategoryDetail.tsx`
- `apps/web/components/config/expenses/expense-categories-page.tsx`
- `apps/web/components/config/garments/detail/garment-detail-breadcrumb.tsx`
- `apps/web/components/config/garments/detail/garment-detail-header.tsx`
- `apps/web/components/config/garments/detail/garment-detail-not-found.tsx`
- `apps/web/components/config/garments/detail/garment-measurement-forms-card.tsx`
- `apps/web/components/config/garments/detail/garment-overview-card.tsx`
- `apps/web/components/config/garments/detail/garment-pricing-logs-card.tsx`
- `apps/web/components/config/garments/detail/garment-pricing-sidebar.tsx`
- `apps/web/components/config/garments/detail/garment-rates-section.tsx`
- `apps/web/components/config/garments/list/garment-types-inventory-table.tsx`
- `apps/web/components/config/measurements/detail/measurement-category-breadcrumbs.tsx`
- `apps/web/components/config/measurements/detail/measurement-category-detail-header.tsx`
- `apps/web/components/config/measurements/detail/measurement-field-dialog-dropdown-options.tsx`
- `apps/web/components/config/measurements/detail/measurement-fields-table.tsx`
- `apps/web/components/config/measurements/list/measurement-categories-inventory-table.tsx`

### Files reviewed as no-change justified (`NJ`)
- `apps/web/app/(dashboard)/settings/expense-categories/page.tsx`
- `apps/web/app/(dashboard)/settings/garments/page.tsx`
- `apps/web/app/(dashboard)/settings/garments/[id]/page.tsx`
- `apps/web/app/(dashboard)/settings/measurements/page.tsx`
- `apps/web/app/(dashboard)/settings/measurements/[id]/page.tsx`
- `apps/web/components/config/GarmentTypesTable.tsx`
- `apps/web/components/config/MeasurementCategoriesTable.tsx`
- `apps/web/components/config/MeasurementCategoryDialog.tsx`
- `apps/web/components/config/MeasurementFieldDialog.tsx`
- `apps/web/components/config/garments/detail/garment-analytics-stats-grid.tsx`
- `apps/web/components/config/garments/detail/garment-detail-skeleton.tsx`
- `apps/web/components/config/garments/list/garment-types-list-toolbar.tsx`
- `apps/web/components/config/garments/list/garment-types-page-header.tsx`
- `apps/web/components/config/garments/list/garment-types-stats-grid.tsx`
- `apps/web/components/config/measurements/detail/measurement-field-dialog-basic-fields.tsx`
- `apps/web/components/config/measurements/detail/measurement-field-dialog-category-note.tsx`
- `apps/web/components/config/measurements/detail/measurement-field-dialog-required-toggle.tsx`
- `apps/web/components/config/measurements/detail/measurement-fields-stats-grid.tsx`
- `apps/web/components/config/measurements/dialog/measurement-category-dialog-name-field.tsx`
- `apps/web/components/config/measurements/list/measurement-categories-list-toolbar.tsx`
- `apps/web/components/config/measurements/list/measurement-categories-page-header.tsx`
- `apps/web/components/config/measurements/list/measurement-categories-stats-grid.tsx`

### Tracking updates
- `docs/theme-token-migration.csv`
  - Updated garments/measurements/expense-category rows to `DN`/`NJ` with explicit reasons.
- `docs/theme-token-migration-status.md`
  - Updated phase note, coverage snapshot, and latest-pass list.

### Snapshot after this pass
- Total scoped files: `253`
- `DN`: `150`
- `NS`: `22`
- `NJ`: `81`
- Phase 6 breakdown: `DN=105`, `NS=20`, `NJ=75`

### Verification run after edits
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run lint -w web` ✅
- `npm run theme:migration:verify` ✅
- `npm run theme:usage:audit` ✅

## 2026-03-05 — Pass 98 (Theme Token V2 Final NS closure sweep)

### Scope completed in this pass
- Completed the last unreviewed (`NS`) files in the theme migration manifest.
- Migrated remaining token drift in auth/search/status components to semantic V2 tokens.
- Closed all remaining manifest rows as `DN` or `NJ`, including phase-2 helper/re-export files.

### Files migrated (`DN`)
- `apps/web/components/auth/login-form-panel.tsx`
- `apps/web/components/layout/BranchSelector.tsx`
- `apps/web/components/layout/GlobalSearchCommand.tsx`
- `apps/web/components/status/status-order-details-card.tsx`
- `apps/web/components/status/status-pin-gate-card.tsx`

### Files reviewed as no-change justified (`NJ`)
- `apps/web/app/(dashboard)/my-orders/page.tsx`
- `apps/web/app/(dashboard)/orders/[id]/TaskAssignmentDialog.tsx`
- `apps/web/app/(dashboard)/payments/page.tsx`
- `apps/web/app/(dashboard)/settings/page.tsx`
- `apps/web/app/layout.tsx`
- `apps/web/components/AuthProvider.tsx`
- `apps/web/components/ThemePresetProvider.tsx`
- `apps/web/components/ThemeProvider.tsx`
- `apps/web/components/auth/can.tsx`
- `apps/web/components/auth/with-role-guard.tsx`
- `apps/web/components/common/ConfirmPasswordDialog.tsx`
- `apps/web/components/reports/reports-financial-tab.tsx`
- `apps/web/components/reports/reports-operations-tab.tsx`
- `apps/web/components/status/status-order-header-card.tsx`
- `apps/web/components/status/status-order-items-card.tsx`
- `apps/web/lib/chart-theme.ts`
- `apps/web/lib/theme-presets.ts`

### Tracking updates
- `docs/theme-token-migration.csv`
  - Updated final `NS` rows to `DN`/`NJ` with explicit reasons.
- `docs/theme-token-migration-status.md`
  - Updated phase ledger (`Phase 2` and `Phase 6` to `DN`), coverage snapshot, and latest-pass list.

### Snapshot after this pass
- Total scoped files: `253`
- `DN`: `155`
- `NS`: `0`
- `NJ`: `98`
- Phase 6 breakdown: `DN=110`, `NS=0`, `NJ=90`

### Verification run after edits
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run lint -w web` ✅
- `npm run theme:migration:verify` ✅
- `npm run theme:usage:audit` ✅

## 2026-03-05 — Pass 99 (Component-first theme consistency refactor)

### Why this pass
- Repeated theme classes were being passed at callsites (`Card` / `TableSurface`) instead of being owned by shared UI primitives.
- Standardized design should be controlled from component variants, not per-page class duplication.

### Primitive-level centralization
- `apps/web/components/ui/card.tsx`
  - Made divider/surface shell the canonical base.
  - Added reusable semantic variants:
    - `panel`, `shell`, `shellFlat`, `elevatedPanel`, `elevatedShell`
    - `successSoft`, `warningSoft`, `errorSoft`, `success`, `error`
  - Kept existing `default`, `premium`, `interactive` variants.

- `apps/web/components/ui/table-layout.tsx`
  - Added `TableSurface` variants and moved surface styling into component:
    - `default`, `flat`, `elevated`
  - Removed need for repeated table border/background classes at usage sites.

### App-wide callsite cleanup
- Removed duplicated `TableSurface` style props in all usages (`className="border-divider bg-surface"` removed globally).
- Replaced repeated `Card` class bundles with variants across domain/shell pages.
- Current centralized usage footprint:
  - `Card` semantic variants are used in 43 files.
  - `TableSurface` now has clean default usage everywhere, with one explicit `variant="flat"` callsite for task-assignment table.

### Representative migrated callsites
- `apps/web/components/employees/detail/employee-detail-tabs.tsx` (`shellFlat`, `successSoft`)
- `apps/web/components/reports/reports-export-grid.tsx` (`shellFlat`)
- `apps/web/components/customers/detail/customer-measurements-tab.tsx` (`shell`)
- `apps/web/components/dashboard/dashboard-overdue-banner.tsx` (`error`, `success`)
- `apps/web/components/config/integrations/integrations-settings-page.tsx` (`warningSoft`)
- `apps/web/components/orders/order-form-items-card.tsx` (removed border override on `premium`)
- `apps/web/components/orders/order-form-summary-card.tsx` (moved from class override to canonical `Card`)

### Verification run after edits
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run lint -w web` ✅
- `npm run theme:migration:verify` ✅
- `npm run theme:usage:audit` ✅

## 2026-03-05 — Pass 100 (Full shared-component consistency sweep)

### Goal
- Move remaining design-token styling out of page/component callsites and into shared UI primitives for consistent, component-first theming.

### Shared primitive upgrades
- `apps/web/components/ui/button.tsx`
  - Added variants to remove per-callsite theme classes:
    - `tablePrimary`, `tableSuccess`, `infoGhost`, `outlinePrimary`, `outlineDashed`, `sidebarIcon`, `sidebarIconMuted`
- `apps/web/components/ui/select.tsx`
  - Added variants:
    - `appBar`, `inlineGhost`
- `apps/web/components/ui/tabs.tsx`
  - Added variants:
    - `TabsList.variant="segmented"`
    - `TabsTrigger.variant="segmented"`
- `apps/web/components/ui/card.tsx`
  - Added semantic card variants:
    - `panel`, `shell`, `shellFlat`, `elevatedPanel`, `elevatedShell`, `successSoft`, `warningSoft`, `errorSoft`, `success`, `error`
  - Added `CardFooter` tone variants:
    - `tone="mutedSection"`
- `apps/web/components/ui/table-layout.tsx`
  - Added `TableSurface` variants (`default`, `flat`, `elevated`) and moved canonical surface style into primitive.
- `apps/web/components/ui/input.tsx`
  - Added variants:
    - `readOnlyCode`, `premiumSuccess`

### Callsite refactors (component-first)
- Replaced repeated `Card` surface/border/shadow class bundles with variants in domain modules.
- Replaced repeated `TableSurface` border/background class bundles with default variant usage.
- Updated button usages to new variants in:
  - `apps/web/components/layout/Sidebar.tsx`
  - `apps/web/components/layout/ThemeToggle.tsx`
  - `apps/web/components/layout/Topbar.tsx`
  - `apps/web/components/orders/order-items-table.tsx`
  - `apps/web/components/orders/task-assignment/task-assignment-table.tsx`
  - `apps/web/components/orders/order-share-dialog.tsx`
  - `apps/web/components/dashboard/dashboard-design-popularity-card.tsx`
  - `apps/web/components/config/GarmentWorkflowStepsDialog.tsx`
- Updated select/tabs callsites to new variants in:
  - `apps/web/components/layout/BranchSelector.tsx`
  - `apps/web/components/orders/task-assignment/task-assignment-table.tsx`
  - `apps/web/app/(dashboard)/reports/page.tsx`
- Updated input/card-footer callsites:
  - `apps/web/components/orders/order-share-dialog.tsx`
  - `apps/web/components/orders/order-form-summary-card.tsx`

### Audit results after this pass
- No remaining `Card/CardHeader/CardContent/CardFooter` callsites with `bg-*`, `border-*`, `shadow-*` classes.
- No remaining `TableSurface` callsites with `bg-*`, `border-*`, `shadow-*` classes.
- No remaining `Button`/`Input`/`SelectTrigger`/`TabsList`/`TabsTrigger` callsites with `bg-*`, `border-*`, `shadow-*` classes.

### Verification run after edits
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run lint -w web` ✅
- `npm run theme:migration:verify` ✅
- `npm run theme:usage:audit` ✅

## 2026-03-05 — Pass 101 (InfoTile Primitive + App-wide Tile Consistency Sweep)

### Goal
- Remove remaining repeated `border/bg/padding` tile classes from page-level callsites and centralize them in one shared UI primitive.

### New reusable primitive
- `apps/web/components/ui/info-tile.tsx` (`DN`)
  - Added canonical `InfoTile` component for semantic tile surfaces.
  - Added exported `infoTileVariants` helper for non-`div` elements (`button`, `a`, `Link`) that need the same semantic tile styling.
  - Variants:
    - `tone`: `elevated`, `elevatedSoft`, `elevatedMuted`, `pending`, `success`, `error`, `surface`
    - `padding`: `none`, `xs`, `sm`, `md`, `lg`, `content`, `contentLg`
    - `layout`: `default`, `row`, `between`, `betweenGap`
    - `borderStyle`: `solid`, `dashed`, `dashedStrong`
    - `radius`: `lg`, `xl`

### Component-first migration coverage (this pass)
- Orders:
  - `apps/web/components/orders/order-customer-insight-card.tsx`
  - `apps/web/components/orders/order-form-customer-card.tsx`
  - `apps/web/components/orders/order-financial-summary-card.tsx`
  - `apps/web/components/orders/order-form-summary-card.tsx`
  - `apps/web/components/orders/order-form-item-card.tsx`
  - `apps/web/components/orders/order-timeline-card.tsx`
- Dashboard:
  - `apps/web/components/dashboard/dashboard-revenue-expenses-card.tsx`
  - `apps/web/components/dashboard/dashboard-design-popularity-card.tsx`
  - `apps/web/components/dashboard/dashboard-productivity-card.tsx`
  - `apps/web/components/dashboard/dashboard-garment-breakdown-card.tsx`
- Reports:
  - `apps/web/components/reports/reports-distribution-chart.tsx`
  - `apps/web/components/reports/reports-productivity-chart.tsx`
  - `apps/web/components/reports/reports-workspace-filters.tsx`
  - `apps/web/components/reports/reports-overview-tab.tsx`
  - `apps/web/components/reports/reports-financial-trend-chart.tsx`
- Settings/config:
  - `apps/web/components/config/integrations/integrations-settings-page.tsx`
  - `apps/web/components/config/system/system-settings-state-card.tsx`
  - `apps/web/components/config/system/system-settings-workflow-card.tsx`
  - `apps/web/components/config/expenses/expense-categories-page.tsx`
  - `apps/web/components/config/GarmentTypeDialog.tsx`
  - `apps/web/components/config/appearance/appearance-preset-directory.tsx`
  - `apps/web/components/config/branches/hub/branch-global-pricing-card.tsx`
  - `apps/web/components/config/branches/hub/branch-hub-meta-card.tsx`
  - `apps/web/components/config/branches/branch-delete-summary.tsx`
  - `apps/web/components/config/garments/detail/garment-overview-card.tsx`
  - `apps/web/components/config/garments/detail/garment-pricing-sidebar.tsx`
  - `apps/web/components/config/garments/detail/garment-pricing-logs-card.tsx`
  - `apps/web/components/config/garments/detail/garment-measurement-forms-card.tsx`
  - `apps/web/components/config/garments/list/garment-types-inventory-table.tsx`
  - `apps/web/components/config/users/users-access-table.tsx`
- Employees/customers/layout:
  - `apps/web/components/employees/detail/employee-detail-tabs.tsx`
  - `apps/web/components/customers/detail/customer-profile-card.tsx`
  - `apps/web/components/layout/GlobalSearchCommand.tsx`
  - `apps/web/components/expenses/expense-create-dialog.tsx`
  - `apps/web/components/payments/payments-employee-selector-card.tsx`

### Migration manifest updates
- `docs/theme-token-migration.csv`
  - Added missing scoped primitive rows:
    - `apps/web/components/ui/info-tile.tsx` (`DN`)
    - `apps/web/components/ui/meta-pill.tsx` (`DN`)
  - This fixed `theme:migration:verify` coverage failure.

### Consistency audit result after this pass
- App callsites now have no remaining direct `border-divider + bg-surface-elevated` tile bundles outside shared UI primitives.
- Remaining matches are intentionally inside shared primitives only:
  - `apps/web/components/ui/data-table.tsx`
  - `apps/web/components/ui/empty-state.tsx`

### Verification run after edits
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run lint -w web` ✅
- `npm run theme:migration:verify` ✅
- `npm run theme:usage:audit` ✅

## 2026-03-05 — Pass 102 (SectionIcon Primitive + Header/Icon Shell Centralization)

### Goal
- Eliminate the repeated header/icon container class bundles (`bg-sidebar-active`, `bg-primary/10`, ring styles, rounded sizes) and centralize them in a single reusable primitive.

### New reusable primitive
- `apps/web/components/ui/section-icon.tsx` (`DN`)
  - Added `SectionIcon` with semantic variants:
    - `tone`: `sidebar`, `primary`, `info`, `infoSoft`, `warningSoft`, `errorSoft`
    - `size`: `sm`, `md`, `lg`
    - `framed`: `true|false` (ring on/off)
  - This replaces repeated inline icon-shell wrappers across pages and components.

### Primitive extensions in this pass
- `apps/web/components/ui/info-tile.tsx`
  - Added `tone="inputSurface"` for workflow-step and form-side info tiles.

### Migration coverage (callsites)
- UI shell:
  - `apps/web/components/ui/chart-shell.tsx`
- Orders flow:
  - `apps/web/app/(dashboard)/orders/new/page.tsx`
  - `apps/web/app/(dashboard)/orders/[id]/page.tsx`
  - `apps/web/components/orders/order-customer-insight-card.tsx`
  - `apps/web/components/orders/order-financial-summary-card.tsx`
  - `apps/web/components/orders/order-form-customer-card.tsx`
  - `apps/web/components/orders/order-form-summary-card.tsx`
  - `apps/web/components/orders/order-payment-dialog.tsx`
  - `apps/web/components/orders/order-timeline-card.tsx`
- Payments/reports/status/layout:
  - `apps/web/components/payments/payments-employee-selector-card.tsx`
  - `apps/web/components/payments/payments-disburse-dialog.tsx`
  - `apps/web/components/reports/reports-exports-tab.tsx`
  - `apps/web/components/reports/reports-weekly-print-card.tsx`
  - `apps/web/components/layout/GlobalSearchCommand.tsx`
  - `apps/web/components/status/status-pin-gate-card.tsx`
- Dashboard/customers/employees:
  - `apps/web/components/dashboard/dashboard-garment-breakdown-card.tsx`
  - `apps/web/components/customers/detail/customer-profile-card.tsx`
  - `apps/web/components/employees/detail/employee-detail-tabs.tsx`
  - `apps/web/components/employees/detail/employee-profile-sidebar.tsx`
  - `apps/web/components/employees/AccountCreationDialog.tsx`
- Settings/garments/branches:
  - `apps/web/components/config/branches/hub/branch-global-pricing-card.tsx`
  - `apps/web/components/config/branches/hub/branch-hub-meta-card.tsx`
  - `apps/web/components/config/GarmentPriceHistoryDialog.tsx`
  - `apps/web/components/config/garments/detail/garment-overview-card.tsx`
  - `apps/web/components/config/garments/detail/garment-measurement-forms-card.tsx`
  - `apps/web/components/config/garments/detail/garment-pricing-logs-card.tsx`
  - `apps/web/components/config/garments/detail/garment-pricing-sidebar.tsx`
  - `apps/web/components/config/garments/detail/garment-rates-section.tsx`

### Migration manifest updates
- `docs/theme-token-migration.csv`
  - Added coverage row for:
    - `apps/web/components/ui/section-icon.tsx` (`DN`)

### Verification run after edits
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run lint -w web` ✅
- `npm run theme:migration:verify` ✅
- `npm run theme:usage:audit` ✅

## 2026-03-05 — Pass 103 (Residual Drift Cleanup + Shared Variant Reuse)

### Goal
- Remove remaining feature-level style drift that was still bypassing shared variants after Pass 102.

### Changes completed
- Replaced ad-hoc dashed add-option button with shared button variant:
  - `apps/web/components/config/measurements/detail/measurement-field-dialog-dropdown-options.tsx`
  - Migrated to `Button variant="outlineDashed"` (removed raw dashed/hover color classes)
- Unified avatar fallback semantics in employees list:
  - `apps/web/components/employees/list/employees-list-table.tsx`
  - Switched from sidebar-active to semantic primary tint (`bg-primary/10 text-primary`)
- Removed sidebar-state color from customer avatar color pool:
  - `apps/web/components/customers/list/customers-directory-table.tsx`
  - Replaced `bg-sidebar-active` entry with semantic primary tint

### Residual scope status
- Remaining `bg-sidebar-active` usage is now intentionally constrained to:
  - Shell/navigation primitives (`Sidebar`, `Topbar`)
  - Shared UI primitives (`avatar`, `button`, `badge`, `table`, `skeleton`, `empty/chart-empty`, etc.)
  - `SectionIcon` primitive tone definitions
- No remaining repeated icon-shell or tile-shell class bundles in feature callsites outside shared primitives.

### Verification run after edits
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run lint -w web` ✅
- `npm run theme:migration:verify` ✅
- `npm run theme:usage:audit` ✅

## 2026-03-05 — Pass 104 (Feature Wrapper Drift Elimination + Primitive Variant Expansion)

### Goal
- Remove remaining feature-level wrappers that still hardcoded shared visual bundles (`rounded + border + bg + shadow`) and route them through reusable UI primitives.

### Shared primitive updates
- `apps/web/components/ui/info-tile.tsx`
  - Added semantic tones:
    - `info`
    - `warning`
    - `primarySoft`
    - `inverseSoft`
  - Added interaction variants:
    - `interactive`
    - `interactivePrimary`
- `apps/web/components/ui/input.tsx`
  - Added `variant="searchCommand"` for global search command input styling.
  - Added `variant="inlineChip"` for compact inline token/option editor inputs.
- `apps/web/components/ui/section-icon.tsx`
  - Added `tone="timelinePrimary"` for timeline marker/icon shells.

### Feature/component migrations in this pass
- `apps/web/components/status/status-pin-gate-card.tsx`
  - Replaced raw outer shell with `Card variant="premium"` + `CardContent`.
  - Replaced logo wrapper shell with `InfoTile`.
- `apps/web/components/orders/order-share-dialog.tsx`
  - Replaced raw PIN callout box with `InfoTile tone="info"`.
- `apps/web/components/config/measurements/detail/measurement-field-dialog-dropdown-options.tsx`
  - Replaced raw inline `<input>` styling with shared `Input variant="inlineChip"`.
  - Normalized option chip wrapper to `InfoTile` variants.
- `apps/web/components/employees/detail/employee-detail-tabs.tsx`
  - Replaced raw document row wrappers with `InfoTile` semantic variants.
- `apps/web/components/config/branches/branch-delete-summary.tsx`
  - Replaced warning callout container with `InfoTile tone="warning"`.
- `apps/web/components/config/garments/detail/garment-overview-card.tsx`
  - Replaced margin snapshot raw box with `InfoTile tone="primarySoft"`.
- `apps/web/components/layout/GlobalSearchCommand.tsx`
  - Switched search input to `Input variant="searchCommand"`.
  - Replaced command hint chip with `MetaPill`.
  - Replaced results popover shell with `Card variant="premium"` + `CardHeader`.
  - Replaced raw error alert block with `InfoTile tone="error"`.
- `apps/web/app/login/page.tsx`
  - Replaced raw login container shell with `Card variant="premium"`.
- `apps/web/components/auth/login-brand-panel.tsx`
  - Replaced brand chip raw shell with `InfoTile tone="inverseSoft"`.
- `apps/web/components/layout/Sidebar.tsx`
  - Replaced mobile sidebar logo wrapper raw shell with `SectionIcon`.
- `apps/web/components/config/garments/detail/garment-pricing-logs-card.tsx`
  - Replaced timeline marker shell with `SectionIcon tone="timelinePrimary"`.
- `apps/web/components/config/garments/list/garment-types-inventory-table.tsx`
  - Replaced hover border/bg classes with `InfoTile interaction="interactivePrimary"`.

### Residual drift status (post-pass scan)
- Feature-level `rounded + border + bg` wrapper bundles are now removed from domain/components scope.
- Remaining `border + bg` wrappers are intentionally layout-shell structures:
  - top app shell/login brand shell/sidebar/topbar wrappers.

### Verification run after edits
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run lint -w web` ✅
- `npm run theme:migration:verify` ✅
- `npm run theme:usage:audit` ✅

## 2026-03-05 — Pass 105 (Cross-Domain Breadcrumb Consolidation)

### Goal
- Eliminate duplicated breadcrumb structure/styles across detail pages and enforce one reusable breadcrumb primitive.

### Shared primitive added
- `apps/web/components/ui/entity-breadcrumb.tsx`
  - New reusable breadcrumb primitive with:
    - `sectionLabel`
    - `currentLabel`
    - `onBack`
    - optional `currentClassName`, `separatorClassName`, `className`
  - Centralizes shared breadcrumb classes and focus/hover behavior.

### Migrations completed
- `apps/web/components/orders/order-detail-breadcrumb.tsx`
- `apps/web/components/customers/detail/customer-detail-breadcrumb.tsx`
- `apps/web/components/employees/detail/employee-detail-breadcrumb.tsx`
- `apps/web/components/config/measurements/detail/measurement-category-breadcrumbs.tsx`
- `apps/web/components/config/garments/detail/garment-detail-breadcrumb.tsx`
- `apps/web/components/config/branches/hub/branch-hub-breadcrumbs.tsx`

### Manifest update
- `docs/theme-token-migration.csv`
  - Added:
    - `apps/web/components/ui/entity-breadcrumb.tsx` (`DN`)

### Verification run after edits
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run lint -w web` ✅
- `npm run theme:migration:verify` ✅
- `npm run theme:usage:audit` ✅

## 2026-03-05 — Pass 106 (Order Detail Page Metrics Standardization)

### Goal
- Remove remaining hand-written metric card blocks from a route page and enforce one reusable metric primitive pattern.

### Shared primitive refinements
- `apps/web/components/ui/stat-card.tsx`
  - Added `iconTone` and `valueTone` props so icon and value semantics can be controlled independently.
  - Updated primary icon tone to semantic primary tint (`bg-primary/10`) instead of sidebar-active.
  - Switched shell styling to component-level card variant (`Card variant="elevatedPanel"`) and removed direct raw border/background shell classes.

### Page migration completed
- `apps/web/app/(dashboard)/orders/[id]/page.tsx`
  - Replaced four custom metric card blocks (Pieces, Assigned Tailors, Active Tasks, Balance Due) with shared `StatCard` usage.
  - Removed local metric shell styling and icon container duplication from page code.

### Result
- `/orders/[id]` now uses a fully reusable metric-card abstraction and no longer defines custom card-shell metric structures inline.

### Verification run after edits
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run lint -w web` ✅
- `npm run theme:migration:verify` ✅
- `npm run theme:usage:audit` ✅

## 2026-03-05 — Pass 107 (Complete Page Recheck + Route-Level Consistency)

### Goal
- Recheck route pages and remove remaining per-page UI drift by preferring shared primitives in page files.

### Route/page consistency updates
- `apps/web/app/(dashboard)/employees/[id]/page.tsx`
  - Replaced custom “employee not found” fallback section with shared `EmptyState`.
  - Aligned route-level empty/error rendering with customer/order detail pages.
- `apps/web/app/(dashboard)/orders/new/page.tsx`
  - Replaced raw workflow `<p>` blocks with shared `Typography` for title/description text.
  - Kept existing `InfoTile` and `Card` structure while removing direct raw text tag styling from page code.

### Result
- Detail route not-found behavior is now consistent across domains using one empty-state primitive.
- Order create route page text styling now follows shared typography component policy.

### Verification run after edits
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run lint -w web` ✅
- `npm run theme:migration:verify` ✅
- `npm run theme:usage:audit` ✅

## 2026-03-05 — Pass 108 (Stats Grid Primitive Rollout Across Pages)

### Goal
- Remove repeated route-level and domain-level stat grid class bundles and enforce a shared responsive metric-grid primitive.

### Shared primitive added
- `apps/web/components/ui/stats-grid.tsx`
  - New reusable stat-grid wrapper with semantic column variants:
    - `columns="two" | "three" | "four" | "threeMd"`
    - `flushSectionSpacing` toggle for page-section contexts.

### Page migrations completed
- `apps/web/app/(dashboard)/employees/page.tsx`
- `apps/web/app/(dashboard)/orders/page.tsx`
- `apps/web/app/(dashboard)/customers/[id]/page.tsx`
- `apps/web/app/(dashboard)/orders/[id]/page.tsx`
- `apps/web/app/(dashboard)/orders/new/page.tsx`
- `apps/web/app/(dashboard)/page.tsx`

### Domain component migrations completed
- `apps/web/components/employees/detail/employee-financial-cards.tsx`
- `apps/web/components/payments/payments-summary-cards.tsx`
- `apps/web/components/expenses/expenses-overview-cards.tsx`

### Manifest updates
- `docs/theme-token-migration.csv`
  - Added:
    - `apps/web/components/ui/stats-grid.tsx` (`DN`)

### Result
- Metric card grids now use one shared layout contract instead of repeated local class strings.
- Route pages and domain summary components share consistent responsive stat-grid behavior.

### Verification run after edits
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run lint -w web` ✅
- `npm run theme:migration:verify` ✅
- `npm run theme:usage:audit` ✅

## 2026-03-05 — Pass 109 (Dashboard Section Layout Unification)

### Goal
- Remove duplicated dashboard section grid wrappers and align dashboard split layouts to one shared layout primitive.

### Page migration completed
- `apps/web/app/(dashboard)/page.tsx`
  - Replaced two repeated manual `PageSection` grid wrappers with shared `DetailSplit`.
  - Preserved visual order and responsive behavior:
    - Financial insights: `ratio="3-2"` (revenue vs garments)
    - Operations insights: `ratio="2-1"` with explicit mobile ordering to keep design card before productivity card.

### Result
- Dashboard section layout now follows the same shared split-layout pattern used elsewhere in the app, reducing per-page layout duplication.

### Verification run after edits
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run lint -w web` ✅
- `npm run theme:migration:verify` ✅
- `npm run theme:usage:audit` ✅

## 2026-03-05 — Pass 110 (Next 2 Pages: Status + Reports Consistency)

### Goal
- Refactor the next two route pages with component-first consistency:
  1. `apps/web/app/status/[token]/page.tsx`
  2. `apps/web/app/(dashboard)/reports/page.tsx`

### Shared primitive updates
- `apps/web/components/status/status-page-frame.tsx` (new)
  - Added reusable public-status route shell wrapper with semantic layout variants:
    - `layout="centered"` for PIN gate state
    - `layout="content"` for empty/error/success content states
- `apps/web/components/ui/tabs.tsx`
  - Added semantic `TabsContent` spacing variants:
    - `default`
    - `roomy`
    - `none`

### Page migrations completed
- `apps/web/app/status/[token]/page.tsx`
  - Replaced duplicated `PageShell`/`PageSection` wrappers with shared `StatusPageFrame`.
  - Unified submitted/not-submitted/error route-state layout handling under one shell contract.
- `apps/web/app/(dashboard)/reports/page.tsx`
  - Removed repeated `TabsContent className="mt-4"` callsite styling.
  - Switched to `TabsContent spacing="roomy"` variant.
  - Replaced duplicated tab-content blocks with tab-config-driven rendering to keep structure consistent.

### Manifest update
- `docs/theme-token-migration.csv`
  - Added:
    - `apps/web/components/status/status-page-frame.tsx` (`DN`)

### Verification run after edits
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run lint -w web` ✅
- `npm run theme:migration:verify` ✅
- `npm run theme:usage:audit` ✅

## 2026-03-05 — Pass 111 (Next 3 Pages: Payments + Expenses + My Orders)

### Goal
- Apply another route-level consistency pass on the next three pages by standardizing page structure and reducing duplicated page logic patterns.

### Page updates completed
- `apps/web/app/(dashboard)/payments/page.tsx`
  - Removed duplicated `PageSection` branches by unifying selected/non-selected employee content into one section.
  - Added explicit `hasSelectedEmployee` flag for clearer page-level render flow.
- `apps/web/app/(dashboard)/expenses/page.tsx`
  - Consolidated duplicated `canManageExpenses` dialog gates into one fragment block.
  - Keeps management dialogs colocated under one role gate for cleaner route-level consistency.
- `apps/web/app/(dashboard)/my-orders/page.tsx`
  - Added `PageSection` wrappers for header and table content to align with dashboard page structure.
  - Set `PageHeader density="compact"` for consistency with other dashboard routes.

### Result
- These three pages now follow the same route-shell rhythm and avoid duplicated conditional wrappers at page level.

### Verification run after edits
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run lint -w web` ✅
- `npm run theme:migration:verify` ✅
- `npm run theme:usage:audit` ✅

## 2026-03-05 — Pass 112 (Dashboard Route Header Structure Alignment)

### Goal
- Align remaining top-level dashboard routes to one route-shell structure pattern by placing page headers inside `PageSection` blocks consistently.

### Page updates completed
- `apps/web/app/(dashboard)/employees/page.tsx`
  - Wrapped `PageHeader` in `PageSection spacing="compact"`.
  - Set `density="compact"` for header rhythm parity with other dashboard routes.
- `apps/web/app/(dashboard)/orders/page.tsx`
  - Wrapped `PageHeader` in `PageSection spacing="compact"`.
  - Set `density="compact"` for consistent header spacing.
- `apps/web/app/(dashboard)/page.tsx`
  - Wrapped `PageHeader` in `PageSection spacing="compact"`.
  - Set `density="compact"` while preserving existing actions and role badge behavior.

### Result
- Top-level dashboard routes now follow the same page-shell hierarchy:
  - `PageShell` → `PageSection` (header) → `PageSection` (content).
- Reduced remaining route-level structural drift in core dashboard pages.

### Verification run after edits
- `npx tsc --noEmit -p apps/web/tsconfig.json` ✅
- `npm run lint -w web` ✅
- `npm run theme:migration:verify` ✅
- `npm run theme:usage:audit` ✅
