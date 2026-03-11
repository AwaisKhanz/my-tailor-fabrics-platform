# My Tailor & Fabrics API

NestJS API for My Tailor & Fabrics.

## Common Commands

From the repo root:

```bash
pnpm run env:setup
pnpm run env:verify
pnpm run prisma:generate
pnpm --filter api build
pnpm --filter api start:dev
```

Production-oriented commands:

```bash
pnpm run prisma:migrate:deploy
pnpm run prisma:seed
pnpm run prisma:seed:list
```

## Key Paths

1. Source:
   `apps/api/src`

2. Prisma schema:
   `apps/api/prisma/schema.prisma`

3. Seed runner:
   `apps/api/prisma/seed.js`

4. Typed env helper:
   `apps/api/src/common/env.ts`

5. Main deployment doc:
   [Deployment Guide](/Users/muhammadawais/Documents/My%20Tailors/tbms/docs/deployment-guide.md)
