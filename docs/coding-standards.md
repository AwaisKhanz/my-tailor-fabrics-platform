# TBMS Coding Standards

## 1) Design System First
- Use shared UI primitives from `apps/web/components/ui` before custom markup.
- Prefer `PageHeader` + `Typography` over raw styled `h1/p` blocks in page-level layout.
- Use canonical shadcn variants (`button`, `badge`, `input`, `card`, `dialog`) and avoid one-off inline style drift.

## 2) Shared Contracts
- Cross-app enums/contracts live in `packages/shared-types`.
- Cross-app labels/policies/route-role config live in `packages/shared-constants`.
- Avoid `any` in API client responses; use explicit shared response shapes.

## 3) RBAC and Route Policy
- Role groups are centralized in `packages/shared-constants/src/rbac.ts`.
- Frontend route visibility, middleware checks, and backend `@Roles(...)` should use shared role groups.
- Additive role changes must update shared constants first, then both frontend/backend consumers.

## 4) Backend Financial Logic
- Keep order total/discount logic centralized in `apps/api/src/orders/money.ts`.
- Task completion earnings must be idempotent (one active earning entry per task completion).
- Prefer transaction boundaries for coupled status/ledger operations.

## 5) Security and Env
- No production fallback secrets in runtime-critical code paths.
- Env access must go through typed helpers (`apps/web/lib/env.ts`, `apps/api/src/common/env.ts`).
- Public/non-auth endpoints must be explicitly guarded and production-gated where needed.

## 6) Tracking and Completion
- `docs/refactor-manifest.csv` is the source of truth for file-level modernization status.
- `NJ` requires a non-empty reason in `notes`.
- Use:
  - `npm run refactor:manifest:generate`
  - `npm run refactor:manifest:verify`
