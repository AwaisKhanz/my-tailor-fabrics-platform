# SnowUI Route Migration Checklist

## Foundation
- [x] SnowUI token layer applied in `apps/web/app/globals.css`
- [x] Tailwind semantic mapping updated in `apps/web/tailwind.config.ts`
- [x] SnowUI palette utilities added for status/chart accents
- [x] Theme audit expectations updated for Inter-based typography

## Shared Components
- [x] Core form controls restyled: button, input, textarea, select, checkbox, switch
- [x] Shared surfaces restyled: card, badge, tabs, dialog, dropdown, popover, toast
- [x] Layout primitives restyled: page shell, page header, empty state, table, data table, stats, chart shell
- [x] Supporting visuals restyled: info tile, section icon, meta pill, skeleton, scroll area

## Shell
- [x] Dashboard shell background and spacing updated
- [x] Topbar and sidebar moved to SnowUI surface treatment
- [x] Global search and branch selector aligned to SnowUI controls
- [x] Authenticated loading state aligned to SnowUI surface treatment

## Route Waves
- [x] Auth/public entry surfaces updated through shared primitives plus targeted edits
  - `/login`
  - `/unauthorized`
  - `/status/[token]`
- [x] Core operations routes updated through shared layout/table/stat/card primitives
  - `/`
  - `/my-orders`
  - `/orders`
  - `/orders/new`
  - `/orders/[id]`
  - `/customers`
  - `/customers/[id]`
  - `/employees`
  - `/employees/[id]`
- [x] Finance/reporting routes updated through shared layout/table/stat/card/chart primitives
  - `/payments`
  - `/expenses`
  - `/reports`
- [x] Settings/admin routes updated through shared layout/table/form/dialog primitives
  - all `/settings/*` routes

## Verification
- [x] `npm run lint -w web`
- [x] `npm run build -w web`
- [x] `npm run theme:audit -w web`
- [x] `npm run theme:migration:verify`
- [x] `npm run theme:usage:audit`
- [x] Browser QA completed on `http://localhost:3000` for shell chrome, theme toggle, `/login`, `/unauthorized`, `/status/[token]`, `/`, `/orders`, `/reports`, `/settings/users`, and `/orders/new`
