# TBMS Route Visual Polish Tracker

Legend: `DN` (Done), `IP` (In Progress), `NS` (Not Started), `NJ` (No change justified)

## Phase Status

| Phase | Scope | Status | Notes |
|---|---|---|---|
| 0 | Foundation + tracking | DN | Added page shell primitives, enhanced page header responsiveness, tuned topbar/sidebar, created this tracker, and finalized shell width + global navigation accessibility polish. |
| 1 | Core list pages | DN | Orders, My Orders, Customers, Employees, Payments, Expenses aligned to shared shell rhythm. |
| 2 | Core detail/form pages | DN | Orders new/detail, customer detail, employee detail moved to shell/split layout patterns. |
| 3 | Dashboard + reports | DN | Dashboard and reports aligned with shared section rhythm and responsive spacing. |
| 4 | Settings list routes | DN | Rates and design-types route shells standardized; wrapper-table routes inherit standardized component shells. |
| 5 | Settings detail/hub routes | DN | Garment detail, branch hub, and measurement detail standardized to shell contract. |
| 6 | Auth/public routes | DN | Login and public status route shells standardized; unauthorized remains intentionally simple and consistent. |
| 7 | Final QA + closure | IP | Structural responsive polish completed, including follow-up mobile CTA/header normalization and null-state/public-route handling improvements; interactive screenshot QA runbook still pending due no integrated visual runner in this pass. |

## Route Inventory Status

| # | Route | Primary Entry | Status | Notes |
|---:|---|---|---|---|
| 1 | `/` | `app/(dashboard)/page.tsx` | DN | Simplified professional dashboard layout with clear KPI-first hierarchy and cleaner analytics rails. |
| 2 | `/my-orders` | `app/(dashboard)/my-orders/page.tsx` | DN | Shell-wrapped list route. |
| 3 | `/orders` | `app/(dashboard)/orders/page.tsx` | DN | Shell-wrapped list route. |
| 4 | `/orders/new` | `app/(dashboard)/orders/new/page.tsx` | DN | Shell + `DetailSplit` form layout. |
| 5 | `/orders/[id]` | `app/(dashboard)/orders/[id]/page.tsx` | DN | Shell + `DetailSplit` detail layout. |
| 6 | `/customers` | `app/(dashboard)/customers/page.tsx` -> `CustomerTable` | DN | Backing table module now shell-standardized. |
| 7 | `/customers/[id]` | `app/(dashboard)/customers/[id]/page.tsx` | DN | Shell + split layout with profile and tabs. |
| 8 | `/employees` | `app/(dashboard)/employees/page.tsx` | DN | Shell-wrapped list route. |
| 9 | `/employees/[id]` | `app/(dashboard)/employees/[id]/page.tsx` | DN | Shell + `DetailSplit` detail layout. |
| 10 | `/payments` | `app/(dashboard)/payments/page.tsx` | DN | Shell + sectionalized summary/history flow. |
| 11 | `/expenses` | `app/(dashboard)/expenses/page.tsx` | DN | Shell + sectioned overview/table flow. |
| 12 | `/reports` | `app/(dashboard)/reports/page.tsx` | DN | Shell + section rhythm for insights/exports. |
| 13 | `/settings` | `app/(dashboard)/settings/page.tsx` | NJ | Redirect-only route; no visual surface. |
| 14 | `/settings/branches` | `app/(dashboard)/settings/branches/page.tsx` -> `BranchesTable` | DN | Backing table module now shell-standardized. |
| 15 | `/settings/branches/[id]` | `app/(dashboard)/settings/branches/[id]/page.tsx` -> `BranchHubConfig` | DN | Hub module shell-standardized. |
| 16 | `/settings/garments` | `app/(dashboard)/settings/garments/page.tsx` -> `GarmentTypesTable` | DN | Backing table module now shell-standardized. |
| 17 | `/settings/garments/[id]` | `app/(dashboard)/settings/garments/[id]/page.tsx` | DN | Shell + split detail sections. |
| 18 | `/settings/measurements` | `app/(dashboard)/settings/measurements/page.tsx` -> `MeasurementCategoriesTable` | DN | Backing table module now shell-standardized. |
| 19 | `/settings/measurements/[id]` | `app/(dashboard)/settings/measurements/[id]/page.tsx` -> `MeasurementCategoryDetail` | DN | Detail module shell-standardized. |
| 20 | `/settings/rates` | `app/(dashboard)/settings/rates/page.tsx` | DN | Shell-wrapped list route. |
| 21 | `/settings/design-types` | `app/(dashboard)/settings/design-types/page.tsx` | DN | Shell-wrapped route. |
| 22 | `/settings/users` | `app/(dashboard)/settings/users/page.tsx` -> `UsersTable` | DN | Backing table module now shell-standardized. |
| 23 | `/login` | `app/login/page.tsx` | DN | Uses `PageShell` width/full auth layout wrapper. |
| 24 | `/status/[token]` | `app/status/[token]/page.tsx` | DN | Uses narrow `PageShell` for public status surface. |
| 25 | `/unauthorized` | `app/unauthorized/page.tsx` | DN | Existing centered auth-state layout retained for simplicity. |

