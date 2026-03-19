/**
 * Centralized query key factory for TanStack Query.
 *
 * All query keys are structured as arrays so TanStack Query can:
 *  - Invalidate by prefix:  queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
 *  - Match detail keys:     queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(id) })
 *
 * Convention: each domain exposes
 *   all      – the broadest key for the domain
 *   lists    – all list queries (for bulk invalidation after a write)
 *   list(f)  – specific list with filters
 *   detail(id) – single-entity key
 *   ...any domain-specific sub-keys
 */

// ─── Orders ─────────────────────────────────────────────────────────────────

export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filters: object) => [...orderKeys.lists(), filters] as const,
  summary: (filters: object) => [...orderKeys.all, "summary", filters] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  eligible: (orderId: string) =>
    [...orderKeys.all, "eligible", orderId] as const,
  taskEligible: (taskId: string) =>
    [...orderKeys.all, "task-eligible", taskId] as const,
  employeeTasks: (employeeId: string) =>
    [...orderKeys.all, "employee-tasks", employeeId] as const,
};

// ─── Customers ───────────────────────────────────────────────────────────────

export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (filters: object) => [...customerKeys.lists(), filters] as const,
  summary: (filters: object) =>
    [...customerKeys.all, "summary", filters] as const,
  details: () => [...customerKeys.all, "detail"] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
  orders: (id: string, filters: object) =>
    [...customerKeys.all, "orders", id, filters] as const,
};

// ─── Employees ───────────────────────────────────────────────────────────────

export const employeeKeys = {
  all: ["employees"] as const,
  lists: () => [...employeeKeys.all, "list"] as const,
  list: (filters: object) => [...employeeKeys.lists(), filters] as const,
  details: () => [...employeeKeys.all, "detail"] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
  stats: (id: string) => [...employeeKeys.all, "stats", id] as const,
  items: (id: string, filters: object) =>
    [...employeeKeys.all, "items", id, filters] as const,
  capabilities: (id: string) =>
    [...employeeKeys.all, "capabilities", id] as const,
  compensation: (id: string) =>
    [...employeeKeys.all, "compensation", id] as const,
  myProfile: () => [...employeeKeys.all, "my", "profile"] as const,
  myStats: () => [...employeeKeys.all, "my", "stats"] as const,
  myItems: () => [...employeeKeys.all, "my", "items"] as const,
  // Flat list for select dropdowns (not paginated)
  dropdown: (filters?: object) =>
    [...employeeKeys.all, "dropdown", filters ?? {}] as const,
};

// ─── Payments ────────────────────────────────────────────────────────────────

export const paymentKeys = {
  all: ["payments"] as const,
  summary: (employeeId: string) =>
    [...paymentKeys.all, "summary", employeeId] as const,
  history: (employeeId: string, filters: object) =>
    [...paymentKeys.all, "history", employeeId, filters] as const,
};

// ─── Expenses ────────────────────────────────────────────────────────────────

export const expenseKeys = {
  all: ["expenses"] as const,
  lists: () => [...expenseKeys.all, "list"] as const,
  list: (filters: object) => [...expenseKeys.lists(), filters] as const,
  categories: () => [...expenseKeys.all, "categories"] as const,
  categoriesPaginated: (filters: object) =>
    [...expenseKeys.all, "categories", "paginated", filters] as const,
};

// ─── Reports / Dashboard ─────────────────────────────────────────────────────

