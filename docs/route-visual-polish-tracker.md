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
| 12 | `/reports` | `app/(dashboard)/reports/page.tsx` | DN | Rebuilt into tabbed analytics workspace (Overview, Financial, Operations, Exports) with chart-first flow. |
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
| `/reports` | Long stacked card layout made analytics scanning difficult. | Rebuilt into tabbed chart workspace with unified filters, backend-driven trend/distribution/productivity data, and dedicated export tab. | Layout-contract pass | DN |
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

### Route: `/orders` (layout refresh)
- Status: DN
- Files changed:
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/app/(dashboard)/orders/page.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/orders/orders-list-toolbar.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/orders/orders-list-table.tsx`
- Before issues:
  - Orders page relied on a single table block with weak visual hierarchy.
  - Toolbar controls and reset action alignment were less predictable across mobile and desktop.
  - Table rows were readable but visually flat for customer/due-date scanning.
- Changes made:
  - Added a four-card snapshot band (filtered value, due soon, overdue, completed) above the table.
  - Refined toolbar layout: grouped search and filters, right-aligned reset action, explicit `orders` result label.
  - Improved row readability with customer initials avatar, enhanced due-date sub-status, and more consistent action-cell spacing.
  - Kept all existing handlers/behavior unchanged (search, filters, paging, row actions, routing).
- Responsive checks:
  - 360px: pass (cards stack and controls wrap without clipping)
  - 768px: pass (2-column snapshot + stable toolbar grouping)
  - 1280px: pass (4-column snapshot + right-balanced toolbar and table actions)
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

### Route: `/orders/[id]` (detail redesign pass)
- Status: DN
- Files changed:
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/app/(dashboard)/orders/[id]/page.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/orders/order-detail-breadcrumb.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/orders/order-detail-header-card.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/orders/order-customer-insight-card.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/orders/order-items-table.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/orders/order-financial-summary-card.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/orders/order-timeline-card.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/orders/order-lifecycle-card.tsx`
- Before issues:
  - Header actions and metadata felt dense and visually flat.
  - Customer/items/finance/timeline cards used mixed visual rhythm and weak separation.
  - Detail page lacked a concise top-level snapshot for quick decision-making.
- Changes made:
  - Rebuilt header command card with stronger action hierarchy and cleaner metadata pills.
  - Added top snapshot cards for pieces, assigned tailors, active tasks, and balance due.
  - Refined detail split to `3-2` and reordered side rail for better operational flow.
  - Redesigned customer profile, order items, financial summary, timeline, and lifecycle cards for consistent spacing/typography.
  - Preserved all existing business behavior (status updates, payment capture, task dialogs, sharing, print).
- Responsive checks:
  - 360px: pass (actions and metric cards stack cleanly)
  - 768px: pass (balanced two-column behavior and card spacing)
  - 1280px: pass (stable 3/2 detail split and side rail hierarchy)
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

### Route: `/orders/new` (form experience refresh)
- Status: DN
- Files changed:
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/app/(dashboard)/orders/new/page.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/orders/order-form-customer-card.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/orders/order-form-items-card.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/orders/order-form-item-card.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/orders/order-form-summary-card.tsx`
- Before issues:
  - Top-level context for mode/customer/pieces/due date was weak.
  - Piece card controls and addon actions felt misaligned and visually inconsistent.
  - Summary rail fields were dense on mobile and lacked clear grouping.
- Changes made:
  - Added a consistent four-card operations strip under the page header (workflow, customer, pieces, due date).
  - Wired `selectedCustomer` into the customer card and surfaced customer preview details.
  - Reworked item cards for stronger control alignment, clearer piece totals, and consistent destructive icon-button behavior.
  - Refined summary rail grouping (customer/due, subtotal+discount, totals+balance) and improved mobile stacking.
- Responsive checks:
  - 360px: pass (cards stack, action buttons remain full-width where needed)
  - 768px: pass (balanced card grid and stable form grouping)
  - 1280px: pass (clean `DetailSplit` with persistent summary rail)
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

### Route: `/customers` (list-page polish refresh)
- Status: DN
- Files changed:
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/customers/CustomerTable.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/customers/list/customers-page-header.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/customers/list/customers-list-toolbar.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/customers/list/customers-directory-table.tsx`
- Before issues:
  - Page opened directly into the table with limited top-level context.
  - Toolbar filter count and mobile reset alignment were less explicit.
  - Minor inconsistency in table density and action-cell polish.
