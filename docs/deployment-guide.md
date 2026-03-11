# DigitalOcean App Platform Deployment Guide

This document is the current production runbook for My Tailor & Fabrics on DigitalOcean App Platform.

## Live Footprint

Current production topology:

1. App Platform app:
   `my-tailor-and-fabrics`

2. App Platform region:
   `sgp`

3. Services:
   - `web-frontend`
   - `api-backend`

4. Managed databases:
   - PostgreSQL: `tbms-production-db` in `sgp1`
   - Valkey: `tbms-production-valkey` in `sgp1`

5. Domains:
   - primary: `mytailorandfabrics.com`
   - alias: `www.mytailorandfabrics.com`
   - starter: `jellyfish-app-n3bi3.ondigitalocean.app`

## Deployment Model

My Tailor & Fabrics is deployed as one App Platform app with separate service containers.

1. Web service:
   built from [Dockerfile.web](/Users/muhammadawais/Documents/My%20Tailors/tbms/Dockerfile.web)

2. API service:
   built from [Dockerfile.api](/Users/muhammadawais/Documents/My%20Tailors/tbms/Dockerfile.api)

3. Shared workspace build context:
   both services use repo-root build context so `apps/*` and `packages/*` are available during Docker builds

4. Public routing:
   - web owns `/`
   - API owns `/backend`
   - NextAuth remains on `/api/auth/*`
   - public order status remains on `/api/status/*` and uses `POST /api/status/:token` with JSON body `{ "pin": "1234" }`

## Files That Define Production

1. App spec:
   [app.prod.yaml](/Users/muhammadawais/Documents/My%20Tailors/tbms/.do/app.prod.yaml)

2. Root runtime and build commands:
   [package.json](/Users/muhammadawais/Documents/My%20Tailors/tbms/package.json)

3. Web bootstrap:
   [start-do-web.mjs](/Users/muhammadawais/Documents/My%20Tailors/tbms/scripts/start-do-web.mjs)

4. Web health endpoint:
   [route.ts](/Users/muhammadawais/Documents/My%20Tailors/tbms/apps/web/app/healthz/route.ts)

5. API health endpoint:
   [app.controller.ts](/Users/muhammadawais/Documents/My%20Tailors/tbms/apps/api/src/app.controller.ts)

6. API seed runner:
   [seed.js](/Users/muhammadawais/Documents/My%20Tailors/tbms/apps/api/prisma/seed.js)

## Current Commands

These are the exact commands that define the current deployment workflow.

Repo-root verification commands:

```bash
npm ci
npm run env:setup
npm run env:verify
npm run build:do:web
npm run build:do:api
docker build --build-arg NEXT_PUBLIC_API_URL=/backend -f Dockerfile.web .
docker build -f Dockerfile.api .
```

Repo-root runtime commands used by App Platform:

```bash
npm run start:do:web
npm run start:do:api
```

Resolved runtime entrypoints:

1. Web:
   `npm run start:do:web` -> `node ./scripts/start-do-web.mjs`

2. API:
   `npm run start:do:api` -> `node apps/api/dist/main.js`

Do not change the API entrypoint to `apps/api/dist/src/main.js`. The current Nest build outputs [main.js](/Users/muhammadawais/Documents/My%20Tailors/tbms/apps/api/dist/main.js) directly under `dist`.

## Local Preflight

Run these commands from the repo root before changing production:

```bash
npm ci
npm run env:setup
npm run env:verify
npm run build:do:api
npm run build:do:web
docker build -f Dockerfile.api .
docker build --build-arg NEXT_PUBLIC_API_URL=/backend -f Dockerfile.web .
```

What these checks cover:

1. env files exist and match the contract
2. shared packages build cleanly
3. Prisma client generation works
4. both App Platform Docker images build with the repo-root context

## Create or Update the App

DigitalOcean is configured to deploy on push from `main`, but the app spec remains the source of truth.

Create the app from scratch:

```bash
doctl auth init
doctl apps create --spec .do/app.prod.yaml
```

Update an existing app:

```bash
doctl apps update <app-id> --spec .do/app.prod.yaml
```

Current repo behavior:

1. pushes to `main` trigger deployment automatically
2. spec changes should still be committed to [app.prod.yaml](/Users/muhammadawais/Documents/My%20Tailors/tbms/.do/app.prod.yaml)
3. service names in the live app must remain `web-frontend` and `api-backend` to match internal references such as `${api-backend.PRIVATE_URL}`

## Required Environment and Secrets

The spec contains the required variable names. Before initial create or any environment reset, replace all placeholder secret values.

Web service:

1. `NODE_ENV=production`
2. `PORT=8080`
3. `NEXT_PUBLIC_API_URL=/backend`
4. `INTERNAL_API_URL=${api-backend.PRIVATE_URL}`
5. `NEXTAUTH_URL=${APP_URL}`
6. `NEXTAUTH_SECRET`

API service:

1. `NODE_ENV=production`
2. `PORT=8080`
3. `TRUST_PROXY=1`
4. `TZ=Asia/Karachi`
5. `FRONTEND_URL=${APP_URL}`
6. `DATABASE_URL=${tbms-production-db.DATABASE_URL}`
7. `DIRECT_URL=${tbms-production-db.DATABASE_URL}`
8. `REDIS_URL=${tbms-production-valkey.DATABASE_URL}`
9. `JWT_SECRET`
10. `JWT_REFRESH_SECRET`
11. `JWT_EXPIRES_IN=15m`
12. `JWT_REFRESH_EXPIRES_IN=7d`
13. `JWT_REFRESH_ROTATION_GRACE_SECONDS=30`
14. `STATUS_PIN_PEPPER`
15. `ENABLE_INTERNAL_SCHEDULER=true`
16. `ENABLE_PUBLIC_MAIL_ENDPOINTS=false`
17. Google mail secrets only if Gmail integration is in use

