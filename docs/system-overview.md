# TBMS System Overview

## Monorepo Layout

1. `apps/web`
   Next.js 14 App Router frontend, NextAuth session handling, browser and server API clients.

2. `apps/api`
   NestJS backend, Prisma ORM, JWT auth, RBAC, scheduler, and business workflows.

3. `packages/shared-types`
   Shared DTOs, API response shapes, and cross-app TypeScript contracts.

4. `packages/shared-constants`
   Shared permissions, labels, workflow presets, and business constants.

## Runtime Topology

Production runs as one DigitalOcean App Platform app named `my-tailor-and-fabrics` with:

1. `web-frontend`
   Public Next.js service built from [Dockerfile.web](/Users/muhammadawais/Documents/My%20Tailors/tbms/Dockerfile.web).

2. `api-backend`
   Public NestJS service built from [Dockerfile.api](/Users/muhammadawais/Documents/My%20Tailors/tbms/Dockerfile.api).

3. `tbms-production-db`
   Managed PostgreSQL in `sgp1`.

4. `tbms-production-valkey`
   Managed Valkey in `sgp1`.

## Routing Model

1. `/`
   Served by the web app.

2. `/backend/*`
   Routed to the Nest API.

3. `/api/auth/*`
   Handled by the Next.js app for NextAuth.

4. `/api/status/*`
   Handled by the Next.js public order-status proxy route.

This split is intentional. The API is exposed on `/backend`, not `/api`, so that NextAuth and the public status flow remain owned by the web app.

## Build and Runtime Entry Points

1. App spec:
   [app.prod.yaml](/Users/muhammadawais/Documents/My%20Tailors/tbms/.do/app.prod.yaml)

2. Web standalone startup:
   [start-do-web.mjs](/Users/muhammadawais/Documents/My%20Tailors/tbms/scripts/start-do-web.mjs)

3. API startup:
   `npm run start:do:api` from [package.json](/Users/muhammadawais/Documents/My%20Tailors/tbms/package.json)

4. Web build:
   `npm run build:do:web`

5. API build:
   `npm run build:do:api`

## Operational Constraints

1. The API currently runs as a single instance because the internal scheduler is still embedded in the API process.

2. App Platform storage is ephemeral. Do not depend on local disk for persistent uploads or generated files.

3. Database credentials, auth secrets, and production URLs are injected by App Platform and must not be hardcoded into the repo.

4. The production-safe Prisma seed flow is intentionally simple:
   - `npm run prisma:seed`
   - `npm run prisma:seed:list`

## Current Domains

1. Primary:
   `mytailorandfabrics.com`

2. Alias:
   `www.mytailorandfabrics.com`

3. Starter fallback:
   `jellyfish-app-n3bi3.ondigitalocean.app`