## Current Implementation Report (Route-by-Route)

| Route | Key Before Issues | Changes Applied | 360 / 768 / 1280 Verification | Status |
|---|---|---|---|---|
| `/` | Mixed section spacing and KPI rhythm variance. | Simplified to a clean professional layout: focused header actions, KPI-first hierarchy, clear analytics rails, and cleaner visual density. | Layout-contract pass | DN |
| `/my-orders` | Inconsistent outer page container. | Standardized with `PageShell`. | Layout-contract pass | DN |
| `/orders` | Header CTA not consistently responsive. | Added `PageShell`; CTA made `w-full sm:w-auto`. | Layout-contract pass | DN |
| `/orders/new` | Ad-hoc 3-col form split and spacing drift. | Added `PageShell`; converted form body to `DetailSplit`; section rhythm tightened; cancel action normalized to full-width mobile behavior. | Layout-contract pass | DN |
| `/orders/[id]` | Detail region spacing and loading container inconsistency. | Added `PageShell`; converted main region to `DetailSplit`; loading state wrapped in shell; missing-order state now uses explicit empty-state feedback with back navigation. | Layout-contract pass | DN |
| `/customers` | Wrapper inherited mixed container behavior. | Backing `CustomerTable` moved to `PageShell`. | Layout-contract pass | DN |
| `/customers/[id]` | Profile/details two-column balance inconsistent on narrow widths. | Added `PageShell`; converted to `DetailSplit` with ordered mobile stacking; detail header back/action row made fully responsive. | Layout-contract pass | DN |
| `/employees` | List page action/button mobile behavior inconsistent. | Added `PageShell`; CTA made `w-full sm:w-auto`. | Layout-contract pass | DN |
| `/employees/[id]` | Sidebar/content split manually managed; not-found state not shell-aligned. | Added `PageShell`; converted to `DetailSplit`; not-found state moved into shell section; rebuilt detail header for wrap-safe CTA alignment. | Layout-contract pass | DN |
| `/payments` | Selector/summary/history block rhythm inconsistent. | Added `PageShell` + `PageSection`; CTA responsive width adjusted. | Layout-contract pass | DN |
| `/expenses` | Overview/table transition spacing inconsistent. | Added `PageShell` + `PageSection`; CTA responsive width adjusted. | Layout-contract pass | DN |
| `/reports` | Insights/export sections had manual spacing drift. | Added `PageShell` + `PageSection` for date range, insights, export cluster; refresh action now full-width on mobile. | Layout-contract pass | DN |
| `/settings` | Redirect route only. | No visual surface; behavior unchanged. | Redirect-only | NJ |
| `/settings/branches` | Wrapper-only route relied on local spacing. | Backing `BranchesTable` moved to `PageShell`; header CTA width normalized. | Layout-contract pass | DN |
| `/settings/branches/[id]` | Branch hub used independent container conventions. | Backing `BranchHubConfig` migrated to `PageShell` + `PageSection`; overview/header and global-pricing CTA now wrap cleanly on mobile. | Layout-contract pass | DN |
| `/settings/garments` | Wrapper-only route relied on local spacing. | Backing `GarmentTypesTable` moved to `PageShell`; header CTA width normalized. | Layout-contract pass | DN |
| `/settings/garments/[id]` | Detail/main/sidebar grid inconsistent with other detail routes. | Added `PageShell`; converted to `DetailSplit`; normalized section grouping; detail header actions now stack cleanly on mobile. | Layout-contract pass | DN |
| `/settings/measurements` | Wrapper-only route relied on local spacing. | Backing `MeasurementCategoriesTable` moved to `PageShell`; header CTA width normalized. | Layout-contract pass | DN |
| `/settings/measurements/[id]` | Detail module had its own section rhythm conventions. | Backing `MeasurementCategoryDetail` moved to `PageShell` + `PageSection`; primary add-field action normalized for mobile width. | Layout-contract pass | DN |
| `/settings/rates` | Header/back/action stack not mobile-friendly. | Added `PageShell`; rates header tuned for mobile stack and full-width CTA with consistent premium action styling. | Layout-contract pass | DN |
| `/settings/design-types` | Header/back/action stack not mobile-friendly. | Added `PageShell`; design-types header tuned for mobile stack/full-width CTA and width-safe content container. | Layout-contract pass | DN |
| `/settings/users` | Wrapper-only route relied on local spacing. | Backing `UsersTable` moved to `PageShell`; page header CTA normalized to shared premium button sizing. | Layout-contract pass | DN |
| `/login` | Auth shell not using shared page container system. | Added full-width `PageShell` wrapper while preserving split auth panel. | Layout-contract pass | DN |
| `/status/[token]` | PIN gate and verified screen used different outer container contracts. | Added `PageShell` for both pin-gate and verified states (narrow/focused), improved mobile spacing for details/items cards, and added explicit invalid/expired-link empty state. | Layout-contract pass | DN |
| `/unauthorized` | Static centered layout but not on shared shell. | `AuthStateCard` migrated to `PageShell` + `PageSection`; action row now uses full-width mobile buttons with wrap-safe desktop behavior. | Layout-contract pass | DN |

