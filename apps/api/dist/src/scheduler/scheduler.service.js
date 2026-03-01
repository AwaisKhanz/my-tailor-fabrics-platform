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
var SchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const shared_types_1 = require("@tbms/shared-types");
let SchedulerService = SchedulerService_1 = class SchedulerService {
    prisma;
    logger = new common_1.Logger(SchedulerService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async handleOverdueOrders() {
        this.logger.log('Running CRON job: Checking for overdue orders...');
        const now = new Date();
        const overdueCandidates = await this.prisma.order.findMany({
            where: {
                deletedAt: null,
                status: {
                    in: [shared_types_1.OrderStatus.NEW, shared_types_1.OrderStatus.IN_PROGRESS, shared_types_1.OrderStatus.READY]
                },
                dueDate: {
                    lt: now
                }
            },
            select: { id: true, status: true }
        });
        if (overdueCandidates.length === 0) {
            this.logger.log('No overdue orders found today.');
            return;
        }
        this.logger.log(`Found ${overdueCandidates.length} orders to mark as OVERDUE.`);
        let successCount = 0;
        for (const order of overdueCandidates) {
            try {
                await this.prisma.$transaction(async (tx) => {
                    await tx.orderStatusHistory.create({
                        data: {
                            orderId: order.id,
                            fromStatus: order.status,
                            toStatus: shared_types_1.OrderStatus.OVERDUE,
                            actor: 'SYSTEM',
                            note: 'Automated CRON task transitioned to OVERDUE.'
                        }
                    });
                    await tx.order.update({
                        where: { id: order.id },
                        data: { status: shared_types_1.OrderStatus.OVERDUE }
                    });
                });
                successCount++;
            }
            catch (err) {
                this.logger.error(`Failed to mark order ${order.id} as OVERDUE:`, err);
            }
        }
        this.logger.log(`Successfully marked ${successCount} out of ${overdueCandidates.length} orders as OVERDUE.`);
    }
};
exports.SchedulerService = SchedulerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "handleOverdueOrders", null);
exports.SchedulerService = SchedulerService = SchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SchedulerService);
//# sourceMappingURL=scheduler.service.js.map