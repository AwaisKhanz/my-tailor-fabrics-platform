# Frontend Development Rules

These rules apply to `apps/web`, UI behavior, route structure, hooks, theme usage, client/server data access boundaries, and frontend operational behavior.

## 1. Current Frontend Stack

1. Framework: Next.js App Router
2. Auth/session layer: NextAuth with backend token/session integration
3. UI foundation: shadcn v4 (`base-nova`) under `packages/ui` exported as `@tbms/ui`
4. Primitive consumption rule: import base primitives directly from `@tbms/ui/components/*` (for example button, badge, input, label, textarea, avatar, checkbox)
5. Local UI wrappers are not allowed in `apps/web/components/ui`; all shared primitives and composites live in `packages/ui/src/components`
6. Theme engine: `next-themes` via `apps/web/components/ThemeProvider.tsx`
7. Styling: semantic token contract defined in `packages/ui/src/styles/globals.css`
8. Shared contracts: `@tbms/shared-types`, `@tbms/shared-constants`
9. HTTP client: centralized axios client in `apps/web/lib/api.ts`
10. Data cache/query layer: TanStack Query with centralized query keys in `apps/web/lib/query-keys.ts`

## 2. Route and File Structure Rules

1. Keep route files in `apps/web/app` thin.
2. Route files should focus on composition, auth gating, and page assembly.
3. Stateful page logic, fetch orchestration, and derived UI state belong in hooks under `apps/web/hooks`.
4. Large route-specific UI should be broken into focused components under `apps/web/components/<domain>`.
5. New reusable primitives should be added to `packages/ui/src/components` and consumed through `@tbms/ui/components/*`.
6. Do not add new web-local primitive wrappers for shared shadcn components.
7. New or refactored tables must use the TanStack pattern via shared primitives:
   - `@tbms/ui/components/data-table-tanstack`
   - `@tbms/ui/components/data-table-column-header`
8. Do not introduce new usages of the legacy custom `@tbms/ui/components/data-table` API. Migrate legacy consumers incrementally by page/feature.
9. Public marketing pages and the authenticated portal share the same Next.js app, but not the same hostname experience:
   - apex and `www` hostnames serve the public marketing site
   - `portal.mytailorandfabrics.com` serves the authenticated business portal
   - public marketing pages should live under `apps/web/app/site/*` and be reached through middleware host rewriting rather than by moving portal routes out of `apps/web/app`
   - the internal `/site` path is an implementation detail only and must never be exposed as the public brand URL
   - on the apex marketing host, `/` must resolve to marketing content before any portal auth or permission redirect logic is considered
   - local development should keep the marketing experience at `/` and expose the portal under `/portal`, including `/portal/login` for authentication

## 3. Design System and Styling Rules

1. Theme and token source of truth lives in:
   - `packages/ui/src/styles/globals.css`
   - `packages/ui/components.json`
   - `apps/web/components.json`
2. `apps/web/app/layout.tsx` must import `@tbms/ui/globals.css` directly.
3. Keep shared globals aligned with shadcn defaults; do not reintroduce `--snow-*` tokens or `snow-*` utility conventions.
4. Do not hardcode random colors, gradients, spacing values, or radii when an existing token or semantic class exists.
5. Shared card-like surfaces should keep a deliberate elevated treatment in both light and dark themes instead of becoming flat in light mode.
6. Whole-app atmosphere backgrounds should be implemented in shared theme globals so pages inherit one consistent gradient system across light and dark modes.
7. Prefer shared primitives such as:
   - `PageShell`
   - `PageSection`
   - `PageHeader`
   - `Sidebar` with shared shell variants such as `card` when navigation should visually match shared card surfaces
   - shared `Select` primitives that default to full-width field behavior unless a narrower width is intentionally requested
   - `FieldLabel`, `FieldError`, `FieldHint`, `FieldStack`
   - `FormGrid`, `FormStack`, `DialogFormActions`
   - `StatsGrid`, `StatCard`, `InteractiveTile`, `InfoTile`
   - shared buttons, cards, dialogs, tables, and form primitives
8. Table pages must keep API-query state (search, filters, pagination, sorting) in a page hook and URL state where applicable.
9. Server-driven list pages should wire TanStack pagination/sorting to backend query params instead of client-only transforms.
10. Theme behavior must go through the centralized theme flow:
   - `apps/web/app/layout.tsx`
   - `apps/web/components/ThemeProvider.tsx`
   - `apps/web/lib/theme.ts`
