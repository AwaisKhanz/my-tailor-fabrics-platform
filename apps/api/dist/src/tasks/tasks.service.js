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
const ledger_service_1 = require("../ledger/ledger.service");
let TasksService = class TasksService {
    prisma;
    ledgerService;
    constructor(prisma, ledgerService) {
        this.prisma = prisma;
        this.ledgerService = ledgerService;
    }
    async assignTask(taskId, employeeId, branchId, assignedById, userRole) {
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
    async updateTaskStatus(taskId, status, branchId, updatedById) {
        const task = await this.prisma.orderItemTask.findFirst({
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
        const data = { status };
        if (status === shared_types_1.TaskStatus.IN_PROGRESS && !task.startedAt) {
            data.startedAt = new Date();
        }
        if (status === shared_types_1.TaskStatus.DONE && !task.completedAt) {
            data.completedAt = new Date();
        }
        const updatedTask = await this.prisma.orderItemTask.update({
            where: { id: taskId },
            data,
        });
        if (status === shared_types_1.TaskStatus.DONE && task.assignedEmployeeId) {
            const earningAmount = task.rateOverride ??
                task.designType?.defaultRate ??
                task.rateSnapshot ??
                0;
            if (earningAmount > 0) {
                await this.ledgerService.createEntry({
                    employeeId: task.assignedEmployeeId,
                    branchId: task.orderItem.order.branchId,
                    type: shared_types_1.LedgerEntryType.EARNING,
                    amount: earningAmount,
                    orderItemTaskId: taskId,
                    createdById: updatedById,
                    note: `Earned for ${task.stepName} task`,
                });
            }
        }
        return updatedTask;
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
    async findAllByEmployee(employeeId, branchId) {
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ledger_service_1.LedgerService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map