import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus, Role, LedgerEntryType } from '@tbms/shared-types';
import { LedgerService } from '../ledger/ledger.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledgerService: LedgerService,
  ) {}

  async assignTask(taskId: string, employeeId: string, branchId: string, assignedById: string, userRole: string) {
    if (![Role.ADMIN, Role.SUPER_ADMIN].includes(userRole as Role)) {
      throw new ForbiddenException('Only Admins can assign tasks');
    }

    const task = await this.prisma.orderItemTask.findFirst({
      where: { id: taskId, deletedAt: null, orderItem: { order: { branchId } } },
      include: { orderItem: { include: { order: true } } }
    });

    if (!task) throw new NotFoundException('Task not found');

    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, branchId }
    });

    if (!employee) throw new NotFoundException('Employee not found in this branch');

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

  async updateTaskStatus(taskId: string, status: TaskStatus, branchId: string, updatedById: string) {
    const task = await this.prisma.orderItemTask.findFirst({
      where: { id: taskId, deletedAt: null, orderItem: { order: { branchId } } },
      include: { orderItem: { include: { order: true } } }
    });

    if (!task) throw new NotFoundException('Task not found or does not belong to your branch');

    let startedAt = task.startedAt;
    let completedAt = task.completedAt;

    if (status === TaskStatus.IN_PROGRESS && task.status !== TaskStatus.IN_PROGRESS && !startedAt) {
      startedAt = new Date();
    } else if (status === TaskStatus.DONE && task.status !== TaskStatus.DONE) {
      completedAt = new Date();
      if (!startedAt) startedAt = new Date();
    }

    const updatedTask = await this.prisma.orderItemTask.update({
      where: { id: taskId },
      data: { status, startedAt, completedAt },
      include: {
        assignedEmployee: { select: { fullName: true, id: true } }
      }
    });

    // Auto-create EARNING ledger entry when task is completed
    if (status === TaskStatus.DONE && task.status !== TaskStatus.DONE && task.assignedEmployeeId) {
      const earningAmount = task.rateOverride ?? task.rateSnapshot ?? 0;
      if (earningAmount > 0) {
        await this.ledgerService.createEntry({
          employeeId: task.assignedEmployeeId,
          branchId: task.orderItem.order.branchId,
          type: LedgerEntryType.EARNING,
          amount: earningAmount,
          orderItemTaskId: taskId,
          createdById: updatedById,
          note: `Earned for ${task.stepName} task`,
        });
      }
    }

    return updatedTask;
  }

  async findAllByOrder(orderId: string, branchId: string) {
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

  async findAllByEmployee(employeeId: string, branchId: string) {
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

  async updateTaskRate(taskId: string, rateOverride: number, branchId: string, userRole: string) {
    if (![Role.ADMIN, Role.SUPER_ADMIN].includes(userRole as Role)) {
      throw new ForbiddenException('Only Admins can override task rates');
    }

    const task = await this.prisma.orderItemTask.findFirst({
      where: { id: taskId, deletedAt: null, orderItem: { order: { branchId } } }
    });

    if (!task) throw new NotFoundException('Task not found');

    return this.prisma.orderItemTask.update({
      where: { id: taskId },
      data: { rateOverride },
      include: { assignedEmployee: { select: { fullName: true, id: true } } }
    });
  }
}