## Current DigitalOcean Console Operations

Open the `api-backend` console and run from `/app`.

Check migration state first:

```bash
npm run prisma:migrate:status
```

Deploy Prisma migrations:

```bash
npm run prisma:migrate:deploy
```

List available seeds:

```bash
npm run prisma:seed:list
```

Run the admin seed in production with an explicit password:

```bash
SEED_ADMIN_PASSWORD='replace-with-a-secure-password' \
npm run prisma:seed
```

Override email and display name if needed:

```bash
SEED_ADMIN_EMAIL=admin@mytailorandfabrics.com \
SEED_ADMIN_PASSWORD='replace-with-a-secure-password' \
SEED_ADMIN_NAME="Main Admin" \
npm run prisma:seed
```

Important:

1. run Prisma commands in `api-backend`, not `web-frontend`
2. run them from `/app`, not `/app/apps`
3. `npm run prisma:seed` now defaults to the `admin` seed and does not depend on `ts-node`
4. in production, `SEED_ADMIN_PASSWORD` is required and there is no insecure fallback password
5. if TablePlus connects successfully but shows an empty `defaultdb.public`, run `npm run prisma:migrate:deploy` before assuming the database is broken

## Domain and DNS

Current target domain rollout:

1. verify starter domain first
2. keep `.com` as canonical
3. add `.pk` later only when you intentionally switch or redirect it

Squarespace DNS records for the current `.com` setup:

1. `@` -> `ALIAS` -> `jellyfish-app-n3bi3.ondigitalocean.app`
2. `www` -> `CNAME` -> `jellyfish-app-n3bi3.ondigitalocean.app`

Do not change:

1. Google Workspace `MX`
2. SPF `TXT`
3. DKIM `TXT`
4. DMARC `TXT`

## Smoke Test Checklist

After every production deployment:

1. `/healthz` returns `200`
2. `/backend/healthz` returns `200`
3. `/login` renders correctly
4. login succeeds
5. `/api/auth/*` still works
6. authenticated browser traffic goes to `/backend/*`
7. `/api/status/*` still works
8. public status PIN is submitted in request body (not URL query string)
9. API starts with PostgreSQL and Valkey connected
10. both App Platform components become `HEALTHY`

## Operational Rules

1. Keep `api-backend` at one instance until the scheduler is extracted into dedicated jobs.
2. Do not rely on local filesystem persistence in App Platform.
3. Use managed database backups and DigitalOcean database tooling for backups. Repo-local backup scripts are intentionally not part of the supported production workflow anymore.
4. If a future release includes Prisma migrations, run `npm run prisma:migrate:deploy` as part of the release checklist.
5. If uploads are introduced later, store them in an external object store such as Spaces.

## Troubleshooting

If the API console command fails:

1. confirm you are in the `api-backend` console
2. confirm your current directory is `/app`
3. confirm the deployment has the latest commit
4. run `npm run prisma:seed:list` first to verify the seed entrypoint is available

If the API container exits with `Cannot find module '/app/apps/api/dist/src/main.js'`:

1. confirm [package.json](/Users/muhammadawais/Documents/My%20Tailors/tbms/package.json) still defines `start:do:api` as `node apps/api/dist/main.js`
2. confirm the latest deployment includes that commit
3. rebuild and redeploy from `main`

If the web looks unstyled:

1. confirm the latest deployment is active
2. confirm `/_next/static/*` assets return `200`
3. confirm the active image was built from [Dockerfile.web](/Users/muhammadawais/Documents/My%20Tailors/tbms/Dockerfile.web)

If auth breaks on a custom domain:

1. confirm `NEXTAUTH_URL` matches the canonical live domain
2. confirm the domain is active in App Platform
3. confirm DNS points to `jellyfish-app-n3bi3.ondigitalocean.app`

If TablePlus connects but shows no tables:

1. confirm the selected database is `defaultdb`
2. confirm you are viewing schema `public`
3. run `npm run prisma:migrate:status` in the `api-backend` console
4. run `npm run prisma:migrate:deploy` if migrations are pending
5. refresh or reconnect TablePlus after migrations complete

## References

1. [DigitalOcean: Deploy from Monorepos](https://docs.digitalocean.com/products/app-platform/how-to/deploy-from-monorepo/)
2. [DigitalOcean: App Spec Reference](https://docs.digitalocean.com/products/app-platform/reference/app-spec/)
3. [DigitalOcean: Use Environment Variables](https://docs.digitalocean.com/products/app-platform/how-to/use-environment-variables/)
4. [DigitalOcean: Dockerfile Build Reference](https://docs.digitalocean.com/products/app-platform/reference/dockerfile/)
5. [DigitalOcean: Manage Databases](https://docs.digitalocean.com/products/app-platform/how-to/manage-databases/)
6. [DigitalOcean: Set Up Internal Routing](https://docs.digitalocean.com/products/app-platform/how-to/manage-internal-routing/)
7. [DigitalOcean: Manage Domains](https://docs.digitalocean.com/products/app-platform/how-to/manage-domains/)
8. [DigitalOcean: Manage Health Checks](https://docs.digitalocean.com/products/app-platform/how-to/manage-health-checks/)
