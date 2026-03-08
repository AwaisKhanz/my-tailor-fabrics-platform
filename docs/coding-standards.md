# TBMS Coding Standards

## 1. Shared Contracts First

1. Put cross-app DTOs and response shapes in `packages/shared-types`.
2. Put shared labels, RBAC policy, workflow presets, and business constants in `packages/shared-constants`.
3. Avoid duplicating enums, permission names, and business labels inside app-local code.

## 2. Frontend Composition

1. Prefer shared primitives from `apps/web/components/ui` before introducing route-local markup.
2. Use `PageShell`, `PageHeader`, `EmptyState`, and other established layout primitives instead of inventing new page scaffolding.
3. Keep styling in the existing design system and avoid one-off visual patterns unless a route has a clear reason.

## 3. Backend Business Rules

1. Keep money and order calculations centralized in `apps/api/src/orders/money.ts`.
2. Wrap coupled write flows in transactions.
3. Make ledger and payroll side effects idempotent.
4. Keep branch scoping and permission enforcement in backend guards and services, not only in the frontend.

## 4. Security and Environment

1. No production fallback secrets in runtime code.
2. Env access must go through:
   - `apps/api/src/common/env.ts`
   - `apps/web/lib/env.ts`
3. Public endpoints must be explicitly marked and intentionally production-gated where needed.
4. Avoid direct `process.env` reads outside the typed env helpers.

## 5. Deployment Discipline

1. The App Platform spec in [app.prod.yaml](/Users/muhammadawais/Documents/My%20Tailors/tbms/.do/app.prod.yaml) is the deployment source of truth.
2. Build and runtime behavior for production must continue to work from repo-root Docker context.
3. Any change that affects routes, service names, domains, or secrets must be reflected in the deployment guide.

## 6. Documentation Standard

1. Keep documentation current and operational.
2. Remove migration trackers and one-off audit notes once they stop representing the live system.
3. Prefer a small set of maintained docs over a large archive of stale checklists.
