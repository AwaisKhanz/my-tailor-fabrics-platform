export const HOME_ROUTE = "/";
export const LOGIN_ROUTE = "/login";
export const UNAUTHORIZED_ROUTE = "/unauthorized";

export function buildExpiredLoginRoute() {
  return `${LOGIN_ROUTE}?expired=1`;
}
