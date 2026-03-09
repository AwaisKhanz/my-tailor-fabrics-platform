export const AUDIT_ACTIONS = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'LOGIN',
  'LOGIN_FAILED',
  'LOGOUT',
  'TOKEN_REFRESH',
] as const;

export const AUDIT_UNKNOWN_ENTITY = 'Unknown' as const;

export const AUDIT_ENTITIES = [
  'Customer',
  'Employee',
  'Order',
  'OrderItem',
  'Task',
  'Payment',
  'Expense',
  'ExpenseCategory',
  'AttendanceRecord',
  'Branch',
  'User',
  'GarmentType',
  'MeasurementCategory',
  'MeasurementField',
  'MeasurementSection',
  'DesignType',
  'RateCard',
  AUDIT_UNKNOWN_ENTITY,
] as const;

export const AUDIT_FILTER_ENTITIES: readonly string[] = AUDIT_ENTITIES.filter(
  (entity) => entity !== AUDIT_UNKNOWN_ENTITY,
);
