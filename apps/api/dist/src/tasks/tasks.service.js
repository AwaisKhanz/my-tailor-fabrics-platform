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
    async assignTask(taskId, employeeId, branchId, assignedById, userRole) {
        if (![shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN].includes(userRole)) {
            throw new common_1.ForbiddenException('Only Admins can assign tasks');
        }
        const task = await this.prisma.orderItemTask.findFirst({
            where: { id: taskId, deletedAt: null, orderItem: { order: { branchId } } },
            include: { orderItem: { include: { order: true } } }
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        const employee = await this.prisma.employee.findFirst({
            where: { id: employeeId, branchId }
        });
        if (!employee)
            throw new common_1.NotFoundException('Employee not found in this branch');
        return this.prisma.$transaction(async (tx) => {
            await tx.orderItemTaskAssignmentEvent.create({
                data: {
                    taskId,
                    fromEmployeeId: task.assignedEmployeeId,
                    toEmployeeId: employeeId,
                    changedById: assignedById,
                    note: 'Task assigned via branch admin'
                }
            });
            return tx.orderItemTask.update({
                where: { id: taskId },
                data: {
                    assignedEmployeeId: employeeId,
                    status: 'PENDING'
                },
                include: { assignedEmployee: true }
            });
        });
    }
    async updateTaskStatus(taskId, status, branchId, updatedById) {
        const task = await this.prisma.orderItemTask.findFirst({
            where: { id: taskId, deletedAt: null, orderItem: { order: { branchId } } }
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found or does not belong to your branch');
        let startedAt = task.startedAt;
        let completedAt = task.completedAt;
        if (status === shared_types_1.TaskStatus.IN_PROGRESS && task.status !== shared_types_1.TaskStatus.IN_PROGRESS && !startedAt) {
            startedAt = new Date();
        }
        else if (status === shared_types_1.TaskStatus.DONE && task.status !== shared_types_1.TaskStatus.DONE) {
            completedAt = new Date();
            if (!startedAt)
                startedAt = new Date();
        }
        return this.prisma.orderItemTask.update({
            where: { id: taskId },
            data: {
                status,
                startedAt,
                completedAt
            },
            include: {
                assignedEmployee: { select: { fullName: true, id: true } }
            }
        });
    }
    async findAllByOrder(orderId, branchId) {
        return this.prisma.orderItemTask.findMany({
            where: {
                orderItem: { orderId, order: { branchId } },
                deletedAt: null
            },
            orderBy: [
                { orderItemId: 'asc' },
                { sortOrder: 'asc' }
            ],
            include: {
                assignedEmployee: { select: { fullName: true, id: true } },
                orderItem: { select: { garmentTypeName: true, description: true } }
            }
        });
    }
    async findAllByEmployee(employeeId, branchId) {
        return this.prisma.orderItemTask.findMany({
            where: {
                assignedEmployeeId: employeeId,
                orderItem: { order: { branchId } },
                deletedAt: null
            },
            orderBy: { createdAt: 'desc' },
            include: {
                orderItem: { select: { garmentTypeName: true, order: { select: { orderNumber: true, dueDate: true } } } }
            }
        });
    }
    async updateTaskRate(taskId, rateOverride, branchId, userRole) {
        if (![shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN].includes(userRole)) {
            throw new common_1.ForbiddenException('Only Admins can override task rates');
        }
        const task = await this.prisma.orderItemTask.findFirst({
            where: { id: taskId, deletedAt: null, orderItem: { order: { branchId } } }
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        return this.prisma.orderItemTask.update({
            where: { id: taskId },
            data: { rateOverride },
            include: { assignedEmployee: { select: { fullName: true, id: true } } }
        });
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map