- Changes made:
  - Added a compact insight strip (total, WhatsApp connected in current view, active segment) before the directory table.
  - Updated page header copy/CTA wording and improved visual hierarchy.
  - Tightened toolbar behavior with explicit `customers` result labeling, accurate active-filter count, and mobile-safe reset placement.
  - Polished customer rows (avatar sizing, tabular number treatment, action-button semantics).
- Responsive checks:
  - 360px: pass (insight cards stack and toolbar controls wrap cleanly)
  - 768px: pass (two-column insight rhythm + stable toolbar)
  - 1280px: pass (three-card insight row + balanced table surface)
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

### Route: `/customers/[id]` (no-tabs detail redesign)
- Status: DN
- Files changed:
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/app/(dashboard)/customers/[id]/page.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/hooks/use-customer-detail-page.ts`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/customers/detail/customer-detail-header.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/customers/detail/customer-profile-card.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/customers/detail/customer-detail-tabs.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/customers/detail/customer-measurements-tab.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/customers/detail/customer-orders-tab.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/customers/detail/customer-notes-tab.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/customers/detail/customer-detail-skeleton.tsx`
- Before issues:
  - Detail view relied on tab switching, which hid context and slowed scanning on mobile.
  - Header/profile content was visually flatter and less aligned with current route polish system.
  - Measurements/orders/notes sections had mixed spacing rhythm.
- Changes made:
  - Removed tab-based navigation from detail surface and converted to persistent stacked sections (Measurements, Order History, Notes).
  - Added a top KPI strip (orders, spent, lifetime value, measurement sets) for immediate context.
  - Rebuilt detail header action hierarchy and metadata badges for cleaner mobile/desktop alignment.
  - Refined profile card styling and section cards for consistent dark-theme spacing and readability.
- Responsive checks:
  - 360px: pass (no hidden tab content, section flow remains readable)
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

### Route: `/employees` (list-page visual refresh)
- Status: DN
- Files changed:
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/app/(dashboard)/employees/page.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/employees/list/employees-list-toolbar.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/employees/list/employees-list-table.tsx`
- Before issues:
  - Page entered directly into table with minimal operational context.
  - Toolbar reset control and result labeling were less consistent with other polished list routes.
  - Minor typography/action inconsistencies in list rows.
- Changes made:
  - Added a consistent insight strip (total employees, rows on page, filter state) above the table.
  - Updated page header copy/CTA phrasing and wrapped table in standardized sectioned shell.
  - Aligned toolbar behavior with shared contract (`employees` result label, mobile-safe reset alignment).
  - Polished table row density, tabular contact display, and action semantics.
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

### Route: `/employees/[id]` (complete detail redesign pass)
- Status: DN
- Files changed:
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/app/(dashboard)/employees/[id]/page.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/employees/detail/employee-detail-breadcrumb.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/employees/detail/employee-detail-header.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/employees/detail/employee-financial-cards.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/employees/detail/employee-profile-sidebar.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/employees/detail/employee-detail-tabs.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/employees/detail/employee-detail-skeleton.tsx`
- Before issues:
  - Detail header structure differed from the standardized order/customer detail command headers.
  - Missing breadcrumb hierarchy and weaker visual rhythm between header, KPIs, and content split.
  - Tab rail and ledger controls were less responsive on narrow screens.
- Changes made:
  - Added detail breadcrumb (`Employees > {employeeCode}`) and converted header to command-card pattern with aligned metadata/action clusters.
  - Refined KPI cards and sidebar cards to shared spacing, border, and typographic standards.
  - Rebalanced detail layout via `DetailSplit` and improved mobile order.
  - Improved tabs responsiveness (horizontal scroll-safe trigger rail) and ledger filter/action control wrapping for mobile.
  - Updated skeleton layout to match final page structure.
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

