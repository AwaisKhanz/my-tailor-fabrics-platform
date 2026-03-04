# TBMS Environment Setup (Separate Per App)

## Target Structure

Each app manages its own runtime env files:

1. `apps/web/.env`
2. `apps/web/.env.local`
3. `apps/web/.env.production`
4. `apps/api/.env`
5. `apps/api/.env.local`
6. `apps/api/.env.production`

Templates are versioned:

1. `apps/web/.env.example`
2. `apps/web/.env.local.example`
3. `apps/web/.env.production.example`
4. `apps/api/.env.example`
5. `apps/api/.env.local.example`
6. `apps/api/.env.production.example`

## Setup Flow

1. Run:

```bash
npm run env:setup
```

2. This creates missing app env files from app templates (no symlinks).
3. Update values per environment.
4. Verify contract:

```bash
npm run env:verify
```

## Runtime Loading

1. API:
   - `start`: loads `apps/api/.env`
   - `start:dev` / `start:debug`: load `apps/api/.env.local`
2. Web:
   - Next.js loads app-local env files from `apps/web/*` according to Next env rules.

## Guardrails

`npm run env:verify` enforces:

1. Required app env templates exist.
2. Required runtime app env files exist and are regular files (not symlinks).
3. Env keys used by code are present in:
   - `apps/api/.env.example`
   - `apps/api/.env.production.example`
   - `apps/web/.env.example`
   - `apps/web/.env.production.example`
4. `process.env` access is centralized:
   - allowed only in `apps/api/src/common/env.ts`
   - allowed only in `apps/web/lib/env.ts`

## Production Notes

1. Prefer platform secret injection in production.
2. Keep `NEXT_PUBLIC_*` client-safe only.
3. Keep API secrets server-only and unprefixed.

## References

1. Next.js environment variables: [https://nextjs.org/docs/pages/guides/environment-variables](https://nextjs.org/docs/pages/guides/environment-variables)
2. Nest CLI `--env-file`: [https://docs.nestjs.com/techniques/configuration](https://docs.nestjs.com/techniques/configuration)
3. NextAuth environment variables: [https://next-auth.js.org/configuration/options](https://next-auth.js.org/configuration/options)
