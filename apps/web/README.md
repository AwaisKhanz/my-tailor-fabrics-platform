# My Tailor & Fabrics Web

Next.js 14 frontend for My Tailor & Fabrics.

## Common Commands

From the repo root:

```bash
pnpm run env:setup
pnpm run env:verify
pnpm --filter web build
pnpm --filter web dev
```

Optional frontend audits:

```bash
pnpm --filter web theme:audit
pnpm --filter web snowui:audit
pnpm --filter web shadcn:audit
```

## Key Paths

1. App Router pages:
   `apps/web/app`

2. Canonical shadcn primitives:
   `packages/ui/src/components`

3. Canonical token stylesheet imported by the app layout:
   `packages/ui/src/styles/globals.css`

4. Shared UI composites (page shells, form/table layouts, etc.):
   `packages/ui/src/components`

5. Typed env helper:
   `apps/web/lib/env.ts`

6. Main deployment doc:
   [Deployment Guide](/Users/muhammadawais/Documents/My%20Tailors/tbms/docs/deployment-guide.md)
