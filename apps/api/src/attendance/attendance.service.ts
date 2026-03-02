import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async clockIn(employeeId: string, branchId: string, note?: string) {
    // Check if already clocked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.attendanceRecord.findFirst({
      where: { employeeId, date: { gte: today }, clockOut: null, deletedAt: null },
    });
    if (existing) {
      throw new BadRequestException('Employee already clocked in today. Please clock out first.');
    }

    const now = new Date();

    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Employee not found');
    const recordBranchId = branchId || employee.branchId;

    return this.prisma.attendanceRecord.create({
      data: {
        employeeId,
        branchId: recordBranchId,
        date: today,
        clockIn: now,
        note,
      },
      include: { employee: { select: { fullName: true, employeeCode: true } } },
    });
  }

  async clockOut(recordId: string, branchId: string) {
    const record = await this.prisma.attendanceRecord.findFirst({
      where: { id: recordId, deletedAt: null, ...(branchId ? { branchId } : {}) },
    });
    if (!record) throw new NotFoundException('Attendance record not found');
    if (record.clockOut) throw new BadRequestException('Already clocked out');

    const now = new Date();
    const diffMs = now.getTime() - record.clockIn.getTime();
    const hoursWorked = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // 2 dp

    return this.prisma.attendanceRecord.update({
      where: { id: recordId },
      data: { clockOut: now, hoursWorked },
      include: { employee: { select: { fullName: true, employeeCode: true } } },
    });
  }

  async findAll(branchId: string, employeeId?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: Prisma.AttendanceRecordWhereInput = {
      branchId,
      deletedAt: null,
      ...(employeeId ? { employeeId } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.attendanceRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { clockIn: 'desc' },
        include: { employee: { select: { fullName: true, employeeCode: true, designation: true } } },
      }),
      this.prisma.attendanceRecord.count({ where }),
    ]);

    return { data, total };
  }

  async getEmployeeSummary(employeeId: string, branchId: string) {
    const records = await this.prisma.attendanceRecord.findMany({
      where: { employeeId, deletedAt: null, ...(branchId ? { branchId } : {}) },
      orderBy: { date: 'desc' },
      take: 30, // last 30 records
    });

    const totalHours = records.reduce((sum: number, r) => sum + (r.hoursWorked ?? 0), 0);
    const totalDays = records.length;
    const currentlyIn = records.find(r => !r.clockOut);

    return { totalDays, totalHours: Math.round(totalHours * 100) / 100, currentlyIn, records };
  }
}
