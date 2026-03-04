# TBMS Global Theme Consistency Tracker

## Scope
- Enforce semantic theme tokens across all pages and components.
- Validate all routes in 3 presets x light/dark x 360/768/1280.

## Presets
- Heritage Craft
- Modern Minimal
- Royal Atelier

## Phase Status
| Phase | Scope | Status |
|---|---|---|
| Phase 0 | Contract lock + tracker + audit tooling | Done |
| Phase 1 | UI primitive tokenization | Done |
| Phase 2 | Layout + global chrome | Done |
| Phase 3 | Charts + analytics compliance | Done |
| Phase 4 | Route-by-route theme sweep | Done |
| Phase 5 | Non-route component sweep | Done |
| Phase 6 | Full matrix QA + closure | Done (tests skipped by request) |

## QA Run Log
- `npm run theme:audit -w web`: Passed (no hardcoded color/token violations).
- `npm run lint -w web`: Passed.
- `npm run build -w web`: Passed.
- Runtime route sweep via `next start`: Blocked in this environment because privileged local server start/check required escalation approval.
- Visual matrix sweep (3 presets x 2 modes x 3 breakpoints): Skipped by request.

## Route Checklist
| # | Route | Status | Notes |
|---:|---|---|---|
| 1 | `/orders` | Done | Token + table system aligned, passes audit |
| 2 | `/my-orders` | Done | Token + table system aligned, passes audit |
| 3 | `/customers` | Done | Token + table system aligned, passes audit |
| 4 | `/employees` | Done | Token + table system aligned, passes audit |
| 5 | `/payments` | Done | Token + table system aligned, passes audit |
| 6 | `/expenses` | Done | Token + table system aligned, passes audit |
| 7 | `/orders/new` | Done | Tokenized form and stat surfaces |
| 8 | `/orders/[id]` | Done | Tokenized detail cards/dialog actions |
| 9 | `/customers/[id]` | Done | Tokenized detail header/cards/tabs |
| 10 | `/employees/[id]` | Done | Tokenized detail header/cards/actions |
| 11 | `/` | Done | Dashboard charts and cards tokenized |
| 12 | `/reports` | Done | Reports workspace charts tokenized |
| 13 | `/settings` | Done | Redirect validated to garments/settings flow |
| 14 | `/settings/branches` | Done | Tokenized stats/table/dialog surfaces |
| 15 | `/settings/garments` | Done | Tokenized stats/table/dialog surfaces |
| 16 | `/settings/measurements` | Done | Tokenized stats/table/dialog surfaces |
| 17 | `/settings/rates` | Done | Tokenized stats/table/dialog surfaces |
| 18 | `/settings/design-types` | Done | Tokenized stats/table/dialog surfaces |
| 19 | `/settings/users` | Done | Tokenized stats/table/dialog surfaces |
| 20 | `/settings/appearance` | Done | Full semantic palette preview + apply |
| 21 | `/settings/branches/[id]` | Done | Tokenized detail cards and action bars |
| 22 | `/settings/garments/[id]` | Done | Tokenized detail cards and side panels |
| 23 | `/settings/measurements/[id]` | Done | Tokenized detail cards and table actions |
| 24 | `/login` | Done | Auth gradients/shadows converted to theme tokens |
| 25 | `/status/[token]` | Done | Public status route uses tokenized surfaces |
| 26 | `/unauthorized` | Done | Auth state route tokenized |

## Completion Report Template
### Route
- Path:
- Files changed:

### Before
- UX/theme issues found:

### After
- Theme violations fixed:
- Components standardized:

### Verification Matrix
- Heritage Craft (Light): 360 / 768 / 1280
- Heritage Craft (Dark): 360 / 768 / 1280
- Modern Minimal (Light): 360 / 768 / 1280
- Modern Minimal (Dark): 360 / 768 / 1280
- Royal Atelier (Light): 360 / 768 / 1280
- Royal Atelier (Dark): 360 / 768 / 1280

### Regression Checks
- Header/actions:
- Filters/forms/dialogs:
- Navigation/buttons:

### Accessibility Quick Pass
- Heading order:
- Focus visibility:
- Touch target size:

### Status
- Done / Follow-up needed / Blocked
