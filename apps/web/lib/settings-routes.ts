export const SETTINGS_ROUTE = "/settings";

export const BRANCHES_SETTINGS_ROUTE = `${SETTINGS_ROUTE}/branches`;
export const GARMENTS_SETTINGS_ROUTE = `${SETTINGS_ROUTE}/garments`;
export const FABRICS_SETTINGS_ROUTE = `${SETTINGS_ROUTE}/fabrics`;
export const RATES_SETTINGS_ROUTE = `${SETTINGS_ROUTE}/rates`;
export const EXPENSE_CATEGORIES_SETTINGS_ROUTE =
  `${SETTINGS_ROUTE}/expense-categories`;
export const DESIGN_TYPES_SETTINGS_ROUTE = `${SETTINGS_ROUTE}/design-types`;
export const MEASUREMENTS_SETTINGS_ROUTE = `${SETTINGS_ROUTE}/measurements`;
export const USERS_SETTINGS_ROUTE = `${SETTINGS_ROUTE}/users`;
export const INTEGRATIONS_SETTINGS_ROUTE = `${SETTINGS_ROUTE}/integrations`;
export const AUDIT_LOGS_SETTINGS_ROUTE = `${SETTINGS_ROUTE}/audit-logs`;

export function buildBranchHubRoute(branchId: string) {
  return `${BRANCHES_SETTINGS_ROUTE}/${branchId}`;
}

export function buildGarmentSettingsDetailRoute(garmentId: string) {
  return `${GARMENTS_SETTINGS_ROUTE}/${garmentId}`;
}

export function buildMeasurementCategoryRoute(categoryId: string) {
  return `${MEASUREMENTS_SETTINGS_ROUTE}/${categoryId}`;
}
