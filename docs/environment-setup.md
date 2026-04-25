# My Tailor & Fabrics Environment Setup

The My Tailor & Fabrics codebase keeps environment files separate per app. Local development uses app-local `.env` files, while production uses App Platform environment injection.

## App-Local Files

Web:

1. `apps/web/.env`
2. `apps/web/.env.local`
3. `apps/web/.env.production`
4. `apps/web/.env.example`
5. `apps/web/.env.local.example`
6. `apps/web/.env.production.example`

API:

1. `apps/api/.env`
2. `apps/api/.env.local`
3. `apps/api/.env.production`
4. `apps/api/.env.example`
5. `apps/api/.env.local.example`
6. `apps/api/.env.production.example`

## Setup

Initialize missing env files:

```bash
pnpm run env:setup
```

Verify the repo contract:

```bash
pnpm run env:verify
```

## Runtime Loading Rules

API:

1. `pnpm --filter api start` loads `apps/api/.env`
2. `pnpm --filter api start:dev` loads `apps/api/.env` and `apps/api/.env.local`
3. `pnpm --filter api start:debug` loads `apps/api/.env` and `apps/api/.env.local`

Web:

1. Next.js reads env files from `apps/web`
2. only `NEXT_PUBLIC_*` values are safe for client-side exposure
3. hostname-aware web routing uses:
   - `NEXTAUTH_URL` and `PORTAL_BASE_URL` for the portal hostname
   - `MARKETING_SITE_URL` for the public marketing hostname
   - `NEXT_PUBLIC_PORTAL_BASE_URL` and `NEXT_PUBLIC_MARKETING_SITE_URL` for client-side cross-host links such as `Portal Login`
   - `NEXT_PUBLIC_MARKETING_WHATSAPP_URL` only when a verified public WhatsApp link is available; otherwise marketing CTAs fall back to the on-page inquiry section instead of using placeholder numbers

## Local Development Routing

Local development uses one host with a portal path prefix:

1. marketing site: `http://localhost:3000/`
2. portal site: `http://localhost:3000/portal`
3. portal login: `http://localhost:3000/portal/login`

This keeps local usage simple while preserving the real production split:

1. the public landing site stays at `/`
2. the business app stays under `/portal`

## Guardrails

`pnpm run env:verify` checks:

1. required templates exist
2. runtime env files exist as regular files, not symlinks
3. env keys used by code are declared in the correct examples
4. direct env access stays centralized in:
   - [env.ts](/Users/muhammadawais/Documents/My%20Tailors/tbms/apps/api/src/common/env.ts)
   - [env.ts](/Users/muhammadawais/Documents/My%20Tailors/tbms/apps/web/lib/env.ts)

## Production Rule

Production secrets belong in DigitalOcean App Platform, not in repo-local `.env.production` files. The example files remain useful as the contract and onboarding template.

For production authentication:

1. Login OTP delivery requires configured API mail environment values (Google mail client credentials, refresh token, and sender email).
2. If mail credentials are missing or invalid, password login verification cannot complete because OTP email delivery will fail.
3. API CORS and public contact-inquiry delivery now also depend on:
   - `FRONTEND_URL` for the portal origin
   - `MARKETING_SITE_URL` for the public marketing origin
