# Repository Instructions

This repository uses a written ruleset under `docs/rules/`. Codex and other coding agents must follow those documents when working in this repo.

## Required Rule Files

Read the relevant files before making substantial changes:

1. `docs/rules/backend-development-rules.md`
   Required for `apps/api`, Prisma schema, migrations, seeds, auth, guards, scheduler, or backend business logic.

2. `docs/rules/frontend-development-rules.md`
   Required for `apps/web`, UI, styling, routes, hooks, auth/session UX, or frontend API usage.

3. `docs/rules/shared-packages-rules.md`
   Required for `packages/shared-types`, `packages/shared-constants`, or any cross-app contract change.

4. `docs/rules/change-management-rules.md`
   Required for every change. This file defines update discipline, verification expectations, and documentation sync rules.

## Hard Requirements

1. If a user-requested change alters conventions, architecture, commands, routing, env contracts, shared contracts, deployment behavior, or operational workflow, update the relevant rule files in `docs/rules/` in the same change.

2. If a user-requested change alters deployment behavior, also update:
   - `docs/deployment-guide.md`
   - `docs/system-overview.md`
   - `docs/environment-setup.md`
   when applicable.

3. Prisma schema changes must ship with a proper migration and a relation/data-impact review. Do not commit schema-only production data model changes.

4. Shared package changes must keep `src`, package exports, and tracked `dist` outputs in sync.

5. Do not introduce `any`. Avoid `as` casts unless a framework boundary makes them unavoidable, and keep those casts narrow and local.

6. Do not bypass typed env helpers:
   - `apps/api/src/common/env.ts`
   - `apps/web/lib/env.ts`

7. Keep user-facing branding as `My Tailor & Fabrics`. The internal `tbms` slug remains technical namespace only.

## Source of Truth

1. Deployment source of truth:
   `docs/deployment-guide.md` and `.do/app.prod.yaml`

2. Engineering rules source of truth:
   `docs/rules/`

3. High-level repo overview:
   `README.md` and `docs/system-overview.md`