export const reportKeys = {
  all: ["reports"] as const,
  dashboard: (branchId?: string) =>
    [...reportKeys.all, "dashboard", branchId ?? "all"] as const,
  designs: (filters: object) =>
    [...reportKeys.all, "designs", filters] as const,
  addons: (filters: object) => [...reportKeys.all, "addons", filters] as const,
  summary: (filters: object) =>
    [...reportKeys.all, "summary", filters] as const,
  financialTrend: (filters: object) =>
    [...reportKeys.all, "financialTrend", filters] as const,
  distributions: (filters: object) =>
    [...reportKeys.all, "distributions", filters] as const,
  productivity: (filters: object) =>
    [...reportKeys.all, "productivity", filters] as const,
  revenueExpenses: (filters: object) =>
    [...reportKeys.all, "revenueExpenses", filters] as const,
  garmentRevenue: (filters: object) =>
    [...reportKeys.all, "garmentRevenue", filters] as const,
  employeeProductivity: (filters: object) =>
    [...reportKeys.all, "employeeProductivity", filters] as const,
};

// ─── Branches ────────────────────────────────────────────────────────────────

export const branchKeys = {
  all: ["branches"] as const,
  switcher: () => [...branchKeys.all, "switcher"] as const,
  lists: () => [...branchKeys.all, "list"] as const,
  list: (filters: object) => [...branchKeys.lists(), filters] as const,
  detail: (id: string) => [...branchKeys.all, "detail", id] as const,
  stats: () => [...branchKeys.all, "stats"] as const,
};

// ─── Rates ───────────────────────────────────────────────────────────────────

export const rateKeys = {
  all: ["rates"] as const,
  list: (filters: object) => [...rateKeys.all, "list", filters] as const,
  history: (garmentTypeId: string, stepKey: string, branchId?: string | null) =>
    [
      ...rateKeys.all,
      "history",
      garmentTypeId,
      stepKey,
      branchId ?? "all",
    ] as const,
  stats: (filters: object) => [...rateKeys.all, "stats", filters] as const,
};

// ─── Fabrics ────────────────────────────────────────────────────────────────

export const fabricKeys = {
  all: ["fabrics"] as const,
  lists: () => [...fabricKeys.all, "list"] as const,
  list: (filters: object) => [...fabricKeys.lists(), filters] as const,
  details: () => [...fabricKeys.all, "detail"] as const,
  detail: (id: string) => [...fabricKeys.details(), id] as const,
  stats: (filters: object) => [...fabricKeys.all, "stats", filters] as const,
};

// ─── Design Types ────────────────────────────────────────────────────────────

export const designTypeKeys = {
  all: ["designTypes"] as const,
  list: (filters?: object) =>
    [...designTypeKeys.all, "list", filters ?? {}] as const,
  detail: (id: string) => [...designTypeKeys.all, "detail", id] as const,
};

// ─── Users ───────────────────────────────────────────────────────────────────

export const userKeys = {
  all: ["users"] as const,
  list: (filters: object) => [...userKeys.all, "list", filters] as const,
  stats: () => [...userKeys.all, "stats"] as const,
};

// ─── Audit Logs ──────────────────────────────────────────────────────────────

export const auditLogKeys = {
  all: ["auditLogs"] as const,
  list: (filters: object) => [...auditLogKeys.all, "list", filters] as const,
  stats: (filters: object) => [...auditLogKeys.all, "stats", filters] as const,
};

// ─── Ledger ──────────────────────────────────────────────────────────────────

export const ledgerKeys = {
  all: ["ledger"] as const,
  balance: (employeeId: string) =>
    [...ledgerKeys.all, "balance", employeeId] as const,
  statement: (employeeId: string, filters: object) =>
    [...ledgerKeys.all, "statement", employeeId, filters] as const,
  earnings: (employeeId: string, weeksBack: number) =>
    [...ledgerKeys.all, "earnings", employeeId, weeksBack] as const,
};

// ─── Config ──────────────────────────────────────────────────────────────────

export const configKeys = {
  all: ["config"] as const,
  hubSettings: () => [...configKeys.all, "hub-settings"] as const,
  integrations: () => [...configKeys.all, "integrations"] as const,
};

// ─── Search ──────────────────────────────────────────────────────────────────

export const searchKeys = {
  all: ["search"] as const,
  global: (query: string) => [...searchKeys.all, "global", query] as const,
};