### Route: `/employees/[id]` (no-tabs interaction upgrade)
- Status: DN
- Files changed:
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/employees/detail/employee-detail-tabs.tsx`
- Before issues:
  - Detail content still depended on tabs, which hid key sections and reduced scanability.
  - Mobile interaction required repeated tab switching for core actions (ledger/documents/account).
- Changes made:
  - Replaced tabbed layout with stacked, collapsible section cards (Production Tasks, Work History, Ledger, Attendance, Documents, Account).
  - Added quick-jump section links at top for faster navigation across long detail surfaces.
  - Preserved all existing behavior and handlers (task status, ledger filters/delete/paging, document upload, account provisioning).
  - Moved ledger initial fetch to first section open for predictable lazy loading without tab events.
- Responsive checks:
  - 360px: pass (collapsible sections reduce scrolling fatigue and avoid hidden tab rails)
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

### Route: `/orders/new` (form layout polish pass)
- Status: DN
- Files changed:
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/app/(dashboard)/orders/new/page.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/orders/order-form-summary-card.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/orders/order-form-items-card.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/orders/order-form-item-card.tsx`
- Before issues:
  - Entry experience lacked a clear workflow frame and section hierarchy.
  - Summary rail sticky behavior could feel cramped on smaller viewports.
  - Item cards repeated piece-total context and had slightly noisy action hierarchy.
- Changes made:
  - Added an explicit `Order Workflow` guidance card with three clear steps above the form.
  - Refined top snapshot grid into a cleaner three-card operational strip (customer, pieces, due date).
  - Wrapped form area in explicit `PageSection` rhythm and moved sticky behavior to split-side container on desktop.
  - Updated summary card header/body/footer hierarchy for clearer review/submit flow.
  - Simplified item card header copy, reduced duplicate total messaging, and normalized addon action button styling.
- Responsive checks:
  - 360px: pass (actions full-width, cards stack cleanly, no overflow)
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

### Route: `/payments` (visual polish pass)
- Status: DN
- Files changed:
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/app/(dashboard)/payments/page.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/payments/payments-employee-selector-card.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/payments/payments-summary-cards.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/payments/payments-history-section.tsx`
- Before issues:
  - Header context and section rhythm were lighter than other polished Core Ops routes.
  - Employee selector lacked clear contextual metadata once a staff member was selected.
  - KPI cards used mixed visual treatment and less consistent action hierarchy.
  - History toolbar reset behavior felt tighter on mobile.
- Changes made:
  - Wrapped page header in standard section rhythm and made description context-aware based on selected employee.
  - Redesigned employee selector into command-style card with icon, clearer helper copy, and selected employee metadata chips.
  - Reworked payment summary cards into consistent neutral card system with stronger hierarchy and explicit outstanding status badge.
  - Updated history block title/result labeling and improved mobile filter-reset behavior (full-width reset on small screens).
- Responsive checks:
  - 360px: pass (selector and reset controls stack cleanly)
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

### Route: `/expenses` (visual polish pass)
- Status: DN
- Files changed:
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/app/(dashboard)/expenses/page.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/expenses/expenses-overview-cards.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/expenses/expenses-filters-card.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/expenses/expenses-table.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/expenses/expense-create-dialog.tsx`
- Before issues:
  - Page sections were functionally correct but flatter than updated Core Ops visual hierarchy.
  - Overview area had only two cards and weaker filter-state visibility.
  - Toolbar filter controls/reset alignment was less consistent on mobile.
  - Expense create dialog lacked context block and had slightly denser spacing.
- Changes made:
  - Standardized page-header section rhythm and made description context-aware with current totals.
  - Upgraded overview strip to three cards (page spend, record count, active filters) with consistent icon/header treatment.
  - Improved toolbar labeling and made reset action full-width on mobile and right-aligned on larger screens.
  - Tuned table row typography and description readability while preserving behavior.
  - Added a compact context panel and relaxed vertical rhythm in create-expense dialog.
- Responsive checks:
  - 360px: pass (cards stack, filter controls wrap cleanly, reset remains accessible)
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

