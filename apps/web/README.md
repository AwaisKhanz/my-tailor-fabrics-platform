# TBMS Web

Next.js 14 frontend for My Tailor & Fabrics.

## Common Commands

From the repo root:

```bash
npm run env:setup
npm run env:verify
npm run build -w web
npm run dev -w web
```

Optional frontend audits:

```bash
npm run theme:audit -w web
npm run snowui:audit -w web
```

## Key Paths

1. App Router pages:
   `apps/web/app`

2. Shared UI primitives:
   `apps/web/components/ui`

3. Typed env helper:
   `apps/web/lib/env.ts`

4. Main deployment doc:
   [Deployment Guide](/Users/muhammadawais/Documents/My%20Tailors/tbms/docs/deployment-guide.md)
