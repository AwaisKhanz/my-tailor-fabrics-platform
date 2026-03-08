# My Tailor & Fabrics Platform

This monorepo contains the production applications and shared packages for My Tailor & Fabrics. It contains:

1. `apps/web`: the Next.js 14 web application.
2. `apps/api`: the NestJS API.
3. `packages/shared-types`: shared cross-app TypeScript contracts.
4. `packages/shared-constants`: shared policy, labels, and workflow constants.

## Quick Start

From the repo root:

```bash
npm ci
npm run env:setup
npm run env:verify
npm run dev
```

Useful root commands:

```bash
npm run build:do:web
npm run build:do:api
npm run prisma:migrate:deploy
npm run prisma:seed
npm run prisma:seed:list
```

## Production

Production runs on DigitalOcean App Platform as a single app with separate `web-frontend` and `api-backend` services, managed PostgreSQL, and managed Valkey.

## Internal Naming

The internal technical slug remains `tbms` in package names, workspace paths, and infrastructure identifiers such as `@tbms/*` and `tbms-production-db`. That slug is intentional and should be treated as an internal namespace, not the public-facing brand.

Canonical production docs:

1. [Documentation Index](/Users/muhammadawais/Documents/My%20Tailors/tbms/docs/README.md)
2. [System Overview](/Users/muhammadawais/Documents/My%20Tailors/tbms/docs/system-overview.md)
3. [Deployment Guide](/Users/muhammadawais/Documents/My%20Tailors/tbms/docs/deployment-guide.md)
4. [Environment Setup](/Users/muhammadawais/Documents/My%20Tailors/tbms/docs/environment-setup.md)
5. [Coding Standards](/Users/muhammadawais/Documents/My%20Tailors/tbms/docs/coding-standards.md)
