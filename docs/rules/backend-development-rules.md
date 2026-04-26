# Backend Development Rules

These rules apply to `apps/api`, Prisma schema and migrations, backend seeds, auth, guards, scheduler logic, and backend operational behavior.

## 1. Current Backend Stack

1. Framework: NestJS
2. ORM: Prisma
3. Database: PostgreSQL
4. Cache/runtime model: in-process Nest cache only; no external cache/queue service dependency
5. Auth model: backend-issued JWT with web-session facade
6. Shared cross-app contracts: `@tbms/shared-types`, `@tbms/shared-constants`

## 2. File Structure Rules

1. Keep backend features module-first under `apps/api/src/<domain>`.
2. A feature folder should normally contain:
   - `*.module.ts`
   - `*.controller.ts`
   - `*.service.ts`
   - `dto/` for request and response DTOs
3. Shared cross-cutting backend code belongs under:
   - `apps/api/src/common`
   - `apps/api/src/prisma`
4. Email rendering templates belong under:
   - `apps/api/src/mail/templates`
5. Mail template theme/layout helpers must be reused by all backend-sent emails (no ad hoc inline HTML in feature services).
6. Do not create random root-level backend utility files when the concern belongs in a feature module or `common`.

## 3. Prisma and Database Rules

1. Prisma schema is the data-model source of truth:
   - `apps/api/prisma/schema.prisma`
2. Any schema change must include a proper Prisma migration.
3. Before writing a migration, review relation impact, nullability impact, data backfill needs, and destructive change risk.
4. If a change can lose data or break relations, do not do a one-step destructive migration by default.
   Use staged migrations, backfills, or compatibility columns first.
5. Do not edit previously committed shared-environment migrations to “fix history”.
   Add a new migration instead.
6. Use `PrismaService` as the only application ORM boundary.
   Do not create ad hoc Prisma clients inside feature files.
7. When a migration changes operational behavior, update deployment and runbook docs in the same task.

## 4. Transaction and Consistency Rules

1. Any coupled write flow must use a transaction.
2. This is mandatory for flows touching:
   - orders and order items
   - payments and salary accrual
   - employee ledger entries
   - rate changes with dependent writes
   - auth token rotation state
3. Keep financial and lifecycle calculations centralized in helpers such as `apps/api/src/orders/money.ts`.
4. Do not duplicate money or totals logic inline across multiple services.
5. Side effects that may run more than once must be designed to be idempotent.
6. Piece-first order writes that touch shop fabric pricing must remain transactional:
   - order item creation, update, removal, cancellation, and fabric-source changes must keep order totals and piece snapshots consistent in the same transaction
   - shop fabric price and total must be stored as snapshots on the order item so historical orders survive later catalog price changes
7. Production-task workflow is always enabled for live order operations:
   - order-item create, order-item replacement, and order-item garment/design changes must always refresh piece tasks from garment workflow templates
   - backend order flows must not depend on an admin-facing toggle before generating piece tasks
8. Per-piece production tasks must enforce sequential workflow on status changes:
   - a task may only move to `IN_PROGRESS` or `DONE` after all earlier steps for that same piece are `DONE` or `CANCELLED`
   - a task may only move to `IN_PROGRESS` or `DONE` when an employee is assigned

## 5. Auth, RBAC, and Scope Rules

1. Public/private access must be enforced through the existing decorators and guards.
2. Do not scatter role or permission enforcement as controller-local string checks when shared guard paths already exist.
3. Roles, permissions, and route policy definitions belong in shared packages, not backend-local duplicates.
4. When backend code references a permission, use the shared `PERMISSION` export from `@tbms/shared-constants` instead of repeating a raw string literal.
5. Branch scoping must use the existing branch resolution and scope helpers, not one-off branch filters.
6. Backend branch guards must stay aligned with the user-account branch-scope model. If a role is allowed to have `branchId = null` as global `All Branches` scope, the guard must pass that request through with null scope instead of rejecting it as unassigned.
7. For branch-scoped catalog resources that support global records via `branchId = null`, mutation lookups must allow both the active branch and the global record. Read and write scope rules must stay aligned.
8. Branch-scoped operational catalogs such as shop fabrics must never leak across branches. Fabric list, detail, and pricing lookups must always resolve against the effective branch scope header.
9. Do not enforce CUID-only validation on foreign-key string fields unless the shared contract and live data model actually guarantee CUID identifiers. Validation rules must match real persisted IDs.
10. If a new protected capability is added, update:
   - shared permission contracts
   - shared role/permission matrix
   - frontend access logic if the route is user-facing
