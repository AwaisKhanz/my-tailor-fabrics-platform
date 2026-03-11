# Change Management Rules

These rules apply to every user-requested change in this repository.

## 1. Rule Sync Is Mandatory

1. If a requested change alters how the project is built, structured, deployed, or maintained, update the relevant rule file in `docs/rules/` in the same task.
2. Do not leave the rules stale after changing the real system.
3. If a change introduces a new standard, document it where future work will find it.

## 2. Documentation Sync Rules

Update the relevant operational docs when the underlying behavior changes:

1. `docs/deployment-guide.md`
   For deployment commands, runtime commands, infra topology, domains, build behavior, migrations, seeds, or recovery procedures.

2. `docs/system-overview.md`
   For architecture, routing model, runtime topology, or service boundaries.

3. `docs/environment-setup.md`
   For env keys, env loading behavior, or env verification workflow.

4. `README.md` and `docs/README.md`
   When the canonical documentation map changes.

## 3. Schema and Migration Change Rules

1. Prisma schema changes require a migration.
2. Review relation impact and data migration impact before applying schema changes.
3. If a migration changes production operations, update the deployment guide with the exact run commands.
4. If a seed or migration workflow changes, update both docs and the seed/migration commands that operators use.

## 4. Frontend and Design Change Rules

1. If the design system changes, update the frontend rules and any relevant audit expectations.
2. If the shadcn foundation (`packages/ui`, `apps/web/components.json`, or theme engine) changes, update the corresponding audit scripts in `apps/web/scripts/`.
3. If primitive ownership shifts, keep imports aligned with the canonical source (`@tbms/ui/components/*`) and remove stale web-local wrappers entirely.
4. Do not keep or reintroduce `apps/web/components/ui` files after shared ownership is established.
5. Keep shared theme globals close to shadcn defaults; do not reintroduce legacy `--snow-*` token systems.
6. If route ownership, auth flow, or API base URL behavior changes, update both frontend rules and deployment docs.
7. If a reusable UI pattern is promoted to a standard, document it.

## 5. Shared Package Change Rules

1. Shared contract changes require synchronized updates across both apps.
2. Rebuild shared packages and affected app builds in the same task.
3. If a shared contract change affects permissions, roles, labels, or auth, update the corresponding rule docs.

## 6. Cleanup Rules

1. Remove stale code, scripts, docs, and generated artifacts when they stop representing the live system.
2. Before deleting a file, search the repo to confirm it is not in active use.
3. Prefer a smaller maintained surface over a large archive of stale notes and helper scripts.

## 7. Verification Rules

Run the smallest meaningful set of verification commands for the change, but do not skip the relevant production-facing checks.

Common repo-level checks:

```bash
pnpm run env:verify
```

Frontend-oriented changes:

```bash
pnpm run build:do:web
pnpm --filter web run shadcn:audit
```

Backend-oriented changes:

```bash
pnpm run build:do:api
pnpm run prisma:seed:list
```

Shared package changes:

```bash
pnpm --filter @tbms/shared-types build
pnpm --filter @tbms/shared-constants build
```

## 8. Operator-Facing Command Rule

If a requested change alters the commands operators run in:

1. DigitalOcean console
2. local preflight
3. deployment updates
4. migration and seed flow

then the exact command sequence must be written into `docs/deployment-guide.md` in the same change.
