import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, TaskStatus as PrismaTaskStatus } from '@prisma/client';
import { TaskStatus, LedgerEntryType, Role } from '@tbms/shared-types';
import { getEffectiveTaskRate } from '@tbms/shared-constants';
import { requireEmployeeInScope } from '../common/utils/employee-scope.util';
import { EmployeesService } from '../employees/employees.service';

type LedgerSyncResult = {
  created: number;
  updated: number;
  deleted: number;
};

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly employeesService: EmployeesService,
  ) {}

  private resolveEffectiveTaskRate(task: {
    rateSnapshot?: number | null;
    rateOverride?: number | null;
    designRateSnapshot?: number | null;
  }): number {
    return getEffectiveTaskRate(
      task.rateSnapshot,
      task.rateOverride,
      task.designRateSnapshot,
    );
  }

  private async deactivateTaskEarningEntries(
    tx: Prisma.TransactionClient,
    taskId: string,
  ): Promise<number> {
    const result = await tx.employeeLedgerEntry.updateMany({
      where: {
        orderItemTaskId: taskId,
        type: LedgerEntryType.EARNING,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return result.count;
  }

  private async syncTaskEarningEntry(
    tx: Prisma.TransactionClient,
    params: {
      taskId: string;
      employeeId: string;
      branchId: string;
      stepName: string;
      effectiveRate: number;
      createdById: string;
    },
  ): Promise<LedgerSyncResult> {
    const activeEntries = await tx.employeeLedgerEntry.findMany({
      where: {
        orderItemTaskId: params.taskId,
        type: LedgerEntryType.EARNING,
        deletedAt: null,
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: { id: true },
    });

    const activeEntryIds = activeEntries.map((entry) => entry.id);

    if (params.effectiveRate <= 0) {
      if (activeEntryIds.length === 0) {
        return { created: 0, updated: 0, deleted: 0 };
      }

      const deleted = await this.deactivateTaskEarningEntries(
        tx,
        params.taskId,
      );
      return { created: 0, updated: 0, deleted };
    }

    const [primaryEntry, ...duplicateEntries] = activeEntries;

    if (!primaryEntry) {
      await tx.employeeLedgerEntry.create({
        data: {
          employeeId: params.employeeId,
          branchId: params.branchId,
          type: LedgerEntryType.EARNING,
          amount: params.effectiveRate,
          orderItemTaskId: params.taskId,
          createdById: params.createdById,
          note: `Earned for ${params.stepName} task`,
        },
      });

      return { created: 1, updated: 0, deleted: 0 };
    }

    await tx.employeeLedgerEntry.update({
      where: { id: primaryEntry.id },
      data: {
        employeeId: params.employeeId,
        branchId: params.branchId,
        amount: params.effectiveRate,
        note: `Earned for ${params.stepName} task`,
        deletedAt: null,
      },
    });

    let deleted = 0;
    if (duplicateEntries.length > 0) {
      const result = await tx.employeeLedgerEntry.updateMany({
        where: {
          id: {
            in: duplicateEntries.map((entry) => entry.id),
          },
        },
        data: {
          deletedAt: new Date(),
        },
      });
      deleted = result.count;
    }

    return { created: 0, updated: 1, deleted };
  }

  async reconcileTaskEarnings(branchId: string | null, updatedById: string) {
    return this.prisma.$transaction(async (tx) => {
      const tasks = await tx.orderItemTask.findMany({
        where: {
          deletedAt: null,
          orderItem: {
            order: {
              deletedAt: null,
              ...(branchId ? { branchId } : {}),
            },
          },
        },
        select: {
          id: true,
          stepName: true,
          status: true,
          assignedEmployeeId: true,
          rateOverride: true,
          rateSnapshot: true,
          designRateSnapshot: true,
          orderItem: {
            select: {
              order: {
                select: {
                  branchId: true,
                },
              },
            },
          },
        },
      });

      const counters = {
        processedTasks: tasks.length,
        doneTasks: 0,
        createdEntries: 0,
        updatedEntries: 0,
        deletedEntries: 0,
      };

      for (const task of tasks) {
        if (task.status === PrismaTaskStatus.DONE && task.assignedEmployeeId) {
          counters.doneTasks += 1;
          const syncResult = await this.syncTaskEarningEntry(tx, {
            taskId: task.id,
            employeeId: task.assignedEmployeeId,
            branchId: task.orderItem.order.branchId,
            stepName: task.stepName,
            effectiveRate: this.resolveEffectiveTaskRate(task),
            createdById: updatedById,
          });
          counters.createdEntries += syncResult.created;
          counters.updatedEntries += syncResult.updated;
          counters.deletedEntries += syncResult.deleted;
          continue;
        }

        counters.deletedEntries += await this.deactivateTaskEarningEntries(
          tx,
          task.id,
        );
      }

      return counters;
    });
  }

  async assignTask(
    taskId: string,
    employeeId: string | null,
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
          select: {
            garmentTypeId: true,
            order: {
              select: {
                branchId: true,
              },
            },
          },
        },
      },
    });

    if (!task) throw new NotFoundException('Task not found');

    if (employeeId) {
      await requireEmployeeInScope(this.prisma, {
        employeeId,
        branchId,
        requireActive: true,
        inactiveMessage: 'Task can only be assigned to active employees',
        inactiveViolation: 'forbidden',
        wrongBranchMessage:
          'Cannot assign task to an employee from another branch',
      });

      await this.employeesService.assertEmployeeEligibleForAssignment({
        employeeId,
        branchId: task.orderItem.order.branchId,
        garmentTypeId: task.orderItem.garmentTypeId,
        stepKey: task.stepKey,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const taskInTransaction = await tx.orderItemTask.findUnique({
        where: { id: taskId },
        include: {
          orderItem: {
            include: {
              order: {
                select: {
                  branchId: true,
                },
              },
            },
          },
        },
      });

      if (!taskInTransaction) {
        throw new NotFoundException('Task not found');
      }

      const updatedTask = await tx.orderItemTask.update({
        where: { id: taskId },
        data: {
          assignedEmployeeId: employeeId,
        },
      });

      if (updatedTask.status === PrismaTaskStatus.DONE && employeeId) {
        await this.syncTaskEarningEntry(tx, {
          taskId: updatedTask.id,
          employeeId,
          branchId: taskInTransaction.orderItem.order.branchId,
          stepName: updatedTask.stepName,
          effectiveRate: this.resolveEffectiveTaskRate(updatedTask),
          createdById: updatedById,
        });
      } else {
        await this.deactivateTaskEarningEntries(tx, taskId);
      }

      return updatedTask;
    });
  }

  async getEligibleEmployeesForTask(taskId: string, branchId: string) {
    const task = await this.prisma.orderItemTask.findFirst({
      where: {
        id: taskId,
        deletedAt: null,
        orderItem: {
          deletedAt: null,
          order: {
            branchId,
            deletedAt: null,
          },
        },
      },
      select: {
        id: true,
        stepKey: true,
        orderItem: {
          select: {
            garmentTypeId: true,
            order: {
              select: {
                branchId: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.employeesService.getEligibleEmployees({
      branchId: task.orderItem.order.branchId,
      garmentTypeId: task.orderItem.garmentTypeId,
      stepKey: task.stepKey,
    });
  }

  async updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    branchId: string,
    updatedById: string,
    userRole: Role,
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

      if (status === TaskStatus.DONE && task.assignedEmployeeId) {
        await this.syncTaskEarningEntry(tx, {
          taskId,
          employeeId: task.assignedEmployeeId,
          branchId: task.orderItem.order.branchId,
          stepName: task.stepName,
          effectiveRate: this.resolveEffectiveTaskRate(task),
          createdById: updatedById,
        });
      } else {
        await this.deactivateTaskEarningEntries(tx, taskId);
      }

      return updatedTask;
    });
  }

  async findAllByOrder(orderId: string, branchId: string | null) {
    return this.prisma.orderItemTask.findMany({
      where: {
        orderItem: {
          orderId,
          ...(branchId ? { order: { branchId } } : {}),
        },
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
    branchId: string | null,
    userRole: Role,
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
        orderItem: {
          ...(branchId ? { order: { branchId } } : {}),
        },
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
    updatedById: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const task = await tx.orderItemTask.findFirst({
        where: {
          id: taskId,
          deletedAt: null,
          orderItem: { order: { branchId } },
        },
        include: {
          orderItem: {
            include: {
              order: {
                select: {
                  branchId: true,
                },
              },
            },
          },
        },
      });

      if (!task) throw new NotFoundException('Task not found');

      const updatedTask = await tx.orderItemTask.update({
        where: { id: taskId },
        data: { rateOverride },
        include: { assignedEmployee: { select: { fullName: true, id: true } } },
      });

      if (
        updatedTask.status === PrismaTaskStatus.DONE &&
        updatedTask.assignedEmployeeId
      ) {
        await this.syncTaskEarningEntry(tx, {
          taskId: updatedTask.id,
          employeeId: updatedTask.assignedEmployeeId,
          branchId: task.orderItem.order.branchId,
          stepName: updatedTask.stepName,
          effectiveRate: this.resolveEffectiveTaskRate(updatedTask),
          createdById: updatedById,
        });
      } else {
        await this.deactivateTaskEarningEntries(tx, updatedTask.id);
      }

      return updatedTask;
    });
  }
}
