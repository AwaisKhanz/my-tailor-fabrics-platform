export const HOME_ROUTE = "/";
export const LOGIN_ROUTE = "/login";

export function buildExpiredLoginRoute() {
  return `${LOGIN_ROUTE}?expired=1`;
}
