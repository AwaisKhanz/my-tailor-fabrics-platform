# Shared Packages Rules

These rules apply to `packages/shared-types` and `packages/shared-constants`.

## 1. Package Responsibilities

1. `packages/shared-types`
   Holds shared DTOs, enums, payload types, auth/session contracts, and cross-app data shapes.

2. `packages/shared-constants`
   Holds shared permissions, labels, route policy, reusable business constants, formatting helpers, and workflow mappings.

3. Do not place app-specific side effects, environment logic, or framework bootstrapping inside shared packages.

## 2. Cross-App Contract Rules

1. If both apps consume a type or constant, prefer placing it in a shared package.
2. Do not duplicate role names, permission strings, enum values, or shared status labels inside app-local code.
3. If a change is not truly cross-app, keep it in the owning app instead of forcing it into shared packages.
4. Permission references used by app code should come from the exported `PERMISSION` map in `@tbms/shared-constants`, not from repeated raw string literals.
5. Label and enum display in app code should use shared exported maps and enums instead of hand-built string formatting.

## 3. File Structure Rules

1. Keep source files under `src/`.
2. Export package surface through `src/index.ts`.
3. Keep package metadata and exports aligned with the built outputs in `dist/`.
4. If a new module is added, update the index exports intentionally.

## 4. Build Output Rules

1. These shared packages currently export from tracked `dist` outputs.
2. Any source change must keep `dist` in sync.
3. Do not change package entrypoints without updating both package metadata and consuming apps.
4. Do not remove `dist` outputs unless the workspace strategy is intentionally redesigned.

## 5. Compatibility Rules

1. Shared contract changes are application-wide changes.
2. When changing shared contracts, review both:
   - `apps/api`
   - `apps/web`
3. Contract changes that affect RBAC, auth, or route policy must also update the relevant docs and operational guidance.
4. If a permission is added, removed, or renamed, update the shared type union, the shared constant exports, the role matrix, and every app consumer in the same task.

## 6. Type Safety Rules

1. Do not introduce `any` into shared packages.
2. Prefer precise unions, literal arrays, discriminated types, and exported helper guards.
3. Shared packages should improve strictness, not weaken it.

## 7. Shared Package Verification Rules

After changing shared packages, run:

```bash
npm run build -w @tbms/shared-types
npm run build -w @tbms/shared-constants
```

Then run the affected app builds:

```bash
npm run build:do:web
npm run build:do:api
```

If the change affects deployment, routing, or auth/session behavior, update the relevant docs in the same task.
