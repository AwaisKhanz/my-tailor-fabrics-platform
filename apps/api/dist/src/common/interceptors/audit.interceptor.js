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
var AuditInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AuditInterceptor = AuditInterceptor_1 = class AuditInterceptor {
    prisma;
    logger = new common_1.Logger(AuditInterceptor_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async intercept(context, next) {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const method = request.method;
        if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            return next.handle();
        }
        const { user, body, url, params } = request;
        if (!user?.userId)
            return next.handle();
        let action = 'UPDATE';
        if (method === 'POST')
            action = 'CREATE';
        if (method === 'DELETE')
            action = 'DELETE';
        if (url.includes('login'))
            action = 'LOGIN';
        const pathParts = url.split('/').filter(Boolean);
        let entity = 'Unknown';
        if (pathParts.includes('customers'))
            entity = 'Customer';
        else if (pathParts.includes('employees'))
            entity = 'Employee';
        else if (pathParts.includes('orders'))
            entity = 'Order';
        else if (pathParts.includes('payments'))
            entity = 'Payment';
        else if (pathParts.includes('expenses'))
            entity = 'Expense';
        else if (pathParts.includes('branches'))
            entity = 'Branch';
        else if (pathParts.includes('users'))
            entity = 'User';
        else if (pathParts.includes('garment-types'))
            entity = 'GarmentType';
        else if (pathParts.includes('measurement-categories'))
            entity = 'MeasurementCategory';
        const entityId = params?.id || body?.id || 'unknown';
        let oldValue = null;
        if (['PUT', 'PATCH', 'DELETE'].includes(method) &&
            entity !== 'Unknown' &&
            entityId !== 'unknown') {
            try {
                const modelName = entity.charAt(0).toLowerCase() + entity.slice(1);
                if (this.prisma[modelName]) {
                    oldValue = await this.prisma[modelName].findUnique({
                        where: { id: entityId },
                    });
                }
            }
            catch (err) {
                this.logger.warn(`Could not fetch oldValue for ${entity}:${entityId}`);
            }
        }
        return next.handle().pipe((0, operators_1.tap)((response) => {
            const entityIdFromRes = response?.data?.id || response?.id || entityId;
            this.prisma.auditLog
                .create({
                data: {
                    userId: user.userId,
                    action,
                    entity,
                    entityId: String(entityIdFromRes),
                    branchId: user.branchId || null,
                    oldValue: oldValue
                        ? oldValue
                        : client_1.Prisma.JsonNull,
                    newValue: method === 'DELETE'
                        ? client_1.Prisma.JsonNull
                        : body
                            ? body
                            : client_1.Prisma.JsonNull,
                    ipAddress: request.ip,
                    userAgent: request.headers['user-agent'],
                },
            })
                .catch((err) => {
                this.logger.error('Audit Log failed:', err);
            });
        }));
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = AuditInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map