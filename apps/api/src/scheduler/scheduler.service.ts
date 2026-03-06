import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@tbms/shared-types';
import { Prisma } from '@prisma/client';
import { SalaryAccrualService } from '../payments/salary-accrual.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly salaryAccrualService: SalaryAccrualService,
  ) {}

  // Run at midnight every day
  // Alternatively, could be every hour for faster feedback if desired.
  @Cron(CronExpression.EVERY_HOUR)
  async handleOverdueOrders() {
    this.logger.log('Running CRON job: Checking for overdue orders...');
    const now = new Date();

    // Find all active orders past their due date
    const overdueCandidates = await this.prisma.order.findMany({
      where: {
        deletedAt: null,
        status: {
          in: [OrderStatus.NEW, OrderStatus.IN_PROGRESS, OrderStatus.READY],
        },
        dueDate: {
          lt: now,
        },
      },
      select: { id: true, status: true },
    });

    if (overdueCandidates.length === 0) {
      this.logger.log('No overdue orders found today.');
      return;
    }

    this.logger.log(
      `Found ${overdueCandidates.length} orders to mark as OVERDUE.`,
    );

    let successCount = 0;

    // Process them sequentially to avoid locking the whole DB
    for (const order of overdueCandidates) {
      try {
        await this.prisma.$transaction(
          async (tx: Prisma.TransactionClient) => {
            // 1. Log transition
            await tx.orderStatusHistory.create({
              data: {
                orderId: order.id,
                fromStatus: order.status,
                toStatus: OrderStatus.OVERDUE,
                actor: 'SYSTEM',
                note: 'Automated CRON task transitioned to OVERDUE.',
              },
            });

            // 2. Update status
            await tx.order.update({
              where: { id: order.id },
              data: { status: OrderStatus.OVERDUE },
            });
          },
        );
        successCount++;
      } catch (error: unknown) {
        this.logger.error(
          `Failed to mark order ${order.id} as OVERDUE`,
          error instanceof Error ? error.stack : JSON.stringify(error),
        );
      }
    }

    this.logger.log(
      `Successfully marked ${successCount} out of ${overdueCandidates.length} orders as OVERDUE.`,
    );
  }

  @Cron('10 0 * * *', { timeZone: 'Asia/Karachi' })
  async handleMonthlySalaryAccruals() {
    this.logger.log(
      'Running CRON job: generating monthly salary accruals for active branches...',
    );

    const branches = await this.prisma.branch.findMany({
      where: {
        deletedAt: null,
        isActive: true,
      },
      select: {
        id: true,
        code: true,
      },
    });

    if (branches.length === 0) {
      this.logger.log('No active branches found for salary accrual generation.');
      return;
    }

    for (const branch of branches) {
      try {
        const result = await this.salaryAccrualService.generateForMonth({
          branchId: branch.id,
          source: 'SCHEDULED',
        });
        this.logger.log(
          `Salary accruals (${branch.code}): created=${result.created}, existing=${result.alreadyExists}, skipped=${result.skipped}, period=${result.period}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to generate salary accruals for branch ${branch.code} (${branch.id})`,
          error instanceof Error ? error.stack : JSON.stringify(error),
        );
      }
    }
  }
}
