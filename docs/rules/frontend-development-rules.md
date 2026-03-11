# Frontend Development Rules

These rules apply to `apps/web`, UI behavior, route structure, hooks, theme usage, client/server data access boundaries, and frontend operational behavior.

## 1. Current Frontend Stack

1. Framework: Next.js App Router
2. Auth/session layer: NextAuth with backend token/session integration
3. UI primitives: local `components/ui` plus shadcn-style conventions
4. Styling: Tailwind CSS with semantic tokens and global theme variables
5. Shared contracts: `@tbms/shared-types`, `@tbms/shared-constants`
6. HTTP client: centralized axios client in `apps/web/lib/api.ts`
7. Data cache/query layer: TanStack Query with centralized query keys in `apps/web/lib/query-keys.ts`

## 2. Route and File Structure Rules

1. Keep route files in `apps/web/app` thin.
2. Route files should focus on composition, auth gating, and page assembly.
3. Stateful page logic, fetch orchestration, and derived UI state belong in hooks under `apps/web/hooks`.
4. Large route-specific UI should be broken into focused components under `apps/web/components/<domain>`.
5. Reusable primitives belong in `apps/web/components/ui`, not inside route-local folders.

## 3. Design System and Styling Rules

1. Use the global theme and semantic token system defined in:
   - `apps/web/app/globals.css`
   - `apps/web/tailwind.config.ts`
   - `apps/web/lib/ui-styles.ts`
2. Do not hardcode random colors, gradients, spacing values, or radii when an existing token or semantic class exists.
3. Prefer shared primitives such as:
   - `PageShell`
   - `PageSection`
   - `PageHeader`
   - `FieldLabel`, `FieldError`, `FieldHint`, `FieldStack`
   - `FormGrid`, `FormStack`, `DialogFormActions`
   - `StatsGrid`, `StatCard`, `InteractiveTile`, `InfoTile`
   - shared buttons, cards, dialogs, tables, and form primitives
4. Theme behavior must go through the centralized theme flow:
   - `apps/web/app/layout.tsx`
   - `apps/web/components/ThemeProvider.tsx`
   - `apps/web/lib/theme.ts`
5. Do not create a second theme state system or route-local theme persistence.

## 4. Data Access Rules

1. Frontend code should use the centralized API client in `apps/web/lib/api.ts`.
2. Domain-specific request helpers belong in `apps/web/lib/api/<domain>.ts`.
3. Server-state fetching/caching must use TanStack Query hooks (queries + mutations) instead of ad hoc `useEffect` fetch orchestration for page data.
4. Query keys must be defined through `apps/web/lib/query-keys.ts` (or local key-factory constants when a domain is intentionally private to one hook).
5. Mutation side effects must invalidate affected query keys explicitly.
6. Components should not create their own axios instances.
7. Do not bypass the centralized auth refresh, branch header, and 401 recovery flow.
8. If a new backend endpoint is added for frontend use, add or update the corresponding typed client helper.

## 5. Auth and Authorization Rules

1. Frontend authorization must use the existing shared helpers and wrappers:
   - `apps/web/lib/authz.ts`
   - `apps/web/hooks/use-authz.ts`
   - `apps/web/components/auth/with-role-guard.tsx`
   - `apps/web/components/auth/can.tsx`
2. Do not duplicate permission matrices or role logic in page files.
3. Route gating and component gating must stay aligned with shared RBAC contracts.
4. When frontend code references a permission, use the shared `PERMISSION` export from `@tbms/shared-constants` instead of repeating a raw permission string.

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
3. Form labels, field-level validation text, inline metric tiles, and stats grids must be composed from `apps/web/components/ui` primitives rather than repeated Tailwind class strings inside domain components.
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
npm run theme:audit -w web
npm run snowui:audit -w web
```

## 11. Frontend Verification Rules

For meaningful frontend changes, run the applicable commands from the repo root:

```bash
npm run env:verify
npm run build:do:web
```

If the change touches theme, shared UI primitives, token usage, or design-system consistency, also run:

```bash
npm run theme:audit -w web
npm run snowui:audit -w web
```

If the change affects deployment or auth behavior, update `docs/deployment-guide.md` in the same task.
