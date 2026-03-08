# TBMS Environment Setup

TBMS keeps environment files separate per app. Local development uses app-local `.env` files, while production uses App Platform environment injection.

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
npm run env:setup
```

Verify the repo contract:

```bash
npm run env:verify
```

## Runtime Loading Rules

API:

1. `npm run start -w api` loads `apps/api/.env`
2. `npm run start:dev -w api` loads `apps/api/.env` and `apps/api/.env.local`
3. `npm run start:debug -w api` loads `apps/api/.env` and `apps/api/.env.local`

Web:

1. Next.js reads env files from `apps/web`
2. only `NEXT_PUBLIC_*` values are safe for client-side exposure

## Guardrails

`npm run env:verify` checks:

1. required templates exist
2. runtime env files exist as regular files, not symlinks
3. env keys used by code are declared in the correct examples
4. direct env access stays centralized in:
   - [env.ts](/Users/muhammadawais/Documents/My%20Tailors/tbms/apps/api/src/common/env.ts)
   - [env.ts](/Users/muhammadawais/Documents/My%20Tailors/tbms/apps/web/lib/env.ts)

## Production Rule

Production secrets belong in DigitalOcean App Platform, not in repo-local `.env.production` files. The example files remain useful as the contract and onboarding template.
