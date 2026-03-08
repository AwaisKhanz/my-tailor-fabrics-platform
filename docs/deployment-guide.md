# DigitalOcean App Platform Deployment Guide

This guide describes the production deployment path for the TBMS monorepo on DigitalOcean App Platform.

Current DigitalOcean account alignment:

1. Existing App Platform app name: `my-tailor-and-fabrics`
2. App Platform region: `sgp`
3. Existing managed PostgreSQL cluster: `tbms-production-db` in `sgp1`
4. Planned managed Valkey cluster: `tbms-production-valkey` in `sgp1`

## Architecture

1. One App Platform app.
2. One `web` service built from [Dockerfile.web](/Users/muhammadawais/Documents/My%20Tailors/tbms/Dockerfile.web).
3. One `api` service built from [Dockerfile.api](/Users/muhammadawais/Documents/My%20Tailors/tbms/Dockerfile.api).
4. One managed PostgreSQL cluster.
5. One managed Valkey cluster that provides the API's `REDIS_URL`.

Key routing decision:

1. The web app owns `/`.
2. The Nest API is exposed at `/backend`.
3. The Next app keeps `/api/auth/*` and `/api/status/*`.
4. Do not route the API to `/api`, or NextAuth and the public status route will break.

## Repo Files That Drive Deployment

1. App Platform spec: [app.prod.yaml](/Users/muhammadawais/Documents/My%20Tailors/tbms/.do/app.prod.yaml)
2. Web container: [Dockerfile.web](/Users/muhammadawais/Documents/My%20Tailors/tbms/Dockerfile.web)
3. API container: [Dockerfile.api](/Users/muhammadawais/Documents/My%20Tailors/tbms/Dockerfile.api)
4. Root deployment scripts: [package.json](/Users/muhammadawais/Documents/My%20Tailors/tbms/package.json)
5. Web health endpoint: [route.ts](/Users/muhammadawais/Documents/My%20Tailors/tbms/apps/web/app/healthz/route.ts)
6. API health endpoint: [app.controller.ts](/Users/muhammadawais/Documents/My%20Tailors/tbms/apps/api/src/app.controller.ts)

## Why The App Uses Repo-Root Build Context

This repo is an npm workspace monorepo:

1. `apps/web`
2. `apps/api`
3. `packages/shared-types`
4. `packages/shared-constants`

DigitalOcean App Platform monorepo docs state that when a component uses a subdirectory as `source_dir`, files outside that directory are not available at runtime. Because both apps rely on workspace packages outside their own directories, the deployment spec uses `/` as the build context and separate Dockerfiles to select the correct app.

## Local Preflight

Run these commands from the repo root:

```bash
npm ci
npm run env:setup
npm run env:verify
npm run build:do:api
npm run build:do:web
docker build -f Dockerfile.api .
docker build --build-arg NEXT_PUBLIC_API_URL=/backend -f Dockerfile.web .
```

Notes:

1. The web build no longer depends on Google Fonts at build time. It now uses the local Geist variable font files already present in the repo.
2. The API scheduler can now be turned on or off with `ENABLE_INTERNAL_SCHEDULER`.
3. The API stays at one instance in v1 because cron is still embedded in the API process.

## App Platform Create / Update

Install and authenticate `doctl`, then use the spec:

```bash
doctl auth init
doctl apps create --spec .do/app.prod.yaml
```

For later updates:

```bash
doctl apps update <app-id> --spec .do/app.prod.yaml
```

## App Platform Variables

The spec already includes the required variable names and placeholders. Before the first production deploy, replace all `REPLACE_*` placeholder values in [app.prod.yaml](/Users/muhammadawais/Documents/My%20Tailors/tbms/.do/app.prod.yaml).

Important runtime values:

1. Web:
   `NEXT_PUBLIC_API_URL=/backend`
   `INTERNAL_API_URL=${api-backend.PRIVATE_URL}`
   `NEXTAUTH_URL=${APP_URL}`
2. API:
   `FRONTEND_URL=${APP_URL}`
   `DATABASE_URL=${tbms-production-db.DATABASE_URL}`
   `DIRECT_URL=${tbms-production-db.DATABASE_URL}`
   `REDIS_URL=${tbms-production-valkey.DATABASE_URL}`
   `ENABLE_INTERNAL_SCHEDULER=true`

