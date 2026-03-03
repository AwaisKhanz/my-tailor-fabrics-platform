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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const shared_types_1 = require("@tbms/shared-types");
let TasksService = class TasksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async assignTask(taskId, employeeId, branchId, userRole) {
        if (![shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN].includes(userRole)) {
            throw new common_1.ForbiddenException('Only Admins can assign tasks');
        }
        const task = await this.prisma.orderItemTask.findFirst({
            where: {
                id: taskId,
                orderItem: { order: { branchId } },
            },
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        return this.prisma.orderItemTask.update({
            where: { id: taskId },
            data: {
                assignedEmployeeId: employeeId,
            },
        });
    }
    async updateTaskStatus(taskId, status, branchId, updatedById, userRole, requesterEmployeeId) {
        return this.prisma.$transaction(async (tx) => {
            const task = await tx.orderItemTask.findFirst({
                where: {
                    id: taskId,
                    orderItem: { order: { branchId } },
                },
                include: {
                    orderItem: {
                        include: {
                            order: true,
                        },
                    },
                    designType: true,
                },
            });
            if (!task)
                throw new common_1.NotFoundException('Task not found');
            if (userRole === shared_types_1.Role.EMPLOYEE) {
                if (!requesterEmployeeId) {
                    throw new common_1.ForbiddenException('Employee identity is missing');
                }
                if (task.assignedEmployeeId !== requesterEmployeeId) {
                    throw new common_1.ForbiddenException('Employees can only update their own assigned tasks');
                }
            }
            const data = { status };
            if (status === shared_types_1.TaskStatus.IN_PROGRESS && !task.startedAt) {
                data.startedAt = new Date();
            }
            if (status === shared_types_1.TaskStatus.DONE && !task.completedAt) {
                data.completedAt = new Date();
            }
            const updatedTask = await tx.orderItemTask.update({
                where: { id: taskId },
                data,
            });
            const becameDone = status === shared_types_1.TaskStatus.DONE && !task.completedAt;
            if (becameDone && task.assignedEmployeeId) {
                const existingEntry = await tx.employeeLedgerEntry.findFirst({
                    where: {
                        orderItemTaskId: taskId,
                        type: shared_types_1.LedgerEntryType.EARNING,
                        deletedAt: null,
                    },
                    select: { id: true },
                });
                if (!existingEntry) {
                    const earningAmount = task.rateOverride ??
                        task.designType?.defaultRate ??
                        task.rateSnapshot ??
                        0;
                    if (earningAmount > 0) {
                        await tx.employeeLedgerEntry.create({
                            data: {
                                employeeId: task.assignedEmployeeId,
                                branchId: task.orderItem.order.branchId,
                                type: shared_types_1.LedgerEntryType.EARNING,
                                amount: earningAmount,
                                orderItemTaskId: taskId,
                                createdById: updatedById,
                                note: `Earned for ${task.stepName} task`,
                            },
                        });
                    }
                }
            }
            return updatedTask;
        });
    }
    async findAllByOrder(orderId, branchId) {
        return this.prisma.orderItemTask.findMany({
            where: {
                orderItem: { orderId, order: { branchId } },
                deletedAt: null,
            },
            orderBy: [{ orderItemId: 'asc' }, { sortOrder: 'asc' }],
            include: {
                assignedEmployee: { select: { fullName: true, id: true } },
                orderItem: { select: { garmentTypeName: true, description: true } },
            },
        });
    }
    async findAllByEmployee(employeeId, branchId, userRole, requesterEmployeeId) {
        if (userRole === shared_types_1.Role.EMPLOYEE &&
            requesterEmployeeId &&
            requesterEmployeeId !== employeeId) {
            throw new common_1.ForbiddenException('Employees can only view their own assigned tasks');
        }
        return this.prisma.orderItemTask.findMany({
            where: {
                assignedEmployeeId: employeeId,
                orderItem: { order: { branchId } },
                deletedAt: null,
            },
            orderBy: { createdAt: 'desc' },
            include: {
                orderItem: {
                    select: {
                        garmentTypeName: true,
                        order: { select: { orderNumber: true, dueDate: true } },
                    },
                },
            },
        });
    }
    async updateTaskRate(taskId, rateOverride, branchId, userRole) {
        if (![shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN].includes(userRole)) {
            throw new common_1.ForbiddenException('Only Admins can override task rates');
        }
        const task = await this.prisma.orderItemTask.findFirst({
            where: {
                id: taskId,
                deletedAt: null,
                orderItem: { order: { branchId } },
            },
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        return this.prisma.orderItemTask.update({
            where: { id: taskId },
            data: { rateOverride },
            include: { assignedEmployee: { select: { fullName: true, id: true } } },
        });
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map