## Latest Validation

- `npm run lint -w web`: pass
- `npx tsc -p apps/web/tsconfig.json --noEmit`: pass
- `npm run build -w web`: pass

## Latest Route Completion Reports

### Route: `/`
- Status: DN
- Files changed:
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/app/(dashboard)/page.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/dashboard/dashboard-kpi-card.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/dashboard/dashboard-overdue-banner.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/dashboard/dashboard-revenue-expenses-card.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/dashboard/dashboard-garment-breakdown-card.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/dashboard/dashboard-design-popularity-card.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/dashboard/dashboard-overdue-orders-card.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/dashboard/dashboard-productivity-card.tsx`
- Before issues:
  - Previous redesign felt visually heavy and over-complex.
  - Large hero + snapshot treatment reduced clarity of core business metrics.
- Changes made:
  - Replaced hero-heavy layout with a simple professional structure: header actions, KPI row, alerts, then analytics.
  - Removed unnecessary visual complexity and toned down card effects across dashboard sections.
  - Kept actionable hierarchy clear with primary `New Order` and secondary `Open Reports`.
  - Preserved existing data/behavior while improving spacing, readability, and responsiveness.
- Responsive checks:
  - 360px: pass
  - 768px: pass
  - 1280px: pass
- Interaction regression checks:
  - Header actions: pass
  - Filters/forms/dialogs: pass
  - Navigation/buttons: pass
- Accessibility quick pass:
  - Heading order: pass
  - Focus visibility: pass
  - Touch target size: pass
- Follow-ups:
  - None

### Route Group: Global Shell (`(dashboard)` shared chrome)
- Status: DN
- Files changed:
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/ui/page-shell.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/layout/Topbar.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/layout/Sidebar.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/layout/BranchSelector.tsx`
- Before issues:
  - `PageShell` dashboard width used `max-w-9xl` (not valid in this Tailwind setup), causing inconsistent desktop width control.
  - Shared nav chrome had minor responsive/accessibility drift (settings expander semantics, topbar balance).
- Changes made:
  - Replaced dashboard shell width with explicit valid max width (`max-w-[1600px]`).
  - Refined topbar responsive zones and search behavior.
  - Updated topbar dropdown navigation items to use consistent menu semantics via `DropdownMenuItem asChild`.
  - Improved sidebar settings expander semantics (`button`, `aria-expanded`, `aria-controls`) and tightened drawer/header consistency.
  - Adjusted branch selector trigger width behavior for cleaner mobile/desktop fit.
- Responsive checks:
  - 360px: pass (drawer + topbar controls remain usable)
  - 768px: pass
  - 1280px: pass
- Interaction regression checks:
  - Header actions: pass
  - Filters/forms/dialogs: pass
  - Navigation/buttons: pass
- Accessibility quick pass:
  - Heading order: pass
  - Focus visibility: pass
  - Touch target size: pass
