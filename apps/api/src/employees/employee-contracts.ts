import {
  EmployeeStatus,
  PaymentType,
  type EmployeeCompensationHistory,
} from '@prisma/client';
import type { EmployeeCompensationHistoryEntry } from '@tbms/shared-types';
import {
  EmployeeStatus as SharedEmployeeStatus,
  PaymentType as SharedPaymentType,
} from '@tbms/shared-types';

export function toSharedPaymentType(value: PaymentType): SharedPaymentType {
  return value === PaymentType.MONTHLY_FIXED
    ? SharedPaymentType.MONTHLY_FIXED
    : SharedPaymentType.PER_PIECE;
}

export function toPrismaPaymentType(value: SharedPaymentType): PaymentType {
  return value === SharedPaymentType.MONTHLY_FIXED
    ? PaymentType.MONTHLY_FIXED
    : PaymentType.PER_PIECE;
}

export function toSharedEmployeeStatus(
  value: EmployeeStatus,
): SharedEmployeeStatus {
  if (value === EmployeeStatus.INACTIVE) {
    return SharedEmployeeStatus.INACTIVE;
  }

  if (value === EmployeeStatus.LEFT) {
    return SharedEmployeeStatus.LEFT;
  }

  return SharedEmployeeStatus.ACTIVE;
}

export function toPrismaEmployeeStatus(
  value: SharedEmployeeStatus,
): EmployeeStatus {
  if (value === SharedEmployeeStatus.INACTIVE) {
    return EmployeeStatus.INACTIVE;
  }

  if (value === SharedEmployeeStatus.LEFT) {
    return EmployeeStatus.LEFT;
  }

  return EmployeeStatus.ACTIVE;
}

export function toSharedCompensationHistoryEntry(
  entry: EmployeeCompensationHistory,
): EmployeeCompensationHistoryEntry {
  return {
    id: entry.id,
    employeeId: entry.employeeId,
    paymentType: toSharedPaymentType(entry.paymentType),
    monthlySalary: entry.monthlySalary,
    effectiveFrom: entry.effectiveFrom.toISOString(),
    effectiveTo: entry.effectiveTo?.toISOString() ?? null,
    note: entry.note,
    changedById: entry.changedById,
    createdAt: entry.createdAt.toISOString(),
  };
}
