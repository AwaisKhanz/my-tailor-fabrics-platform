# TBMS Modernization Migration Notes

## Implemented Interface Changes

1. `GET /customers`
- Added optional `status` query filter.
- Existing params (`page`, `limit`, `search`, `isVip`) remain supported.

2. Employee account payload normalization
- Canonical request field: `password`.
- Deprecated compatibility input still accepted temporarily: `passwordHash`.
- Backend resolves `password ?? passwordHash`.

3. Public order status contract
- Backend endpoint: `GET /status/:token?pin=XXXX`.
- Web proxy route aligned: `apps/web/app/api/status/[token]/route.ts`.

4. Report/export SQL safety
- Unsafe raw SQL interpolation removed from reports/export paths.
- Parameterized Prisma SQL used without changing response shape.

5. Dashboard stats compatibility
- `DashboardStats` kept backward-compatible.
- Duplicate fields marked deprecated in shared types:
  - `overdueOrders` (use `overdueCount`)
  - `totalOutstandingBalance` (use `outstandingBalances`)

6. Shared RBAC policy constants
- Canonical role groups now defined in `packages/shared-constants/src/rbac.ts`.
- Consumed by frontend middleware/navigation and backend controllers.

## Operational Notes
- `next build` may fail in offline/sandboxed environments if Google Fonts cannot be fetched by `next/font`.
- Use manifest scripts to track completion and enforce file coverage.
