import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { TaskStatus, Role, LedgerEntryType } from '@tbms/shared-types';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async assignTask(
    taskId: string,
    employeeId: string,
    branchId: string,
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
    userRole: string,
    requesterEmployeeId: string | null,
  ) {
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

      if (!task) throw new NotFoundException('Task not found');

      if (userRole === Role.EMPLOYEE) {
        if (!requesterEmployeeId) {
          throw new ForbiddenException('Employee identity is missing');
        }
        if (task.assignedEmployeeId !== requesterEmployeeId) {
          throw new ForbiddenException(
            'Employees can only update their own assigned tasks',
          );
        }
      }

      const data: Prisma.OrderItemTaskUpdateInput = { status };
      if (status === TaskStatus.IN_PROGRESS && !task.startedAt) {
        data.startedAt = new Date();
      }
      if (status === TaskStatus.DONE && !task.completedAt) {
        data.completedAt = new Date();
      }

      const updatedTask = await tx.orderItemTask.update({
        where: { id: taskId },
        data,
      });

      // Idempotent earnings record: only one active EARNING entry per task.
      const becameDone = status === TaskStatus.DONE && !task.completedAt;
      if (becameDone && task.assignedEmployeeId) {
        const existingEntry = await tx.employeeLedgerEntry.findFirst({
          where: {
            orderItemTaskId: taskId,
            type: LedgerEntryType.EARNING,
            deletedAt: null,
          },
          select: { id: true },
        });

        if (!existingEntry) {
          const earningAmount =
            task.rateOverride ??
            task.designType?.defaultRate ??
            task.rateSnapshot ??
            0;

          if (earningAmount > 0) {
            await tx.employeeLedgerEntry.create({
              data: {
                employeeId: task.assignedEmployeeId,
                branchId: task.orderItem.order.branchId,
                type: LedgerEntryType.EARNING,
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

  async findAllByEmployee(
    employeeId: string,
    branchId: string,
    userRole: string,
    requesterEmployeeId: string | null,
  ) {
    if (
      userRole === Role.EMPLOYEE &&
      requesterEmployeeId &&
      requesterEmployeeId !== employeeId
    ) {
      throw new ForbiddenException(
        'Employees can only view their own assigned tasks',
      );
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
