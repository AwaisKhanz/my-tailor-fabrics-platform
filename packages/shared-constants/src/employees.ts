import { EmployeeStatus, PaymentType, BadgeVariant } from '@tbms/shared-types';

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  [EmployeeStatus.ACTIVE]: 'Active',
  [EmployeeStatus.INACTIVE]: 'Inactive',
  [EmployeeStatus.LEFT]: 'Left',
};

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  [PaymentType.PER_PIECE]: 'Per Piece (Commission)',
  [PaymentType.WEEKLY_FIXED]: 'Weekly Fixed Salary',
};

export const EMPLOYEE_STATUS_BADGE: Record<EmployeeStatus, BadgeVariant> = {
  [EmployeeStatus.ACTIVE]: 'success',
  [EmployeeStatus.INACTIVE]: 'outline',
  [EmployeeStatus.LEFT]: 'destructive',
};
