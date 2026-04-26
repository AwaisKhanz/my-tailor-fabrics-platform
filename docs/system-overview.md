# My Tailor & Fabrics System Overview

## Monorepo Layout

1. `apps/web`
   Next.js 14 App Router frontend, NextAuth session handling, browser and server API clients.

2. `apps/api`
   NestJS backend, Prisma ORM, in-process cache, JWT auth, RBAC, scheduler, and business workflows.

3. `packages/shared-types`
   Shared DTOs, API response shapes, and cross-app TypeScript contracts.

4. `packages/shared-constants`
   Shared permissions, labels, workflow presets, and business constants.

5. `packages/ui`
   Shared shadcn v4 (`base-nova`) primitives and theme tokens for the web app.

## Runtime Topology

Production runs as one DigitalOcean App Platform app named `my-tailor-and-fabrics` with:

1. `web-frontend`
   Public Next.js service built from [Dockerfile.web](/Users/muhammadawais/Documents/My%20Tailors/tbms/Dockerfile.web).

2. `api-backend`
   Public NestJS service built from [Dockerfile.api](/Users/muhammadawais/Documents/My%20Tailors/tbms/Dockerfile.api).

3. `tbms-production-db`
   Managed PostgreSQL in `sgp1`.

## Routing Model

1. `/`
   Served by the web app. On the apex domain it resolves to the public marketing homepage; on the portal hostname it resolves to the authenticated portal.

2. `/backend/*`
   Routed to the Nest API.

3. `/api/auth/*`
   Handled by the Next.js app for NextAuth.

4. `/api/status/*`
   Handled by the Next.js public order-status proxy route.

5. Hostname split inside the web app:
   - `mytailorandfabrics.com` and `www.mytailorandfabrics.com` rewrite to the public marketing route tree under `apps/web/app/site`
   - `portal.mytailorandfabrics.com` keeps the existing dashboard/auth route tree
   - `/site` remains an internal implementation path; public users should only see apex-domain marketing URLs and portal users should only see portal-domain auth/dashboard URLs
   - local development keeps the public site at `/` and exposes the portal under `/portal`

Public status PIN submission is body-based:
`POST /api/status/:token` with `{ "pin": "1234" }`.

This split is intentional. The API is exposed on `/backend`, not `/api`, so that NextAuth and the public status flow remain owned by the web app.

## Authentication Flow

1. Web login is orchestrated by NextAuth credentials provider, backed by the API.
2. Password login is two-step:
   - `POST /backend/auth/login/request-otp` validates credentials and sends a one-time code by email
   - `POST /backend/auth/login` verifies the OTP challenge and returns access/refresh tokens
3. Refresh token remains cookie-bound (`/auth/refresh`), while access token remains session-scoped in NextAuth JWT/session callbacks.

## Build and Runtime Entry Points

Workspace package manager:

1. `pnpm` with [pnpm-workspace.yaml](/Users/muhammadawais/Documents/My%20Tailors/tbms/pnpm-workspace.yaml)

1. App spec:
   [app.prod.yaml](/Users/muhammadawais/Documents/My%20Tailors/tbms/.do/app.prod.yaml)

2. Web standalone startup:
   [start-do-web.mjs](/Users/muhammadawais/Documents/My%20Tailors/tbms/scripts/start-do-web.mjs)

3. API startup:
   `pnpm run start:do:api` from [package.json](/Users/muhammadawais/Documents/My%20Tailors/tbms/package.json)

4. Web build:
   `pnpm run build:do:web`

5. API build:
   `pnpm run build:do:api`

## Operational Constraints

1. The API currently runs as a single instance because the internal scheduler is still embedded in the API process.

2. App Platform storage is ephemeral. Do not depend on local disk for persistent uploads or generated files.

3. Database credentials, auth secrets, and production URLs are injected by App Platform and must not be hardcoded into the repo.

4. The production-safe Prisma seed flow is intentionally simple:
   - `pnpm run prisma:seed`
   - `pnpm run prisma:seed:list`

## Current Domains

1. Primary:
   `mytailorandfabrics.com`

2. Alias:
   `www.mytailorandfabrics.com`

3. Portal:
   `portal.mytailorandfabrics.com`

4. Starter fallback:
   `jellyfish-app-n3bi3.ondigitalocean.app`

## Current Operational Workflow

1. Order capture is piece-first.
   Each visible order item in the web flow represents one physical piece, allowing different designs, notes, and fabric sources within the same order.

2. Shop fabric pricing is a branch-scoped operational domain.
   The API and web app now manage a branch fabric catalog and piece-level fabric price snapshots for order create and edit flows.

3. Order item pricing is snapshot-based.
   Tailoring, design, addons, and shop-fabric pricing are stored on the order item so historical detail pages and receipts remain stable after catalog changes.

4. Production steps are managed in sequence per piece.
   Staff can plan assignments ahead of time, but a later step only moves into active work after earlier steps for that same piece are completed or cancelled.

5. Order item status is always workflow-derived.
   Production-task generation is a fixed platform rule for piece-first orders. A piece stays `Pending` until work starts, becomes `In Progress` once any production step starts or finishes, becomes `Completed` when all remaining active steps are done, and becomes `Cancelled` only when every remaining step is cancelled.

6. Customer value metrics are split intentionally.
   Customer booked value is derived from non-cancelled order totals, while collected cash is tracked separately from recorded order payments.

7. Dashboard receivables use live customer balances.
   The dashboard outstanding-balance card reflects summed order `balanceDue` for non-cancelled orders in the active branch scope, not employee payroll liabilities.

8. Attendance is not a live operational domain.
   The current system does not include attendance tracking, attendance settings, or attendance-based employee workflows.

9. Public inquiries are handled through the API.
   The marketing-site contact form submits to the Nest API public endpoint (`POST /public/contact`), which validates the inquiry, throttles abuse, and reuses the branded mail templating system for notifications.
10. Public marketing UI is curated, not ad hoc.
   Public marketing pages are composed under `apps/web/components/marketing/*` using the normal shared `@tbms/ui` primitives.
11. Public marketing contact CTAs are config-backed.
   A verified `NEXT_PUBLIC_MARKETING_WHATSAPP_URL` enables direct WhatsApp CTAs; without it, the public site uses an on-page inquiry fallback so placeholder contact links are not exposed.
