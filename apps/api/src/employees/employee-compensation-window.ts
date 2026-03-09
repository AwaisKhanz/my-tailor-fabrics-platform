import { BadRequestException } from '@nestjs/common';
import { PaymentType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildEmployeeCompensationHistoryCreateData } from './employee-contracts';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

type EmployeeCompensationClient = Prisma.TransactionClient | PrismaService;

export function shiftDateByDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_IN_MS);
}

export async function getEffectiveCompensationAt(
  client: EmployeeCompensationClient,
  employeeId: string,
  at: Date,
) {
  return client.employeeCompensationHistory.findFirst({
    where: {
      employeeId,
      effectiveFrom: { lte: at },
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: at } }],
    },
    orderBy: { effectiveFrom: 'desc' },
    select: {
      paymentType: true,
      monthlySalary: true,
    },
  });
}

export async function syncCurrentCompensationSnapshot(
  client: EmployeeCompensationClient,
  employeeId: string,
  at = new Date(),
) {
  const effectiveCompensation = await getEffectiveCompensationAt(
    client,
    employeeId,
    at,
  );

  if (!effectiveCompensation) {
    return null;
  }

  await client.employee.update({
    where: { id: employeeId },
    data: {
      paymentType: effectiveCompensation.paymentType,
      monthlySalary:
        effectiveCompensation.paymentType === PaymentType.MONTHLY_FIXED
          ? effectiveCompensation.monthlySalary
          : null,
    },
  });

  return effectiveCompensation;
}

export async function applyCompensationChange(
  client: EmployeeCompensationClient,
  params: {
    employeeId: string;
    change: {
      paymentType: PaymentType;
      monthlySalary?: number;
      effectiveFrom: string;
      note?: string;
    };
    changedById?: string;
  },
) {
  const effectiveFrom = new Date(params.change.effectiveFrom);
  if (Number.isNaN(effectiveFrom.getTime())) {
    throw new BadRequestException('Invalid compensation effectiveFrom date');
  }

  const paymentType = params.change.paymentType;
  const monthlySalary =
    paymentType === PaymentType.MONTHLY_FIXED
      ? (params.change.monthlySalary ?? null)
      : null;

  if (
    paymentType === PaymentType.MONTHLY_FIXED &&
    (!monthlySalary || monthlySalary <= 0)
  ) {
    throw new BadRequestException(
      'monthlySalary is required for monthly payroll employees',
    );
  }

  const nextWindow = await client.employeeCompensationHistory.findFirst({
    where: {
      employeeId: params.employeeId,
      effectiveFrom: { gt: effectiveFrom },
    },
    orderBy: { effectiveFrom: 'asc' },
    select: {
      effectiveFrom: true,
    },
  });

  await client.employeeCompensationHistory.updateMany({
    where: {
      employeeId: params.employeeId,
      effectiveFrom: { lte: effectiveFrom },
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: effectiveFrom } }],
    },
    data: {
      effectiveTo: shiftDateByDays(effectiveFrom, -1),
    },
  });

  const created = await client.employeeCompensationHistory.create({
    data: buildEmployeeCompensationHistoryCreateData({
      employeeId: params.employeeId,
      paymentType,
      monthlySalary,
      effectiveFrom,
      effectiveTo: nextWindow
        ? shiftDateByDays(nextWindow.effectiveFrom, -1)
        : null,
      note: params.change.note?.trim() || null,
      changedById: params.changedById ?? null,
    }),
    select: {
      id: true,
      paymentType: true,
      monthlySalary: true,
      effectiveFrom: true,
      effectiveTo: true,
      note: true,
      createdAt: true,
    },
  });

  await syncCurrentCompensationSnapshot(client, params.employeeId);

  return created;
}