11. Do not create a second theme state system or route-local theme persistence.
12. Base primitives must be imported from `@tbms/ui/components/*` instead of `@/components/ui/*`.
13. Selects and other option-based controls must display human-readable labels from shared maps or option labels, never raw enum keys in the UI.
14. Role-based default-home redirects must not override `/` for users who already have `dashboard.read`; sidebar visibility, middleware, and route guards must stay consistent.
15. Order create/edit UX is piece-first:
   - each visible piece card represents one physical piece and must submit `quantity = 1`
   - mixed designs, mixed fabric sources, and piece-specific notes belong on separate piece cards, not in one bulk quantity row
   - long order capture flows should use a step-based wizard with a persistent pricing summary instead of one overloaded form
   - later wizard steps should stay visually locked until the required earlier step is valid
   - piece cards should separate required setup from optional notes/add-ons so counter staff are not forced to parse every extra field on every piece
16. There is no standalone system-settings admin screen in the live product.
   - do not add or reintroduce `/settings/system` unless product requirements explicitly restore a system-controls surface and the backend/docs are updated in the same change
   - production-task workflow should be treated as a platform rule, not a user-managed toggle
17. Production-task management UIs must respect step order per piece:
   - later steps should present as locked until previous piece steps are finished
   - inline task dialogs should treat labor rate as read-only context unless a dedicated rate-management workflow is explicitly opened elsewhere
18. High-density employee/staff detail pages should use a compact overview plus tabbed workspace pattern:
   - keep identity, employment snapshot, and key top metrics close to the header
   - group operational, financial, and admin workflows into focused tabs instead of one long mixed accordion page
   - avoid detached narrow side rails when the same information can be absorbed into an overview tab or summary band
19. Customer detail pages should use a calm tabbed workspace instead of stacked mixed cards:
   - keep the page header focused on identity and primary actions
   - put financial summary, latest measurements, and latest order state in an `Overview` tab
   - keep `Measurements`, `Orders`, and `Payments` in separate tabs so front-desk users can find the right thing without scrolling through unrelated sections
20. Setup/configuration pages should teach dependency order:
   - list pages for measurements, garments, fabrics, and labor rates should include a short setup-sequence guide that explains what comes before the current page and what it unlocks next
   - the generic `/settings` landing route should send admins to the first practical setup step instead of dropping them into the middle of the chain
21. Attendance UI is not part of the live business workflow.
   Do not add attendance pages, settings entries, employee-detail sections, or query hooks unless product requirements explicitly restore the feature and the backend/shared contracts are updated in the same task.
22. Marketing-site UX must feel like a tailoring brand, not a SaaS dashboard:
   - keep public navigation simple and focused on the currently live marketing surface; while the public site is landing-page only, use section anchors such as `Services`, `Process`, `Preview`, and `Testimonials` rather than links to unfinished standalone pages
   - prefer verified WhatsApp and inquiry conversion patterns over admin-style forms
   - do not hard-code placeholder public contact links, phone numbers, or street addresses; use typed web config/env helpers and safe internal fallbacks when real public contact data is not available
   - keep the public marketing shell visually distinct from the portal shell even though both run inside the same Next.js app
23. Marketing page composition belongs under `apps/web/components/marketing`.
   - keep the marketing site visually distinct from the portal, but prefer the normal shared `@tbms/ui/components/*` primitives instead of a second experimental UI namespace unless product requirements explicitly justify one

## 4. Data Access Rules

1. Frontend code should use the centralized API client in `apps/web/lib/api.ts`.
2. Domain-specific request helpers belong in `apps/web/lib/api/<domain>.ts`.
3. Server-state fetching/caching must use TanStack Query hooks (queries + mutations) instead of ad hoc `useEffect` fetch orchestration for page data.
4. Query keys must be defined through `apps/web/lib/query-keys.ts` (or local key-factory constants when a domain is intentionally private to one hook).
5. Mutation side effects must invalidate affected query keys explicitly.
6. Components should not create their own axios instances.
7. Do not bypass the centralized auth refresh, branch header, and 401 recovery flow.
8. If a new backend endpoint is added for frontend use, add or update the corresponding typed client helper.
9. Frontend data hooks must gate privileged queries with the same permission checks that gate the UI; do not fire admin/finance/settings requests for roles that cannot read them.
10. Money fields must use one consistent web boundary: forms accept rupee-friendly values, centralized API helpers convert writes to paisa, and read/display paths treat stored money values as paisa.
11. Shop-fabric pricing is branch-scoped and piece-scoped:
   - piece forms must load branch fabrics from the centralized fabrics query helpers
   - `fabricSource = SHOP` must collect the selected fabric item and a piece-level fabric price input or snapshot value
   - order detail and receipt screens must display shop-fabric charges separately from tailoring, design, and addon totals
