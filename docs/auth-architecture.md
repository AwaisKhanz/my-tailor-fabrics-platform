# TBMS Authentication Architecture (Long-Term Decision)

## Decision
Use **single auth authority in backend** with NextAuth as a **web-session façade**, not a second independent auth system.

## Why
The recurring failure pattern (`/api/auth/session` valid while backend JWT expired) happens when frontend session lifetime and backend access-token lifetime drift apart.
A single authority model avoids policy drift and keeps security decisions in one place.

## Recommended Model
1. Backend (`apps/api`) is source of truth:
- validates credentials
- issues short-lived access JWT
- issues long-lived refresh token (hashed at rest)
- enforces role/permission/branch from DB state at request time

2. Web (`apps/web`) acts as BFF/session façade:
- stores encrypted NextAuth JWT cookie (server-side)
- stores backend access token + refresh token inside that server-side session token
- derives permissions from role on session hydration (instead of persisting full permission arrays in cookie)
- rotates backend tokens server-side before expiry
- never performs independent authorization decisions beyond UI gating

3. Shared contract layer (`packages/shared-types`, `packages/shared-constants`):
- canonical auth/session payload types
- canonical role/permission constants
- canonical auth error codes

## Implemented Stability Controls
- Access token expiry is derived from JWT `exp`, not hardcoded duration.
- Legacy sessions self-heal by recalculating `accessTokenExpires` from real token payload.
- Client API layer performs proactive refresh check and a one-time 401 retry after forced session refresh.
- Refresh calls are lock-serialized in browser to avoid parallel refresh storms.
- Refresh token rotates on every refresh request and is hashed at rest.
- A short previous-token grace window is allowed to absorb concurrent in-flight refresh requests safely.

## Avoided Anti-Pattern
Do **not** run two independent auth systems:
- frontend session with one lifecycle
- backend JWT with another lifecycle

This creates inconsistent user state and causes intermittent `jwt expired` failures under load/reload.

## Next Migration Steps (Shared Auth Module)
1. Create shared auth contracts package section:
- `AuthSessionSnapshot`
- `RefreshResult`
- `AuthErrorCode`

2. Expose one internal web route for token state diagnostics (dev-only) to debug expiry/rotation safely.

3. Add backend token versioning (optional) for immediate global invalidation events.

4. Add end-to-end auth regression checks in CI:
- expired access token -> refresh -> request succeeds
- revoked refresh token -> deterministic sign-out path
- role downgrade reflects on next request

## Operational Notes
- Keep access JWT short-lived (e.g., 10–20 minutes).
- Keep refresh token long-lived, hashed at rest, and invalidated on logout/login reset.
- Keep refresh token only in HTTP-only secure storage (never localStorage).
- Keep all authorization (roles/permissions/branch scope) enforced in backend guards/services.