11. Employee self-profile endpoints must use the dedicated `employees.self.read` permission instead of reusing broader task or staff employee permissions.
12. Login flow is two-step for all password-based sign-ins:
   - first request verifies credentials and issues an email OTP challenge
   - second request verifies OTP and only then issues JWT/refresh tokens
13. Do not bypass OTP verification by reintroducing direct password-to-token issuance endpoints.
14. Attendance is not part of the live My Tailor & Fabrics workflow.
   Do not add attendance routes, payroll logic, or attendance-based employee summaries unless the product requirements are explicitly changed and the shared contracts, frontend routes, and deployment docs are updated in the same task.
15. Public marketing inquiries are a first-class public endpoint:
   - public contact/inquiry endpoints must live in a dedicated backend feature module, not inside auth or admin mail controllers
   - they must use `@Public()`, DTO validation, and request throttling
   - if the endpoint sends email, it must reuse the branded mail template system under `apps/api/src/mail/templates`

## 6. Environment and Runtime Rules

1. Do not read `process.env` directly in arbitrary backend files.
2. All backend env access must flow through `apps/api/src/common/env.ts`.
3. Seed entrypoints may use `apps/api/prisma/seed-env.js` as the dedicated seed-only env boundary.
   Do not read `process.env` directly outside `env.ts` or `seed-env.js`.
4. Production-only required values must fail fast through typed env helpers.
5. Public mail endpoints, scheduler behavior, proxy trust, and security-sensitive flags must remain centrally configured.
6. CORS origin allowlists must stay aligned with the live domain split:
   - `FRONTEND_URL` represents the authenticated portal host
   - `MARKETING_SITE_URL` represents the public marketing host
   - API bootstrap must allow both through typed env helpers rather than hardcoded strings
7. Runtime bootstrap security belongs in `main.ts`.
   Do not bypass:
   - helmet
   - CORS policy
   - validation pipe
   - global exception filter

## 7. Type Safety Rules

1. Do not introduce `any`.
2. Prefer `unknown` plus narrowing, dedicated interfaces, or shared contract types.
3. Avoid broad `as` casting.
4. If a cast is unavoidable at a framework boundary, keep it narrow, local, and justified by surrounding code.
5. Request mutation and auth payload handling must use typed request interfaces and shared auth claims.

## 8. DTO and Response Rules

1. Request validation belongs in DTO classes or shared schemas, not ad hoc controller logic.
2. Shared DTOs and cross-app response shapes belong in `packages/shared-types` when consumed by both apps.
3. Do not duplicate enums, role names, permission names, or auth payload shapes inside `apps/api`.
4. When a typed enum already exists, use the enum value in Prisma filters and service logic instead of repeating raw status or type strings.

## 9. Scheduler and Background Work Rules

1. The internal scheduler is currently feature-flagged and designed for a single API instance.
2. Do not add new horizontally unsafe scheduled logic without explicitly considering App Platform runtime behavior.
3. If background work grows beyond the single-process scheduler model, move it toward dedicated jobs instead of scaling the API blindly.

## 10. Seed Rules

1. Production-safe seeds must run without dev-only tooling.
2. Keep seeds under `apps/api/prisma/`.
3. Seed entrypoints must remain runnable in the production API container.
4. Runtime API routes must not be used as seed endpoints.
5. Default seeds should be narrowly scoped and operationally safe.
6. Production seed secrets must never fall back to known default credentials.
7. If a new seed becomes part of normal operations, document it in the deployment guide.

## 11. Backend Verification Rules

For meaningful backend changes, run the applicable commands from the repo root:

```bash
pnpm run env:verify
pnpm run build:do:api
pnpm run prisma:seed:list
```

For schema changes, also run:

```bash
pnpm run prisma:migrate:status
```

If the change affects production schema or release procedure, update `docs/deployment-guide.md` in the same task.
