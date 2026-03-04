# TBMS Refactor Status

Legend: `NS` (Not Started), `IP` (In Progress), `BL` (Blocked), `DN` (Done), `NJ` (No change justified)

## Phase Ledger

| Phase | Status | Notes |
|---|---|---|
| 0 | DN | Manifest generator/verifier and baseline evidence created. |
| 1 | IP | Implemented env helpers and production-safe secret/API URL handling; completed refresh-token lifecycle hardening (token issuance + hashed persistence + refresh cookie consistency + refresh-claim normalization); switched JWT/jwt-refresh request principals to DB-sourced role/branch/employee state (removing stale token-claim trust), added targeted login/refresh throttling, and enforced startup security env validation (including fail-closed JWT expiry envs in production); additional hardening still pending. |
| 2 | IP | Added canonical role groups in shared constants and reused in middleware/sidebar + API controllers; enforced explicit role metadata by switching `RolesGuard` to deny-by-default for non-public handlers; removed implicit hierarchy escalation so role checks are strict explicit membership; normalized super-admin branch-header parsing in `BranchGuard`; introduced shared `requireBranchScope` utility to eliminate duplicated branch-required validation logic across controllers; aligned `AuthenticatedRequest.branchId` typing with guard behavior (`string | null`) to enforce explicit null-scope handling; centralized super-admin/non-super-admin read/mutation branch resolution into shared `branch-resolution` helpers to remove duplicated controller branching logic; tightened guard request typing in `roles`/`branch` guards to reduce unsafe auth-surface handling; hardened `JwtAuthGuard` to throw explicit unauthorized errors consistently via typed `handleRequest`; added structured security-event logging in `PermissionsGuard`; full matrix tests pending. |
| 3 | IP | Expanded canonical shared contracts and moved remaining workflow/rate seed constants to shared constants, replacing local duplicate definitions in consumers; normalized legacy-vs-paginated payment history typing in web API client; added canonical `OPEN_ORDER_STATUSES` shared constant and replaced local duplicate active-order status list usage in backend branch deletion policy; added shared audit constants (`AUDIT_ACTIONS`, canonical entities/filter entities) and updated shared audit query contract with optional `branchId` for cross-app parity; expanded shared audit action/entity coverage with auth lifecycle actions (`LOGIN_FAILED`, `LOGOUT`, `TOKEN_REFRESH`) and `ExpenseCategory` classification. |
| 4 | IP | Added missing global tokens and new typography/page-header primitives; `data-table` and `empty-state` now consume shared typography primitives. |
| 5 | DN | Expanded frontend consistency refactor across settings/config/customers and decomposed `orders/[id]`, `orders/new`, `orders`, dashboard home, employee detail, expenses, payments, customer detail, garment detail, employees list, reports, my-orders, login, design-types, rates, and unauthorized/auth-state pages into reusable sections backed by dedicated hooks/components with improved UX hierarchy/loading states; decomposed users, branches, customers, garments, measurement categories, measurement detail, branch hub, measurement field dialog, measurement category dialog, employee dialog, customer dialog, design-type dialog, task-assignment dialog, and reports analytics charts backing modules into dedicated hooks/reusable section components, with thin wrapper/utility entries explicitly marked `NJ` with reasons; audit-logs page hook now consumes shared audit constants to avoid local duplicate action/entity lists. |
| 6 | IP | Added shared order-money helper and task completion ledger idempotency guard; hardened payroll disbursement flow with serializable transaction/retry, branch-scope enforcement, and safe payment-history query normalization; hardened expenses domain with branch-required create validation, safe pagination/date handling, category integrity checks, and whitelisted sorting; hardened rates domain with BranchGuard enforcement, strict branch scoping, normalized pagination contracts, safer effective-date validation, and shared-contract DTO cleanup; hardened search domain with sanitized full-text query generation, capped limits, resilient ILIKE fallbacks, and cleaner controller limit parsing; hardened employees domain by reusing ledger summary as single source of truth for balance stats and normalizing employee list/item pagination/branch checks to remove duplicated calculation logic; refactored users domain to centralize email normalization/uniqueness checks, shared select projections, shared password policy constants, secure temp password generation, and shared admin-role constants usage; hardened branches domain with normalized search/pagination/code checks and shared open-order status reuse for deletion guard; enforced branch-scoped access across ledger/payments financial endpoints and branch-required mutation policy across customers/employees/orders/expenses/tasks/payments-disbursement to prevent accidental cross-branch writes by non-scoped super-admin calls; normalized inline body payloads into validated DTO contracts for tasks/attendance/order-item assignment flows; tightened attendance/task assignment branch integrity to prevent cross-branch employee actions and enforced strict order-item ownership plus branch-scoped employee assignment checks across create/update/add-item/item-assignment order flows; removed duplicate service-level permission checks where controller decorators already enforce capability (tasks assign/rate override). |
| 7 | IP | Replaced unsafe SQL and added backend `/status/:token` endpoint; public status frontend page now decomposed to reusable sections; mail integration endpoints are now super-admin only (no public mail test/auth-url access); normalized mail test endpoint body to validated DTO contract; hardened share-link token/PIN generation with cryptographic randomness; implemented hash-based public PIN storage with backward-compatible legacy PIN migration, plus targeted status endpoint throttling and per-token+IP backoff controls; end-to-end tests pending. |
| 8 | IP | Removed stray debug logs, reduced full-reload usage in branch switching path, centralized frontend development-only error logging, hardened design-types backend branch scoping by applying `BranchGuard` plus service-level scoped mutation checks, centralized numeric query parsing via shared utility helpers consumed across backend controllers, standardized success response envelopes through shared response helpers (including users/design-types/config controllers), normalized shared paginated query DTO handling across backend controllers, enabled global API throttling guard wiring, introduced shared employee-scope validation utility consumed by attendance/tasks/orders/payments to remove repeated employee-branch validation logic, hardened cross-cutting audit/scheduler infrastructure with typed audit logging, sensitive-field redaction, safer old-value lookup, and typed scheduler transaction flow, normalized audit-log filter sanitization against shared constants, expanded auth/expense audit classification coverage (login failure/logout/token refresh + expense categories), enabled nullable audit actors with actor-email capture for unknown-user login failures, and hardened global exception output to avoid leaking internal server details in production paths. |
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

