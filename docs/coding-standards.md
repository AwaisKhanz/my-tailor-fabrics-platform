# My Tailor & Fabrics Coding Standards

This document is the short index for the maintained engineering rules.

Detailed rules live under [docs/rules](./rules/README.md):

1. [Backend Development Rules](./rules/backend-development-rules.md)
2. [Frontend Development Rules](./rules/frontend-development-rules.md)
3. [Shared Packages Rules](./rules/shared-packages-rules.md)
4. [Change Management Rules](./rules/change-management-rules.md)

## Core Project Principles

1. Shared contracts and shared constants belong in workspace packages, not duplicated app-local code.
2. Environment access stays centralized in typed env helpers.
3. Build, deployment, migration, and seed behavior must remain documented in the operational runbooks.
4. If a requested change changes the rules, the rule documents must be updated in the same task.
