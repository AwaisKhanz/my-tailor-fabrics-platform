# RBAC Audit Matrix

Generated: 2026-03-04T12:08:17.930Z

## Frontend Guard vs Route Policy

| Route | Policy Permissions | Guard Permissions | Status |
|---|---|---|---|
| `/` | `dashboard.read` | `dashboard.read` | PASS |
| `/customers` | `customers.read` | `customers.read` | PASS |
| `/customers/[id]` | `customers.read` | `customers.read` | PASS |
| `/employees` | `employees.read` | `employees.read` | PASS |
| `/employees/[id]` | `employees.read` | `employees.read` | PASS |
| `/expenses` | `expenses.manage` | `expenses.manage` | PASS |
| `/my-orders` | `orders.read` | `orders.read` | PASS |
| `/orders` | `orders.read` | `orders.read` | PASS |
| `/orders/[id]` | `orders.read` | `orders.read` | PASS |
| `/orders/new` | `orders.create` | `orders.create` | PASS |
| `/payments` | `payments.manage` | `payments.manage` | PASS |
| `/reports` | `reports.read` | `reports.read` | PASS |
| `/settings/appearance` | `settings.read`, `appearance.manage` | `settings.read`, `appearance.manage` | PASS |
| `/settings/attendance` | `settings.read`, `attendance.read` | `settings.read`, `attendance.read` | PASS |
| `/settings/audit-logs` | `settings.read`, `audit.read` | `settings.read`, `audit.read` | PASS |
| `/settings/branches` | `settings.read`, `branches.read` | `settings.read`, `branches.read` | PASS |
| `/settings/branches/[id]` | `settings.read`, `branches.read` | `settings.read`, `branches.read` | PASS |
| `/settings/design-types` | `settings.read`, `designTypes.read` | `settings.read`, `designTypes.read` | PASS |
| `/settings/expense-categories` | `settings.read`, `expenses.read` | `settings.read`, `expenses.read` | PASS |
| `/settings/garments` | `settings.read`, `garments.read` | `settings.read`, `garments.read` | PASS |
| `/settings/garments/[id]` | `settings.read`, `garments.read` | `settings.read`, `garments.read` | PASS |
| `/settings/integrations` | `settings.read`, `mail.manage` | `settings.read`, `mail.manage` | PASS |
| `/settings/measurements` | `settings.read`, `measurements.read` | `settings.read`, `measurements.read` | PASS |
| `/settings/measurements/[id]` | `settings.read`, `measurements.read` | `settings.read`, `measurements.read` | PASS |
| `/settings/rates` | `settings.read`, `rates.read` | `settings.read`, `rates.read` | PASS |
| `/settings/system` | `settings.read`, `system.manage` | `settings.read`, `system.manage` | PASS |
| `/settings/users` | `settings.read`, `users.manage` | `settings.read`, `users.manage` | PASS |

## Backend Decorator Coverage

- None

## Backend Decorator Permission Set

- `attendance.checkin`
- `attendance.read`
- `audit.read`
- `branches.manage`
- `branches.read`
- `customers.create`
- `customers.delete`
- `customers.measurements.manage`
- `customers.read`
- `customers.update`
- `dashboard.read`
- `designTypes.manage`
- `designTypes.read`
- `employees.manage`
- `employees.read`
- `expenses.manage`
- `expenses.read`
- `garments.manage`
- `garments.read`
- `ledger.manage`
- `ledger.read`
- `mail.manage`
- `measurements.manage`
- `measurements.read`
- `orderItems.manage`
- `orders.cancel`
- `orders.create`
- `orders.read`
- `orders.receipt`
- `orders.share`
- `orders.update`
- `payments.manage`
- `payments.read`
- `rates.manage`
- `rates.read`
- `reports.export`
- `reports.read`
- `search.global`
- `settings.read`
- `system.manage`
- `tasks.assign`
- `tasks.rate.override`
- `tasks.read`
- `tasks.update`
- `users.manage`
- `users.read`

## Audit Summary

- Route parity issues: 0
- Unknown guard permissions: 0
- Policy permissions missing in backend decorators: 0
- Backend HTTP methods missing permission decorators: 0
