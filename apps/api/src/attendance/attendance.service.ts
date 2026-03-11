import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { requireEmployeeInScope } from '../common/utils/employee-scope.util';
import {
  normalizePagination,
  toPaginatedResponse,
} from '../common/utils/pagination.util';

const MAX_ATTENDANCE_TRANSACTION_RETRIES = 3;

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  private isSerializationConflict(error: unknown): error is { code: string } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2034'
    );
  }

  async clockIn(employeeId: string, branchId: string, note?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (
      let attempt = 1;
      attempt <= MAX_ATTENDANCE_TRANSACTION_RETRIES;
      attempt += 1
    ) {
      try {
        return await this.prisma.$transaction(
          async (tx) => {
            const existing = await tx.attendanceRecord.findFirst({
              where: {
                employeeId,
                date: { gte: today },
                clockOut: null,
                deletedAt: null,
              },
              select: { id: true },
            });

            if (existing) {
              throw new BadRequestException(
                'Employee already clocked in today. Please clock out first.',
              );
            }

            const employee = await requireEmployeeInScope(tx, {
              employeeId,
              branchId,
              requireActive: true,
              inactiveMessage: 'Only active employees can clock in',
            });

            const recordBranchId = branchId || employee.branchId;
            const now = new Date();

            return tx.attendanceRecord.create({
              data: {
                employeeId,
                branchId: recordBranchId,
                date: today,
                clockIn: now,
                note,
              },
              include: {
                employee: { select: { fullName: true, employeeCode: true } },
              },
            });
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
      } catch (error) {
        if (
          this.isSerializationConflict(error) &&
          attempt < MAX_ATTENDANCE_TRANSACTION_RETRIES
        ) {
          continue;
        }

        if (this.isSerializationConflict(error)) {
          throw new ConflictException(
            'Concurrent attendance clock-in detected. Please retry.',
          );
        }

        throw error;
      }
    }

    throw new ConflictException('Unable to process attendance clock-in');
  }

  async clockOut(recordId: string, branchId: string) {
    for (
      let attempt = 1;
      attempt <= MAX_ATTENDANCE_TRANSACTION_RETRIES;
      attempt += 1
    ) {
      try {
        return await this.prisma.$transaction(
          async (tx) => {
            const record = await tx.attendanceRecord.findFirst({
              where: {
                id: recordId,
                deletedAt: null,
                ...(branchId ? { branchId } : {}),
              },
              select: {
                id: true,
                clockIn: true,
                clockOut: true,
              },
            });

            if (!record) {
              throw new NotFoundException('Attendance record not found');
            }

            if (record.clockOut) {
              throw new BadRequestException('Already clocked out');
            }

            const now = new Date();
            const diffMs = now.getTime() - record.clockIn.getTime();
            const hoursWorked =
              Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

            const updated = await tx.attendanceRecord.updateMany({
              where: {
                id: recordId,
                deletedAt: null,
                ...(branchId ? { branchId } : {}),
                clockOut: null,
              },
              data: { clockOut: now, hoursWorked },
            });

            if (updated.count === 0) {
              throw new BadRequestException('Already clocked out');
            }

            return tx.attendanceRecord.findUniqueOrThrow({
              where: { id: recordId },
              include: {
                employee: { select: { fullName: true, employeeCode: true } },
              },
            });
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
      } catch (error) {
        if (
          this.isSerializationConflict(error) &&
          attempt < MAX_ATTENDANCE_TRANSACTION_RETRIES
        ) {
          continue;
        }

        if (this.isSerializationConflict(error)) {
          throw new ConflictException(
            'Concurrent attendance clock-out detected. Please retry.',
          );
        }

        throw error;
      }
    }

    throw new ConflictException('Unable to process attendance clock-out');
  }

  async clockOutForEmployee(
    recordId: string,
    branchId: string,
    employeeId: string,
  ) {
    const record = await this.prisma.attendanceRecord.findFirst({
      where: {
        id: recordId,
        deletedAt: null,
        ...(branchId ? { branchId } : {}),
      },
      select: { employeeId: true },
    });

    if (!record) {
      throw new NotFoundException('Attendance record not found');
    }

    if (record.employeeId !== employeeId) {
      throw new ForbiddenException(
        'Employees can only clock out their own attendance records',
      );
    }

    return this.clockOut(recordId, branchId);
  }

  async findAll(
    branchId: string | null,
    employeeId?: string,
    page = 1,
    limit = 20,
  ) {
    const pagination = normalizePagination({ page, limit, defaultLimit: 20 });
    const where: Prisma.AttendanceRecordWhereInput = {
      ...(branchId ? { branchId } : {}),
      deletedAt: null,
      ...(employeeId ? { employeeId } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.attendanceRecord.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { clockIn: 'desc' },
        include: {
          employee: {
            select: { fullName: true, employeeCode: true, designation: true },
          },
        },
      }),
      this.prisma.attendanceRecord.count({ where }),
    ]);

    return toPaginatedResponse(data, total, pagination);
  }

  async getEmployeeSummary(employeeId: string, branchId: string | null) {
    const records = await this.prisma.attendanceRecord.findMany({
      where: { employeeId, deletedAt: null, ...(branchId ? { branchId } : {}) },
      orderBy: { date: 'desc' },
      take: 30, // last 30 records
    });

    const totalHours = records.reduce(
      (sum: number, r) => sum + (r.hoursWorked ?? 0),
      0,
    );
    const totalDays = records.length;
    const currentlyIn = records.find((r) => !r.clockOut);

    return {
      totalDays,
      totalHours: Math.round(totalHours * 100) / 100,
      currentlyIn,
      records,
    };
  }
}
