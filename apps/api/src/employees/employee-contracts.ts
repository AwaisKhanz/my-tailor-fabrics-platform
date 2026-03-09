import {
  type EmployeeCapability as PrismaEmployeeCapability,
  EmployeeStatus,
  PaymentType,
  Role,
  type Prisma,
  type Employee as PrismaEmployee,
  type EmployeeCompensationHistory,
} from '@prisma/client';
import type {
  EmployeeCapability,
  EmployeeCompensationHistoryEntry,
} from '@tbms/shared-types';
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

export function toSharedEmployeeCapability(
  capability: PrismaEmployeeCapability,
): EmployeeCapability {
  return {
    id: capability.id,
    employeeId: capability.employeeId,
    garmentTypeId: capability.garmentTypeId,
    stepKey: capability.stepKey,
    effectiveFrom: capability.effectiveFrom.toISOString(),
    effectiveTo: capability.effectiveTo?.toISOString() ?? null,
    note: capability.note,
    createdById: capability.createdById,
    createdAt: capability.createdAt.toISOString(),
    deletedAt: capability.deletedAt?.toISOString() ?? null,
  };
}

type EmployeeUpdateSource = Pick<
  PrismaEmployee,
  | 'fullName'
  | 'phone'
  | 'fatherName'
  | 'phone2'
  | 'address'
  | 'city'
  | 'cnic'
  | 'designation'
  | 'accountNumber'
  | 'emergencyName'
  | 'emergencyPhone'
  | 'notes'
  | 'dateOfBirth'
>;

export function buildEmployeeCreateData(params: {
  branchId: string;
  employeeCode: string;
  input: {
    fullName: string;
    phone: string;
    fatherName?: string;
    phone2?: string;
    address?: string;
    city?: string;
    cnic?: string;
    designation?: string;
    accountNumber?: string;
    emergencyName?: string;
    emergencyPhone?: string;
    notes?: string;
  };
  dateOfBirth?: Date | null;
  dateOfJoining: Date;
  paymentType: PaymentType;
  monthlySalary: number | null;
  employmentEndDate: Date | null;
}): Prisma.EmployeeUncheckedCreateInput {
  const { input } = params;

  return {
    fullName: input.fullName,
    phone: input.phone,
    fatherName: input.fatherName,
    phone2: input.phone2,
    address: input.address,
    city: input.city,
    cnic: input.cnic,
    dateOfBirth: params.dateOfBirth,
    dateOfJoining: params.dateOfJoining,
    designation: input.designation,
    paymentType: params.paymentType,
    monthlySalary: params.monthlySalary,
    accountNumber: input.accountNumber,
    emergencyName: input.emergencyName,
    emergencyPhone: input.emergencyPhone,
    notes: input.notes,
    employmentEndDate: params.employmentEndDate,
    employeeCode: params.employeeCode,
    branchId: params.branchId,
  };
}

export function buildEmployeeUpdateData(params: {
  employee: EmployeeUpdateSource;
  input: {
    fullName?: string;
    phone?: string;
    fatherName?: string;
    phone2?: string;
    address?: string;
    city?: string;
    cnic?: string;
    designation?: string;
    accountNumber?: string;
    emergencyName?: string;
    emergencyPhone?: string;
    notes?: string;
  };
  status: EmployeeStatus;
  dateOfBirth: Date | null;
  dateOfJoining: Date;
  paymentType: PaymentType;
  monthlySalary: number | null;
  employmentEndDate: Date | null;
}): Prisma.EmployeeUpdateInput {
  const { employee, input } = params;

  return {
    fullName: input.fullName ?? employee.fullName,
    phone: input.phone ?? employee.phone,
    fatherName: input.fatherName ?? employee.fatherName,
    phone2: input.phone2 ?? employee.phone2,
    address: input.address ?? employee.address,
    city: input.city ?? employee.city,
    cnic: input.cnic ?? employee.cnic,
    designation: input.designation ?? employee.designation,
    accountNumber: input.accountNumber ?? employee.accountNumber,
    emergencyName: input.emergencyName ?? employee.emergencyName,
    emergencyPhone: input.emergencyPhone ?? employee.emergencyPhone,
    notes: input.notes ?? employee.notes,
    status: params.status,
    dateOfBirth: params.dateOfBirth,
    dateOfJoining: params.dateOfJoining,
    paymentType: params.paymentType,
    monthlySalary: params.monthlySalary,
    employmentEndDate: params.employmentEndDate,
  };
}

export function buildEmployeeUserAccountCreateData(params: {
  employeeId: string;
  branchId: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}): Prisma.UserUncheckedCreateInput {
  return {
    name: params.name,
    email: params.email,
    passwordHash: params.passwordHash,
    role: params.role,
    branchId: params.branchId,
    employeeId: params.employeeId,
  };
}

export function buildRevokedEmployeeUserAccountData(): Prisma.UserUpdateManyMutationInput {
  return {
    isActive: false,
    refreshToken: null,
    previousRefreshToken: null,
    previousRefreshTokenExpiresAt: null,
  };
}