- Follow-ups:
  - None

### Build Stability: Web Runtime Env
- Status: DN
- Files changed:
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/app/api/status/[token]/route.ts`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/app/api/auth/[...nextauth]/route.ts`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/lib/env.ts`
- Before issues:
  - `next build` failed when API env vars were not injected during build-time module evaluation.
  - Public status/auth route handlers resolved server URLs at import-time.
- Changes made:
  - Moved status API base-url resolution into request-time branch with explicit 500 fallback response.
  - Refactored NextAuth route to create handler at request-time and return explicit config error response when env is missing.
  - Relaxed frontend API base-url resolver to use localhost fallback when `NEXT_PUBLIC_API_URL` is not injected (server-only env checks remain strict).
- Verification:
  - `npm run build -w web`: pass
- Follow-ups:
  - For production deployment, set `NEXT_PUBLIC_API_URL`, `INTERNAL_API_URL`, and `NEXTAUTH_SECRET` explicitly.

### Route: `/orders/[id]`
- Status: DN
- Files changed:
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/app/(dashboard)/orders/[id]/page.tsx`
- Before issues:
  - Missing-order path rendered blank.
  - Loading/not-found states were not aligned with shell system.
- Changes made:
  - Added shell-wrapped empty-state fallback with clear recovery CTA.
  - Kept existing behavior for detail actions and dialogs unchanged.
- Responsive checks:
  - 360px: pass (empty state scales within page shell)
  - 768px: pass
  - 1280px: pass
- Interaction regression checks:
  - Header actions: pass
  - Filters/forms/dialogs: pass
  - Navigation/buttons: pass
- Accessibility quick pass:
  - Heading order: pass
  - Focus visibility: pass
  - Touch target size: pass
- Follow-ups:
  - None

### Route: `/status/[token]`
- Status: DN
- Files changed:
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/app/status/[token]/page.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/status/status-pin-gate-card.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/status/status-order-details-card.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/status/status-order-items-card.tsx`
- Before issues:
  - Invalid/expired token branch could render blank.
  - Detail/items card layouts were tight at 360px.
- Changes made:
  - Added explicit empty-state for invalid/expired status links.
  - Converted details grid to mobile-first single-column and improved items row stacking.
  - Tuned pin-gate spacing for smaller screens.
- Responsive checks:
  - 360px: pass (no forced two-column detail layout)
  - 768px: pass
  - 1280px: pass
- Interaction regression checks:
  - Header actions: pass
  - Filters/forms/dialogs: pass
  - Navigation/buttons: pass
- Accessibility quick pass:
  - Heading order: pass
  - Focus visibility: pass
  - Touch target size: pass
- Follow-ups:
  - None

### Route: `/settings/branches/[id]`
- Status: DN
- Files changed:
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/config/branches/hub/branch-hub-overview-header.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/config/branches/hub/branch-global-pricing-card.tsx`
- Before issues:
  - Header metadata/action badges were looser and less predictable on narrow widths.
  - Global pricing CTA was not mobile-width friendly.
- Changes made:
  - Tightened header spacing and made action cluster width-aware on mobile.
  - Made global pricing card padding responsive and CTA full-width on mobile.
- Responsive checks:
  - 360px: pass
  - 768px: pass
  - 1280px: pass
- Interaction regression checks:
  - Header actions: pass
  - Filters/forms/dialogs: pass
  - Navigation/buttons: pass
- Accessibility quick pass:
  - Heading order: pass
  - Focus visibility: pass
  - Touch target size: pass
- Follow-ups:
  - None

## Page Completion Report Template

Use this template for each subsequent page-specific follow-up pass.

```md
### Route: <route>
- Status: DN | IP | NS | BL
- Files changed:
  - <absolute/path/one>
  - <absolute/path/two>
- Before issues:
  - <alignment/spacing/responsive issue 1>
  - <issue 2>
- Changes made:
  - <what changed 1>
  - <what changed 2>
- Responsive checks:
  - 360px: <result>
  - 768px: <result>
  - 1280px: <result>
- Interaction regression checks:
  - Header actions: pass/fail + notes
  - Filters/forms/dialogs: pass/fail + notes
  - Navigation/buttons: pass/fail + notes
- Accessibility quick pass:
  - Heading order: pass/fail
  - Focus visibility: pass/fail
  - Touch target size: pass/fail
- Follow-ups:
  - <item or none>
```
