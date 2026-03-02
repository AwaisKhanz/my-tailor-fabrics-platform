"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AttendanceService = class AttendanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async clockIn(employeeId, branchId, note) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existing = await this.prisma.attendanceRecord.findFirst({
            where: {
                employeeId,
                date: { gte: today },
                clockOut: null,
                deletedAt: null,
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('Employee already clocked in today. Please clock out first.');
        }
        const now = new Date();
        const employee = await this.prisma.employee.findUnique({
            where: { id: employeeId },
        });
        if (!employee)
            throw new common_1.NotFoundException('Employee not found');
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
    async clockOut(recordId, branchId) {
        const record = await this.prisma.attendanceRecord.findFirst({
            where: {
                id: recordId,
                deletedAt: null,
                ...(branchId ? { branchId } : {}),
            },
        });
        if (!record)
            throw new common_1.NotFoundException('Attendance record not found');
        if (record.clockOut)
            throw new common_1.BadRequestException('Already clocked out');
        const now = new Date();
        const diffMs = now.getTime() - record.clockIn.getTime();
        const hoursWorked = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
        return this.prisma.attendanceRecord.update({
            where: { id: recordId },
            data: { clockOut: now, hoursWorked },
            include: { employee: { select: { fullName: true, employeeCode: true } } },
        });
    }
    async findAll(branchId, employeeId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const where = {
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
                include: {
                    employee: {
                        select: { fullName: true, employeeCode: true, designation: true },
                    },
                },
            }),
            this.prisma.attendanceRecord.count({ where }),
        ]);
        return { data, total };
    }
    async getEmployeeSummary(employeeId, branchId) {
        const records = await this.prisma.attendanceRecord.findMany({
            where: { employeeId, deletedAt: null, ...(branchId ? { branchId } : {}) },
            orderBy: { date: 'desc' },
            take: 30,
        });
        const totalHours = records.reduce((sum, r) => sum + (r.hoursWorked ?? 0), 0);
        const totalDays = records.length;
        const currentlyIn = records.find((r) => !r.clockOut);
        return {
            totalDays,
            totalHours: Math.round(totalHours * 100) / 100,
            currentlyIn,
            records,
        };
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map