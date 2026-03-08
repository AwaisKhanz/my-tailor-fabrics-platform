# Backend Development Rules

These rules apply to `apps/api`, Prisma schema and migrations, backend seeds, auth, guards, scheduler logic, and backend operational behavior.

## 1. Current Backend Stack

1. Framework: NestJS
2. ORM: Prisma
3. Database: PostgreSQL
4. Cache/queue-style runtime dependency: Valkey/Redis client usage
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
4. Do not create random root-level backend utility files when the concern belongs in a feature module or `common`.

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

## 5. Auth, RBAC, and Scope Rules

1. Public/private access must be enforced through the existing decorators and guards.
2. Do not scatter role or permission enforcement as controller-local string checks when shared guard paths already exist.
3. Roles, permissions, and route policy definitions belong in shared packages, not backend-local duplicates.
4. When backend code references a permission, use the shared `PERMISSION` export from `@tbms/shared-constants` instead of repeating a raw string literal.
5. Branch scoping must use the existing branch resolution and scope helpers, not one-off branch filters.
6. If a new protected capability is added, update:
   - shared permission contracts
   - shared role/permission matrix
   - frontend access logic if the route is user-facing

## 6. Environment and Runtime Rules

1. Do not read `process.env` directly in arbitrary backend files.
2. All backend env access must flow through `apps/api/src/common/env.ts`.
3. Production-only required values must fail fast through typed env helpers.
4. Public mail endpoints, scheduler behavior, proxy trust, and security-sensitive flags must remain centrally configured.
5. Runtime bootstrap security belongs in `main.ts`.
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

## 9. Scheduler and Background Work Rules

1. The internal scheduler is currently feature-flagged and designed for a single API instance.
2. Do not add new horizontally unsafe scheduled logic without explicitly considering App Platform runtime behavior.
3. If background work grows beyond the single-process scheduler model, move it toward dedicated jobs instead of scaling the API blindly.

## 10. Seed Rules

1. Production-safe seeds must run without dev-only tooling.
2. Keep seeds under `apps/api/prisma/`.
3. Seed entrypoints must remain runnable in the production API container.
4. Default seeds should be narrowly scoped and operationally safe.
5. If a new seed becomes part of normal operations, document it in the deployment guide.

## 11. Backend Verification Rules

For meaningful backend changes, run the applicable commands from the repo root:

```bash
npm run env:verify
npm run build:do:api
npm run prisma:seed:list
```

For schema changes, also run:

```bash
npm run prisma:migrate:status
```

If the change affects production schema or release procedure, update `docs/deployment-guide.md` in the same task.
