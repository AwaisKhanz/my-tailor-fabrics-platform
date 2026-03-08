# Development Rules

This directory contains the maintained engineering rules for My Tailor & Fabrics.

These files are intended to be operational rules, not aspirational notes. When the codebase changes, these rules must be updated with it.

## Rule Set

1. [Backend Development Rules](./backend-development-rules.md)
   API architecture, Prisma discipline, auth/guards, transactions, business logic placement, scheduler constraints, and backend verification.

2. [Frontend Development Rules](./frontend-development-rules.md)
   Route composition, hooks, design system usage, auth/session behavior, API access boundaries, and frontend verification.

3. [Shared Packages Rules](./shared-packages-rules.md)
   Rules for `packages/shared-types` and `packages/shared-constants`, including contract boundaries, build outputs, and cross-app sync.

4. [Change Management Rules](./change-management-rules.md)
   Rules for updating docs, migrations, env contracts, deployment assets, verification steps, and cleanup when behavior changes.

## Usage

1. Read the relevant rule file before making changes.
2. Treat these documents as part of the implementation surface.
3. If a user-requested change alters a rule, update the rule file in the same task.
