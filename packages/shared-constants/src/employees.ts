import { EmployeeStatus, PaymentType, BadgeVariant } from '@tbms/shared-types';

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  [EmployeeStatus.ACTIVE]: 'Active',
  [EmployeeStatus.INACTIVE]: 'Inactive',
  [EmployeeStatus.LEFT]: 'Left',
};

export const EMPLOYEE_STATUS_OPTIONS = Object.values(EmployeeStatus).map(
  (value) => ({
    value,
    label: EMPLOYEE_STATUS_LABELS[value],
  }),
);

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  [PaymentType.PER_PIECE]: 'Per Piece (Commission)',
  [PaymentType.MONTHLY_FIXED]: 'Monthly Fixed Salary',
};

export const PAYMENT_TYPE_OPTIONS = Object.values(PaymentType).map((value) => ({
  value,
  label: PAYMENT_TYPE_LABELS[value],
}));

export const EMPLOYEE_STATUS_BADGE: Record<EmployeeStatus, BadgeVariant> = {
  [EmployeeStatus.ACTIVE]: 'default',
  [EmployeeStatus.INACTIVE]: 'outline',
  [EmployeeStatus.LEFT]: 'destructive',
};
