# RBAC Parity Report

Date: 2026-03-04

## Scope
- Frontend route guards (`withRoleGuard`)
- Middleware route policies (`ROUTE_PERMISSION_POLICIES`)
- Sidebar/Topbar visibility
- Settings and core action-level permission gating

## Changes Applied
1. Added reusable client auth hook:
   - `apps/web/hooks/use-authz.ts`
2. Standardized page/action permission checks to use `useAuthz` in core routes:
   - Orders, Order Detail, Customers, Customer Detail, Employees, Employee Detail,
     Payments, Expenses, Reports, Order Form hook, Topbar, Branch Selector.
3. Enforced action-level gating across settings mutation surfaces:
   - Branches, Garments, Measurements (list + detail), Design Types, Rates,
     Expense Categories, Attendance.
4. Aligned settings page guards with middleware policy contract:
   - All settings routes now require `settings.read` plus module permission.
5. Aligned integrations guard with backend restriction:
   - `/settings/integrations` now requires `Role.SUPER_ADMIN` and `mail.manage`.
6. Aligned finance pages with manage-level access:
   - `/payments` requires `payments.manage`.
   - `/expenses` requires `expenses.manage`.
7. Removed desktop/mobile sidebar drift by reusing one nav visibility resolver:
   - `getVisibleNavItems(role)` in `Sidebar.tsx`.

## Verification
- `npm run build -w @tbms/shared-constants` passed
- `npm run lint -w web` passed
- `npx tsc -p apps/web/tsconfig.json --noEmit` passed
- `npm run rbac:audit` passed (`docs/rbac-audit-latest.md`)

## Automated Audit
- Added `scripts/rbac-audit.mjs` and root command `npm run rbac:audit`.
- Audit checks:
  - frontend `withRoleGuard` pages vs `ROUTE_PERMISSION_POLICIES`
  - unknown guard permissions vs shared permission universe
  - backend controller HTTP methods for missing permission decorators (supports class-level decorators)
  - policy permission coverage in backend decorators (excluding frontend-only permission `appearance.manage`)

## Current Policy Notes
- `integrations.manage` remains in shared permission universe for forward compatibility.
- Current integrations runtime access is intentionally restricted to `mail.manage` + `SUPER_ADMIN`.
- `branch.switch` remains super-admin-only in practice because only `SUPER_ADMIN` gets full permission universe.
