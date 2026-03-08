# TBMS API

NestJS API for My Tailor & Fabrics.

## Common Commands

From the repo root:

```bash
npm run env:setup
npm run env:verify
npm run prisma:generate
npm run build -w api
npm run start:dev -w api
```

Production-oriented commands:

```bash
npm run prisma:migrate:deploy
npm run prisma:seed
npm run prisma:seed:list
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