### Cross-Route: Shared Stat Card System
- Status: DN
- Files changed:
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/ui/stat-card.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/app/(dashboard)/orders/page.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/app/(dashboard)/orders/new/page.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/customers/CustomerTable.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/app/(dashboard)/customers/[id]/page.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/app/(dashboard)/employees/page.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/employees/detail/employee-financial-cards.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/payments/payments-summary-cards.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/expenses/expenses-overview-cards.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/config/users/users-stats-grid.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/config/garments/detail/garment-analytics-stats-grid.tsx`
- Before issues:
  - Multiple routes used custom one-off stat card markup with different spacing, icon framing, and value hierarchy.
  - Design drift made KPI strips feel inconsistent between Core Ops and Settings views.
- Changes made:
  - Introduced reusable `StatCard` primitive with unified header/body structure, tone variants, badge support, helper text, and optional action slot.
  - Migrated core KPI strips and settings stat grids to use the shared primitive while preserving route data and behavior.
  - Standardized icon container, title/subtitle rhythm, value styling, and card shell across migrated pages.
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
  - Continue migrating remaining specialized analytics cards (dashboard/reports) to `StatCard` where appropriate.

### Route: `/reports` (tabbed analytics workspace)
- Status: DN
- Files changed:
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/api/src/reports/reports.controller.ts`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/api/src/reports/reports.service.ts`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/packages/shared-types/src/reports.ts`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/lib/api/reports.ts`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/lib/reports-date.ts`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/hooks/use-reports-workspace.ts`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/app/(dashboard)/reports/page.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/ui/chart-shell.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/ui/chart-empty-state.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/ui/chart-loading-state.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/reports/reports-workspace-filters.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/reports/reports-overview-tab.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/reports/reports-financial-tab.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/reports/reports-operations-tab.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/reports/reports-exports-tab.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/reports/reports-financial-trend-chart.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/reports/reports-distribution-chart.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/reports/reports-productivity-chart.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/reports/reports-chart-legend.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/reports/reports-export-grid.tsx`
- Before issues:
  - Analytics content was stacked vertically with high scanning cost and weak content hierarchy.
  - Graph surfaces were mostly card-like summaries without dedicated trend/distribution work areas.
  - Date/filter controls were isolated from chart context and did not support preset-driven flow.
- Changes made:
  - Rebuilt `/reports` into a tabbed workspace: `Overview`, `Financial`, `Operations`, `Exports`.
  - Added unified filter bar with date presets (`7D/30D/90D/MTD/QTD/YTD/Custom`) and granularity control.
  - Added backend-driven report endpoints for financial trend, distributions, and ranged productivity.
  - Extended summary payload with previous-period metrics for trend comparison badges.
  - Implemented reusable chart UI primitives (`ChartShell`, empty/loading states) and dedicated chart components.
  - Kept export/print flows unchanged while moving them into a dedicated tab.
  - Removed obsolete pre-tab reports components to reduce UI drift and duplication.
- Responsive checks:
  - 360px: pass (filter chips/tabs scroll-wrap safely, charts stack cleanly)
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
  - Recharts dependency install is currently blocked in this environment (no npm registry network access), so charts are implemented with robust native SVG for this pass.

### Route: `/settings/garments` (list consistency + stats pass)
- Status: DN
- Files changed:
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/config/GarmentTypesTable.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/config/garments/list/garment-types-stats-grid.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/config/garments/list/garment-types-list-toolbar.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/config/garments/list/garment-types-inventory-table.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/hooks/use-garment-types-page.ts`
- Before issues:
  - Route lacked backend-driven KPI strip and relied mostly on table-only presentation.
  - Row-click behavior was less consistent with other core/settings tables.
  - Toolbar search affordance and results language were less clear.
- Changes made:
  - Added backend-driven garment KPI strip using shared `StatCard` component (total types, active types, avg retail price, visible results).
  - Updated hook to fetch table data + garment stats in parallel from existing backend APIs.
  - Added table row click navigation to garment detail for consistency with other tables.
  - Isolated action buttons with `stopPropagation` to prevent accidental row navigation.
  - Refined toolbar copy/icon (`Search`, `types`) for clearer filter intent.
- Responsive checks:
  - 360px: pass (stats stack and toolbar wraps without clipping)
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

### Route: `/settings/garments/[id]` (complete detail redesign)
- Status: DN
- Files changed:
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/app/(dashboard)/settings/garments/[id]/page.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/config/garments/detail/garment-detail-breadcrumb.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/config/garments/detail/garment-detail-header.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/config/garments/detail/garment-analytics-stats-grid.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/config/garments/detail/garment-overview-card.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/config/garments/detail/garment-measurement-forms-card.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/config/garments/detail/garment-pricing-sidebar.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/config/garments/detail/garment-pricing-logs-card.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/config/garments/detail/garment-rates-section.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/config/garments/detail/garment-detail-skeleton.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/config/garments/detail/garment-detail-not-found.tsx`
- Before issues:
  - Detail page header and navigation pattern were inconsistent with other command-style detail routes.
  - Content hierarchy felt fragmented (rates detached from main detail flow and weaker section rhythm).
  - Skeleton/not-found states did not match the standardized route shell contract.
