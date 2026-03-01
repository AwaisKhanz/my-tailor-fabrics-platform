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
exports.ConfigService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ConfigService = class ConfigService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getBranches() {
        return this.prisma.branch.findMany({
            orderBy: { createdAt: 'desc' },
            where: { isActive: true }
        });
    }
    async getSystemSettings() {
        let settings = await this.prisma.systemSettings.findUnique({
            where: { id: "default" }
        });
        if (!settings) {
            settings = await this.prisma.systemSettings.create({
                data: { id: "default" }
            });
        }
        return settings;
    }
    async updateSystemSettings(dto) {
        const settings = await this.prisma.systemSettings.upsert({
            where: { id: "default" },
            update: dto,
            create: { id: "default", ...dto }
        });
        return settings;
    }
    async getGarmentTypes(options = {}) {
        const { search, page = 1, limit = 10 } = options;
        const skip = (page - 1) * limit;
        const where = { isActive: true, deletedAt: null };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }
        const [total, types] = await Promise.all([
            this.prisma.garmentType.count({ where }),
            this.prisma.garmentType.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    measurementCategories: true
                }
            })
        ]);
        const data = types.map((t) => {
            return {
                ...t,
                marginAmount: t.customerPrice - t.employeeRate,
                marginPercentage: t.customerPrice > 0 ? Math.round(((t.customerPrice - t.employeeRate) / t.customerPrice) * 100) : 0
            };
        });
        return { data, total };
    }
    async getGarmentType(id) {
        const garment = await this.prisma.garmentType.findUniqueOrThrow({
            where: { id, deletedAt: null },
            include: {
                measurementCategories: {
                    where: { deletedAt: null },
                    include: { fields: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } } }
                },
                priceLogs: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        changedBy: { select: { name: true } }
                    }
                }
            }
        });
        const orderStats = await this.prisma.orderItem.aggregate({
            where: { garmentTypeId: id, deletedAt: null },
            _count: { id: true },
            _sum: { unitPrice: true, employeeRate: true },
        });
        const activeOrdersCount = await this.prisma.orderItem.count({
            where: {
                garmentTypeId: id,
                status: { in: ['PENDING', 'IN_PROGRESS'] },
                deletedAt: null
            }
        });
        const topTailorsData = await this.prisma.orderItem.groupBy({
            by: ['employeeId'],
            where: {
                garmentTypeId: id,
                employeeId: { not: null },
                status: 'COMPLETED',
                deletedAt: null
            },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 3
        });
        const topTailors = await Promise.all(topTailorsData.map(async (t) => {
            const employee = await this.prisma.employee.findUnique({
                where: { id: t.employeeId },
                select: { fullName: true }
            });
            return {
                name: employee?.fullName || "Removed Employee",
                count: t._count.id
            };
        }));
        const result = {
            ...garment,
            marginAmount: garment.customerPrice - garment.employeeRate,
            marginPercentage: garment.customerPrice > 0 ? Math.round(((garment.customerPrice - garment.employeeRate) / garment.customerPrice) * 100) : 0,
            priceLogs: (garment.priceLogs || []).map(log => ({
                ...log,
                changedBy: { name: log.changedBy.name }
            })),
            measurementCategories: (garment.measurementCategories || []).map((cat) => ({
                ...cat,
                fields: (cat.fields || []).map((f) => ({
                    ...f,
                    fieldType: f.fieldType
                }))
            })),
            analytics: {
                totalOrders: orderStats._count.id,
                activeOrders: activeOrdersCount,
                totalRevenue: orderStats._sum.unitPrice || 0,
                totalPayout: orderStats._sum.employeeRate || 0,
                avgActualPrice: orderStats._count.id > 0 ? Math.round((orderStats._sum.unitPrice || 0) / orderStats._count.id) : garment.customerPrice,
                topTailors
            }
        };
        return result;
    }
    async createGarmentType(dto) {
        const { measurementCategoryIds, ...data } = dto;
        return this.prisma.garmentType.create({
            data: {
                ...data,
                measurementCategories: measurementCategoryIds ? {
                    connect: measurementCategoryIds.map(id => ({ id }))
                } : undefined
            }
        });
    }
    async updateGarmentType(id, dto, userId) {
        const current = await this.prisma.garmentType.findUniqueOrThrow({ where: { id } });
        const { measurementCategoryIds, ...data } = dto;
        const result = await this.prisma.garmentType.update({
            where: { id },
            data: {
                ...data,
                measurementCategories: measurementCategoryIds ? {
                    set: measurementCategoryIds.map(id => ({ id }))
                } : undefined
            }
        });
        if ((dto.customerPrice !== undefined && dto.customerPrice !== current.customerPrice) ||
            (dto.employeeRate !== undefined && dto.employeeRate !== current.employeeRate)) {
            await this.prisma.garmentPriceLog.create({
                data: {
                    garmentType: { connect: { id } },
                    changedBy: { connect: { id: userId } },
                    oldCustomerPrice: current.customerPrice,
                    oldEmployeeRate: current.employeeRate,
                    newCustomerPrice: dto.customerPrice ?? current.customerPrice,
                    newEmployeeRate: dto.employeeRate ?? current.employeeRate,
                    action: 'UPDATE'
                }
            });
        }
        return result;
    }
    async deleteGarmentType(id) {
        await this.prisma.garmentType.findUniqueOrThrow({ where: { id, deletedAt: null } });
        return this.prisma.garmentType.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
    }
    async getGarmentStats() {
        const [totalCount, activeProduction, prices] = await Promise.all([
            this.prisma.garmentType.count({ where: { deletedAt: null } }),
            this.prisma.garmentType.count({ where: { deletedAt: null, isActive: true } }),
            this.prisma.garmentType.findMany({
                where: { deletedAt: null },
                select: { customerPrice: true }
            })
        ]);
        const avgRetailPrice = prices.length > 0
            ? prices.reduce((sum, p) => sum + p.customerPrice, 0) / prices.length
            : 0;
        return {
            totalCount,
            avgRetailPrice,
            activeProduction
        };
    }
    async getGarmentPriceHistory(garmentTypeId) {
        return this.prisma.garmentPriceLog.findMany({
            where: { garmentTypeId },
            orderBy: { createdAt: 'desc' },
            include: {
                changedBy: { select: { name: true, email: true } },
                garmentType: { select: { name: true } }
            }
        });
    }
    async getMeasurementCategories(options = {}) {
        const { search, page = 1, limit = 10 } = options;
        const skip = (page - 1) * limit;
        const where = { isActive: true, deletedAt: null };
        if (search) {
            where.name = { contains: search, mode: 'insensitive' };
        }
        const [total, data] = await Promise.all([
            this.prisma.measurementCategory.count({ where }),
            this.prisma.measurementCategory.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: { fields: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } } }
            })
        ]);
        return { data, total };
    }
    async createMeasurementCategory(dto) {
        const { fields, ...data } = dto;
        const createData = {
            ...data,
            name: data.name,
            fields: fields ? {
                create: fields.map(f => ({
                    label: f.label,
                    fieldType: f.fieldType,
                    unit: f.unit,
                    isRequired: f.isRequired,
                    sortOrder: f.sortOrder,
                    dropdownOptions: f.dropdownOptions
                }))
            } : undefined
        };
        return this.prisma.measurementCategory.create({
            data: createData
        });
    }
    async updateMeasurementCategory(id, dto) {
        await this.prisma.measurementCategory.findUniqueOrThrow({ where: { id } });
        return this.prisma.measurementCategory.update({
            where: { id },
            data: dto
        });
    }
    async addMeasurementField(categoryId, dto) {
        const label = dto.label;
        const category = await this.prisma.measurementCategory.findUniqueOrThrow({
            where: { id: categoryId },
            include: { fields: { where: { deletedAt: null } } }
        });
        const isDuplicate = category.fields.some(f => f.label.toLowerCase() === label.toLowerCase());
        if (isDuplicate) {
            throw new common_1.ConflictException(`A field with label "${label}" already exists in this category.`);
        }
        return this.prisma.measurementField.create({
            data: { ...dto, categoryId }
        });
    }
    async updateMeasurementField(id, dto) {
        const field = await this.prisma.measurementField.findUniqueOrThrow({ where: { id } });
        if (dto.label) {
            const label = dto.label;
            const category = await this.prisma.measurementCategory.findUniqueOrThrow({
                where: { id: field.categoryId },
                include: { fields: { where: { deletedAt: null, NOT: { id } } } }
            });
            const isDuplicate = category.fields.some(f => f.label.toLowerCase() === label.toLowerCase());
            if (isDuplicate) {
                throw new common_1.ConflictException(`A field with label "${label}" already exists in this category.`);
            }
        }
        return this.prisma.measurementField.update({
            where: { id },
            data: dto
        });
    }
    async deleteMeasurementField(id) {
        await this.prisma.measurementField.findUniqueOrThrow({ where: { id, deletedAt: null } });
        return this.prisma.measurementField.update({ where: { id }, data: { deletedAt: new Date() } });
    }
    async deleteMeasurementCategory(id) {
        await this.prisma.measurementCategory.findUniqueOrThrow({ where: { id, deletedAt: null } });
        return this.prisma.measurementCategory.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
    }
};
exports.ConfigService = ConfigService;
exports.ConfigService = ConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConfigService);
//# sourceMappingURL=config.service.js.map