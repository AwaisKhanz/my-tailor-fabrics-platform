import { toPortalRoute } from '@/lib/portal-routing';

export const INTERNAL_HOME_ROUTE = '/';
export const INTERNAL_LOGIN_ROUTE = '/login';
export const INTERNAL_UNAUTHORIZED_ROUTE = '/unauthorized';

export const HOME_ROUTE = toPortalRoute(INTERNAL_HOME_ROUTE);
export const LOGIN_ROUTE = toPortalRoute(INTERNAL_LOGIN_ROUTE);
export const UNAUTHORIZED_ROUTE = toPortalRoute(INTERNAL_UNAUTHORIZED_ROUTE);

export function buildExpiredLoginRoute() {
  return `${LOGIN_ROUTE}?expired=1`;
}