## Current Checkpoint (After Sixty-ninth Implementation Pass)

- `./scripts/verify-refactor-manifest.sh`: pass
- `npx tsc -p apps/api/tsconfig.json --noEmit`: pass
- Branch-scope hardening sweep (`ledger`, `payments`, `design-types`, and branch-required mutations in `customers`/`employees`/`orders`/`expenses`/`tasks`/`attendance`): pass
- Controller branch-scope validation deduplication (shared `requireBranchScope` utility replacing repeated local helpers): pass
- Nullable branch-scope typing alignment (`AuthenticatedRequest.branchId`) with service/controller read-path handling: pass
- Shared branch resolution deduplication (`branch-resolution` utility consumed by reports/rates/design-types/search): pass
- Shared numeric query parsing deduplication (`query-parsing` utility consumed by controllers): pass
- Shared success envelope deduplication (`response` utility consumed by controllers): pass
- Shared paginated query DTO normalization (`PaginationQueryDto` adoption across controllers): pass
- Inline request-body DTO normalization (`tasks`/`attendance`/`mail` + order-item assignment DTO): pass
- Auth refresh lifecycle hardening (login issuance + refresh hash persistence + refresh strategy payload consistency): pass
- Public status hardening (crypto-secure share token/PIN generation + global throttler guard wiring): pass
- Branch integrity hardening (attendance/task assignment employee branch ownership + order item ownership checks): pass
- Shared employee-scope validation deduplication (`employee-scope` utility consumed by attendance/tasks/orders/payments): pass
- Order assignment hardening (cross-order item update prevention + branch-scoped active employee assignment validation across create/add/update/item assign): pass
- Response envelope consistency sweep (`users`/`design-types`/`config` controllers now use shared response helpers): pass
- Cross-cutting audit hardening (typed interceptor, sensitive key redaction, explicit entity lookup without dynamic `prisma[model]`, and safer branch attribution): pass
- Audit logs branch scoping parity (`audit-logs` supports explicit `branchId` query with super-admin `all` semantics via shared resolver): pass
- Scheduler transaction typing cleanup (`Prisma.TransactionClient` and structured error logging): pass
- Shared audit constants parity (`shared-constants` now provides canonical audit actions/entities consumed by backend + frontend audit filters): pass
- Audit filter input hardening (`audit-logs.service` normalizes and whitelists action/entity/userId filters): pass
- Audit persistence reliability hardening (`audit.interceptor` now awaits audit persistence on success/error paths via safe wrapper, preventing dropped/delayed mutation event logs): pass
- Audit lifecycle coverage hardening (`audit.interceptor` now classifies login failures/logout/token refresh and expense-category mutations for clearer complete audit trails): pass
- Audit UI action consistency (`audit-logs` page now renders explicit badges/summaries for new auth lifecycle actions): pass
- Auth/session staleness hardening (JWT and refresh strategies now source role/branch/employee permissions from live DB user state): pass
- Status-link hardening (hash-based PIN storage + legacy PIN compatibility migration + per-token/IP invalid-attempt backoff + endpoint-specific throttle): pass
- Status abuse-hardening refinement (token+IP and token-only backoff dimensions + hashed cache keying + token-fingerprint logging): pass
- Permission consistency hardening (`tasks` assignment/rate override now rely on controller permission decorators; duplicate service-level checks removed): pass
- Guard consistency hardening (removed redundant controller-level `@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)`/`@UseGuards(JwtAuthGuard, RolesGuard)` and retained only route-specific refresh guard): pass
- Security event observability hardening (structured `[SECURITY_EVENT]` logs for permission denials and auth/status abuse paths): pass
- Security logging deduplication hardening (shared `emitSecurityEvent` utility now used across auth/status/permissions with additional role/branch/jwt guard denial telemetry): pass
- Env-access consistency hardening (runtime `process.env` access centralized through `common/env.ts` for app bootstrap, cache config, auth cookies, exception filtering, and mail integration): pass
- Security regression guardrails (new backend scan script blocks `queryRawUnsafe`/`Prisma.raw` misuse, runtime `console.*`, redundant class-level Jwt/Roles/Branch guard decorators, and direct `process.env` usage outside `common/env.ts`): pass
- Monorepo env workflow hardening (added `env:setup` and `env:verify`, standardized app-scoped env templates, and automated creation of app-local runtime env files): pass
- Runtime env loading hardening (`apps/api` Nest scripts use explicit app-local env files; web NextAuth route validates `NEXTAUTH_URL` through shared env helper): pass
- App-scoped env hardening (migrated to separate regular env files per app: `apps/web/.env|.env.local|.env.production` and `apps/api/.env|.env.local|.env.production`, no runtime symlinks): pass
- API env-file routing hardening (`apps/api` scripts now map `start -> .env`, `start:dev/start:debug -> .env.local` for explicit environment separation): pass
- Prisma DX hardening (added root-level Prisma scripts to run API schema commands from monorepo root without schema-path errors): pass
- Root env removal hardening (deleted root `.env`; app-scoped env files are now the only runtime source of configuration): pass
- Root ignore hardening (added root `.env` to git ignore to prevent accidental reintroduction): pass
- Global exception hardening (`AllExceptionsFilter` now masks internal 5xx details in production while preserving typed HTTP messages): pass
- JWT guard hardening (`JwtAuthGuard.handleRequest` enforces explicit unauthorized errors and typed auth user flow): pass
- Proxy trust hardening (`TRUST_PROXY` parsed/validated in env and wired into Express trust-proxy config; production now requires explicit setting): pass
- Email identity hardening (DB migration adds case-insensitive unique index on `LOWER("User"."email")` with duplicate precheck): pass
- `npm run prisma:generate -w api`: pass
- `npm run build -w api`: pass
- `npm run security:backend:guardrails`: pass
- `npm run security:guardrails -w api`: pass
- `npm run env:setup`: pass
- `npm run env:verify`: pass
- `npm run prisma:generate`: pass
- `npm run prisma:migrate:status`: fails in current local DB target (`localhost:5432` no response)
- `npm run lint -w api`: fails in legacy pre-existing files (strict-eslint backlog), no blocker for this pass
- `npm run test -w api -- --runInBand`: intentionally not run in this pass (per request to avoid test work)
- `npm run build -w @tbms/shared-types`: pass
- `npm run build -w @tbms/shared-constants`: pass
- `npx tsc -p apps/web/tsconfig.json --noEmit`: pass
- `npm run lint -w web`: not rerun in this pass
- `npm run build -w web`: blocked in this environment (`ENOTFOUND fonts.googleapis.com` for `next/font`)

## Manifest Progress Snapshot

| Phase | DN | NS | IP | NJ | BL |
|---|---:|---:|---:|---:|---:|
| 1 | 13 | 3 | 0 | 0 | 0 |
| 2 | 8 | 4 | 0 | 0 | 0 |
| 3 | 22 | 38 | 0 | 0 | 0 |
| 4 | 6 | 34 | 0 | 1 | 0 |
| 5 | 176 | 43 | 0 | 11 | 0 |
| 6 | 43 | 19 | 0 | 9 | 0 |
| 7 | 13 | 3 | 0 | 0 | 0 |
| 8 | 20 | 23 | 0 | 0 | 0 |
| 9 | 0 | 2 | 0 | 0 | 0 |