Important secret values you must set:

1. `NEXTAUTH_SECRET`
2. `JWT_SECRET`
3. `JWT_REFRESH_SECRET`
4. `STATUS_PIN_PEPPER`
5. Google mail secrets if Gmail integration will remain enabled in production

## DigitalOcean Console Steps After App Creation

Complete these in the App Platform UI after the first app is created from the spec:

1. Keep the App Platform app in `sgp` and keep PostgreSQL, Valkey, and VPC in `sgp1` to match the current account footprint.
2. Enable App Platform VPC and keep the managed data services in the same VPC.
3. Configure HTTP health checks:
   - web: `/healthz`
   - api: `/healthz`
4. Verify the starter `ondigitalocean.app` URL before attaching or changing any custom domain.

## Domain Rollout

The intended rollout is:

1. Deploy and verify on the starter `ondigitalocean.app` domain.
2. Add `mytailorandfabrics.com` as the primary custom domain.
3. Redirect the starter domain to `.com`.
4. Later, once `.pk` is ready, add `mytailorandfabrics.pk` and redirect it to `.com`.

Do not make `.pk` canonical in this phase. The current production plan keeps `.com` canonical first.

## Smoke Tests

After the first deployment:

1. Open `/` and confirm the web app renders.
2. Open `/healthz` and confirm the web health response is `200`.
3. Open `/backend/healthz` and confirm the API health response is `200`.
4. Log in and confirm the NextAuth flow still works under `/api/auth/*`.
5. Confirm authenticated browser API calls hit `/backend/*`.
6. Confirm the public order status page still works under `/api/status/*`.
7. Confirm the API boots with PostgreSQL and Valkey connected.
8. Confirm scheduled jobs execute only once per interval with exactly one API instance running.

## Operational Notes

1. Keep the API at one instance until cron is moved out of the API process into scheduled jobs.
2. App Platform storage is ephemeral. Do not store uploads on local disk.
3. This deployment path currently omits the pre-deploy migration job because the App Platform job was failing before service rollout. There were no schema changes in this cutover, so skipping it is safe for this release. Run `npm run migrate:deploy:api` manually from a trusted environment when a future release includes Prisma migrations.
4. If first-party file uploads are added later, use Spaces or another external object store.
5. CI now checks the env contract and builds both Docker images via [ci.yml](/Users/muhammadawais/Documents/My%20Tailors/tbms/.github/workflows/ci.yml).
6. The production-safe seed command is `npm run prisma:seed`. It defaults to the `admin` seed and works inside the App Platform `api-backend` console because Prisma now runs a plain Node entrypoint instead of `ts-node`.
7. To inspect or target seeds later, use:
   - `npm run prisma:seed:list`
   - `SEED_TARGET=admin npm run prisma:seed`
   - optional overrides: `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_NAME`

## References

1. [DigitalOcean: Deploy from Monorepos](https://docs.digitalocean.com/products/app-platform/how-to/deploy-from-monorepo/)
2. [DigitalOcean: App Spec Reference](https://docs.digitalocean.com/products/app-platform/reference/app-spec/)
3. [DigitalOcean: Use Environment Variables](https://docs.digitalocean.com/products/app-platform/how-to/use-environment-variables/)
4. [DigitalOcean: Dockerfile Build Reference](https://docs.digitalocean.com/products/app-platform/reference/dockerfile/)
5. [DigitalOcean: Dockerfile build-time env limitation](https://docs.digitalocean.com/support/why-cant-i-access-my-environment-variables-at-build-time-when-building-from-a-dockerfile-on-app-platform/)
6. [DigitalOcean: Manage Cron Jobs and Deployment Jobs](https://docs.digitalocean.com/products/app-platform/how-to/manage-jobs/)
7. [DigitalOcean: Manage Databases](https://docs.digitalocean.com/products/app-platform/how-to/manage-databases/)
8. [DigitalOcean: Set Up Internal Routing](https://docs.digitalocean.com/products/app-platform/how-to/manage-internal-routing/)
9. [DigitalOcean: Manage Domains](https://docs.digitalocean.com/products/app-platform/how-to/manage-domains/)
10. [DigitalOcean: Manage Health Checks](https://docs.digitalocean.com/products/app-platform/how-to/manage-health-checks/)