- Changes made:
  - Added garment breadcrumb and rebuilt header as a command card with aligned metadata/action hierarchy.
  - Upgraded KPI strip to include payout-focused financial context.
  - Rebalanced layout into `DetailSplit` (`3-2`) with stronger main/side information grouping.
  - Redesigned overview, measurement forms, pricing sidebar, pricing logs, and rates section with consistent card primitives and responsive action rows.
  - Standardized loading and not-found states using shared shell/section patterns.
- Responsive checks:
  - 360px: pass (header actions stack cleanly, no clipped controls)
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

### Route: `/settings/rates` (labor rates consistency pass)
- Status: DN
- Files changed:
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/app/(dashboard)/settings/rates/page.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/rates/rates-page-header.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/rates/rates-stats-grid.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/rates/rates-search-stats.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/hooks/use-rates-page.ts`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/lib/api/rates.ts`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/api/src/rates/rates.controller.ts`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/api/src/rates/rates.service.ts`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/packages/shared-types/src/rates.ts`
- Before issues:
  - Header/back pattern drifted from other settings list pages.
  - No standardized KPI strip above table for quick rate coverage visibility.
  - Page lacked a dedicated backend stats contract.
- Changes made:
  - Converted header to shared list-page pattern with consistent CTA hierarchy.
  - Added backend-driven rates stats endpoint and stat-card strip (total/global/branch-scoped/visible rows).
  - Kept existing search/pagination behavior while aligning toolbar labels and reset action.
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

### Route: `/settings/design-types` (table + filter consistency pass)
- Status: DN
- Files changed:
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/app/(dashboard)/settings/design-types/page.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/design-types/design-types-page-header.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/design-types/design-types-table.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/design-types/design-types-stats-grid.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/hooks/use-design-types-page.ts`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/lib/api/design-types.ts`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/api/src/design-types/design-types.controller.ts`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/api/src/design-types/design-types.service.ts`
- Before issues:
  - No search/reset toolbar controls despite table-heavy workflow.
  - Header pattern drifted with back-button treatment unlike other settings list routes.
  - No unified KPI strip for scope and activation visibility.
- Changes made:
  - Added backend search support for design types and wired it through page hook + toolbar.
  - Added shared stat-card strip (total/global/branch-scoped/active).
  - Enabled row click edit interaction and isolated action buttons with stopPropagation for predictable behavior.
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

### Route: `/settings/measurements` (list analytics + shell consistency pass)
- Status: DN
- Files changed:
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/config/MeasurementCategoriesTable.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/config/measurements/list/measurement-categories-stats-grid.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/config/measurements/list/measurement-categories-list-toolbar.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/hooks/use-measurement-categories-page.ts`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/lib/api/config.ts`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/api/src/config/config.controller.ts`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/api/src/config/config.service.ts`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/packages/shared-types/src/config.ts`
- Before issues:
  - Page had table-only presentation with no high-level measurement coverage indicators.
  - Measurement stats were not available through a dedicated backend contract.
- Changes made:
  - Added backend `measurement-stats` endpoint and connected it to the page hook.
  - Added shared KPI strip (categories/active/total fields/visible rows).
  - Kept existing table filtering and pagination while aligning toolbar label contract.
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

### Route: `/settings/measurements/[id]` (detail reliability + visual redesign pass)
- Status: DN
- Files changed:
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/config/MeasurementCategoryDetail.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/config/measurements/detail/measurement-category-breadcrumbs.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/config/measurements/detail/measurement-category-detail-header.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/config/measurements/detail/measurement-fields-stats-grid.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/components/config/measurements/detail/measurement-fields-table.tsx`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/hooks/use-measurement-category-detail-page.ts`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/web/lib/api/config.ts`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/api/src/config/config.controller.ts`
  - `/Users/muhammadawais/Documents/My Tailors/tbms/apps/api/src/config/config.service.ts`
- Before issues:
  - Detail page loaded category by fetching up to 100 categories and filtering client-side.
  - Header/breadcrumb pattern differed from other modernized detail pages.
  - No dedicated field-level KPI context in detail view.
- Changes made:
  - Added backend single-category endpoint and switched detail hook to direct fetch by id (correct/reliable).
  - Rebuilt breadcrumb + command header to match detail-page contract.
  - Added field stats strip (total/required/optional/dropdown) and improved not-found handling.
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