12. Write mutations (`POST`/`PUT`/`PATCH`/`DELETE`) should rely on the centralized API toast fallback in `apps/web/lib/api.ts` so users always receive success/failure feedback even when a page-level handler misses it.
13. If a specific action already has a custom page toast copy, suppress duplicate global toasts through axios request config (`tbmsToast.suppressSuccess` or `tbmsToast.suppressError`) instead of bypassing centralized API helpers.

## 5. Auth and Authorization Rules

1. Frontend authorization must use the existing shared helpers and wrappers:
   - `apps/web/lib/authz.ts`
   - `apps/web/hooks/use-authz.ts`
   - `apps/web/components/auth/with-role-guard.tsx`
   - `apps/web/components/auth/can.tsx`
2. Do not duplicate permission matrices or role logic in page files.
3. Route gating and component gating must stay aligned with shared RBAC contracts.
4. When frontend code references a permission, use the shared `PERMISSION` export from `@tbms/shared-constants` instead of repeating a raw permission string.
5. Super Admin branch scoping is mandatory at runtime:
   - After login, dashboard layout must block application pages until an active branch is selected.
   - The selected branch must be persisted and used for subsequent API requests.
   - Selection must be explicit for each authenticated login session; do not silently auto-select on fresh super-admin login.
6. Login UX must follow the backend two-step flow:
   - submit email/password to request OTP challenge
   - collect OTP and complete NextAuth credentials sign-in only after verification
7. OTP input UI must use shared `@tbms/ui` primitives (for example `@tbms/ui/components/input-otp`) rather than web-local wrappers.
8. User-account branch scope controls must stay aligned with backend branch guard behavior. If a role is allowed to use global `All Branches` scope, the UI may offer that option; if the backend requires a concrete branch for that role, the dialog must force a branch selection instead.

## 6. Shared Contract Rules

1. Use `@tbms/shared-types` for shared DTOs, enums, auth/session shapes, and response contracts.
2. Use `@tbms/shared-constants` for labels, status mappings, permissions, route policy, and shared constants.
3. Do not create web-local duplicates of shared enums, permission names, or status labels.
4. Do not hand-format enum labels in UI code with string replacement when a shared label map already exists.
5. If a cross-app contract changes, update the shared package first and then adapt the web code.

## 7. Environment Rules

1. Do not read `process.env` directly inside page files, hooks, or components.
2. All frontend env access must go through `apps/web/lib/env.ts`.
3. Production-required values must remain strict there.
4. Development-only fallbacks are acceptable only when already supported by the typed env helper.

## 8. Type Safety Rules

1. Do not introduce `any`.
2. Avoid broad `as` casts in components and hooks.
3. Prefer shared types, narrow helper functions, and explicit return types for reusable hooks and API helpers.
4. If a component boundary needs narrowing, keep that logic small and local.

## 9. Component Reuse and Splitting Rules

1. Prefer reusable UI primitives before creating new bespoke markup.
2. If the same UI pattern appears more than once, extract it.
3. Form labels, field-level validation text, inline metric tiles, and stats grids must be composed from `@tbms/ui/components/*` primitives rather than repeated Tailwind class strings inside domain components.
4. Domain components may pass layout-only `className` overrides, but visual treatment should be controlled by primitive variants first.
5. Keep large pages split into:
   - page shell and route
   - page hook
   - focused presentational components
6. Keep client boundaries as small as practical.
   Do not mark broad trees `use client` when only a smaller interactive unit needs it.

## 10. Performance and Quality Rules

1. Reuse existing fetch and refresh flows rather than introducing duplicated session/network work.
2. Avoid unnecessary rerender pressure from oversized top-level client components.
3. Keep list/table pages composable and filter state explicit.
4. Use the existing audit scripts when changing design system behavior:

```bash
pnpm --filter web run theme:audit
pnpm --filter web run snowui:audit
pnpm --filter web run shadcn:audit
```

## 11. Frontend Verification Rules

For meaningful frontend changes, run the applicable commands from the repo root:

```bash
pnpm run env:verify
pnpm run build:do:web
```

If the change touches theme, shared UI primitives, token usage, or design-system consistency, also run:

```bash
pnpm --filter web run theme:audit
pnpm --filter web run snowui:audit
pnpm --filter web run shadcn:audit
```

If the change affects deployment or auth behavior, update `docs/deployment-guide.md` in the same task.
