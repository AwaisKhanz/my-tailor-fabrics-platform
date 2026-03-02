import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { TaskStatus, Role, LedgerEntryType } from '@tbms/shared-types';
import { LedgerService } from '../ledger/ledger.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledgerService: LedgerService,
  ) {}

  async assignTask(
    taskId: string,
    employeeId: string,
    branchId: string,
    assignedById: string,
    userRole: string,
  ) {
    if (![Role.ADMIN, Role.SUPER_ADMIN].includes(userRole as Role)) {
      throw new ForbiddenException('Only Admins can assign tasks');
    }

    const task = await this.prisma.orderItemTask.findFirst({
      where: {
        id: taskId,
        orderItem: { order: { branchId } },
      },
    });

    if (!task) throw new NotFoundException('Task not found');

    return this.prisma.orderItemTask.update({
      where: { id: taskId },
      data: {
        assignedEmployeeId: employeeId,
      },
    });
  }

  async updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    branchId: string,
    updatedById: string,
  ) {
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

    if (!task) throw new NotFoundException('Task not found');

    // If starting a task that was pending
    const data: Prisma.OrderItemTaskUpdateInput = { status };
    if (status === TaskStatus.IN_PROGRESS && !task.startedAt) {
      data.startedAt = new Date();
    }
    if (status === TaskStatus.DONE && !task.completedAt) {
      data.completedAt = new Date();
    }

    const updatedTask = await this.prisma.orderItemTask.update({
      where: { id: taskId },
      data,
    });

    // If completed, record earnings for the employee
    if (status === TaskStatus.DONE && task.assignedEmployeeId) {
      // Logic: override > designType.rate > snapshot
      const earningAmount =
        task.rateOverride ??
        task.designType?.defaultRate ??
        task.rateSnapshot ??
        0;
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
        deletedAt: null,
      },
      orderBy: [{ orderItemId: 'asc' }, { sortOrder: 'asc' }],
      include: {
        assignedEmployee: { select: { fullName: true, id: true } },
        orderItem: { select: { garmentTypeName: true, description: true } },
      },
    });
  }

  async findAllByEmployee(employeeId: string, branchId: string) {
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

  async updateTaskRate(
    taskId: string,
    rateOverride: number,
    branchId: string,
    userRole: string,
  ) {
    if (![Role.ADMIN, Role.SUPER_ADMIN].includes(userRole as Role)) {
      throw new ForbiddenException('Only Admins can override task rates');
    }

    const task = await this.prisma.orderItemTask.findFirst({
      where: {
        id: taskId,
        deletedAt: null,
        orderItem: { order: { branchId } },
      },
    });

    if (!task) throw new NotFoundException('Task not found');

    return this.prisma.orderItemTask.update({
      where: { id: taskId },
      data: { rateOverride },
      include: { assignedEmployee: { select: { fullName: true, id: true } } },
    });
  }
}
