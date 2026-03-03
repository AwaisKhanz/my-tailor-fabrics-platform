# Frontend Page Decomposition Tracker

Legend: `DN` (decomposed to orchestrator + reusable sections/hooks), `IP` (in progress), `NS` (pending), `NJ` (thin wrapper/redirect; no split needed)

## Current Task Queue
1. `None` — all tracked frontend decomposition pages are `DN` or `NJ`.

## Orders Domain
| File | LOC | Status | Notes |
|---|---:|---|---|
| `apps/web/app/(dashboard)/orders/page.tsx` | 69 | DN | Decomposed in Pass 12 using `use-orders-list-page` + reusable toolbar/table sections. |
| `apps/web/app/(dashboard)/orders/new/page.tsx` | 133 | DN | Decomposed in Pass 11 with reusable order form sections + hook. |
| `apps/web/app/(dashboard)/orders/[id]/page.tsx` | 215 | DN | Decomposed in Pass 10 with reusable detail sections + hook. |

## Customers Domain
| File | LOC | Status | Notes |
|---|---:|---|---|
| `apps/web/app/(dashboard)/customers/page.tsx` | 7 | NJ | Thin wrapper delegating to `CustomerTable`; backing module was decomposed in Pass 22 (`use-customers-page` + reusable `customers/list/*` sections). |
| `apps/web/app/(dashboard)/customers/[id]/page.tsx` | 103 | DN | Decomposed in Pass 15 using `use-customer-detail-page` + reusable profile/tabs/dialog sections. |

## Employees Domain
| File | LOC | Status | Notes |
|---|---:|---|---|
| `apps/web/app/(dashboard)/employees/page.tsx` | 74 | DN | Decomposed in Pass 16 using `use-employees-page` + reusable list toolbar/table sections. |
| `apps/web/app/(dashboard)/employees/[id]/page.tsx` | 195 | DN | Decomposed in Pass 13 using `use-employee-detail-page` + reusable detail sections/tabs/dialogs. |

## Finance/Operations Domain
| File | LOC | Status | Notes |
|---|---:|---|---|
| `apps/web/app/(dashboard)/expenses/page.tsx` | 131 | DN | Decomposed in Pass 14 using `use-expenses-page` + reusable expenses sections/dialogs with standardized delete confirmation flow. |
| `apps/web/app/(dashboard)/payments/page.tsx` | 113 | DN | Decomposed in Pass 14 using `use-payments-page` + reusable payments sections/dialog with date-filtered history UX. |
| `apps/web/app/(dashboard)/reports/page.tsx` | 67 | DN | Decomposed in Pass 16 using `use-reports-page` + reusable date-range/insights/export/print sections. |
| `apps/web/app/(dashboard)/my-orders/page.tsx` | 36 | DN | Decomposed in Pass 17 using `use-my-orders-page` + reusable search toolbar/table sections. |

## Dashboard/Auth/Public Domain
| File | LOC | Status | Notes |
|---|---:|---|---|
| `apps/web/app/(dashboard)/page.tsx` | 124 | DN | Decomposed in Pass 13 using `use-dashboard-page` + reusable dashboard section cards. |
| `apps/web/app/login/page.tsx` | 41 | DN | Decomposed in Pass 17 using `use-login-page` + reusable brand/form auth sections. |
| `apps/web/app/status/[token]/page.tsx` | 64 | DN | Decomposed in Pass 18 using `use-public-order-status-page` + reusable public status cards and PIN gate section. |
| `apps/web/app/unauthorized/page.tsx` | 16 | DN | Standardized in Pass 19 using reusable `AuthStateCard` primitive. |

## Settings Domain
| File | LOC | Status | Notes |
|---|---:|---|---|
| `apps/web/app/(dashboard)/settings/page.tsx` | 5 | NJ | Redirect-only route; no decomposition needed. |
| `apps/web/app/(dashboard)/settings/garments/page.tsx` | 11 | NJ | Thin wrapper to `GarmentTypesTable`; backing module was decomposed in Pass 23 (`use-garment-types-page` + reusable `config/garments/list/*` sections). |
| `apps/web/app/(dashboard)/settings/garments/[id]/page.tsx` | 67 | DN | Decomposed in Pass 15 using `use-garment-detail-page` + reusable analytics/overview/logs/sidebar/rates sections. |
| `apps/web/app/(dashboard)/settings/branches/page.tsx` | 11 | NJ | Thin wrapper to `BranchesTable`; backing module was decomposed in Pass 21 (`use-branches-page` + reusable `config/branches/*` sections). |
| `apps/web/app/(dashboard)/settings/branches/[id]/page.tsx` | 16 | NJ | Thin wrapper to `BranchHubConfig`; backing module was decomposed in Pass 26 (`use-branch-hub-config-page` + reusable `config/branches/hub/*` sections). |
| `apps/web/app/(dashboard)/settings/measurements/page.tsx` | 11 | NJ | Thin wrapper to `MeasurementCategoriesTable`; backing module was decomposed in Pass 24 (`use-measurement-categories-page` + reusable `config/measurements/list/*` sections). |
| `apps/web/app/(dashboard)/settings/measurements/[id]/page.tsx` | 16 | NJ | Thin wrapper to `MeasurementCategoryDetail`; backing module was decomposed in Pass 25 (`use-measurement-category-detail-page` + reusable `config/measurements/detail/*` sections). |
| `apps/web/app/(dashboard)/settings/design-types/page.tsx` | 73 | DN | Decomposed in Pass 18 using `use-design-types-page` + reusable header/table sections and confirm-delete flow. |
| `apps/web/app/(dashboard)/settings/rates/page.tsx` | 61 | DN | Decomposed in Pass 19 using `use-rates-page` + reusable header/search-stats/table sections. |
| `apps/web/app/(dashboard)/settings/users/page.tsx` | 11 | NJ | Thin wrapper to `UsersTable`; backing module was decomposed in Pass 20 (`use-users-page` + reusable `config/users/*` sections). |

## Summary
- `DN`: 17
- `NJ`: 8
- `NS`: 0
- `IP`: 0
