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
    async resolvePrices(garmentTypeId, branchId) {
        const [global, override] = await Promise.all([
            this.prisma.garmentType.findUniqueOrThrow({ where: { id: garmentTypeId } }),
            this.prisma.branchGarmentPrice.findUnique({
                where: { branchId_garmentTypeId: { branchId, garmentTypeId } }
            }),
        ]);
        return {
            customerPrice: override?.customerPrice ?? global.customerPrice,
            employeeRate: override?.employeeRate ?? global.employeeRate,
            garmentTypeName: global.name
        };
    }
    async getGarmentTypes(options = {}) {
        const { branchId, search, page = 1, limit = 10 } = options;
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
                    measurementCategories: true,
                    branchOverrides: branchId ? { where: { branchId } } : true
                }
            })
        ]);
        const data = types.map((t) => {
            const overrides = t.branchOverrides || [];
            const override = branchId ? overrides[0] : null;
            const resolvedCustomerPrice = override?.customerPrice ?? t.customerPrice;
            const resolvedEmployeeRate = override?.employeeRate ?? t.employeeRate;
            return {
                ...t,
                resolvedCustomerPrice,
                resolvedEmployeeRate,
                isOverridden: !!override,
                overridesCount: overrides.length,
                marginAmount: resolvedCustomerPrice - resolvedEmployeeRate,
                marginPercentage: resolvedCustomerPrice > 0 ? Math.round(((resolvedCustomerPrice - resolvedEmployeeRate) / resolvedCustomerPrice) * 100) : 0,
                priceOffset: resolvedCustomerPrice - t.customerPrice
            };
        });
        return { data, total };
    }
    async getGarmentType(id, branchId) {
        const garment = await this.prisma.garmentType.findUniqueOrThrow({
            where: { id, deletedAt: null },
            include: {
                measurementCategories: {
                    include: { fields: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } } }
                },
                branchOverrides: branchId ? { where: { branchId } } : true
            }
        });
        const overrides = garment.branchOverrides || [];
        const override = branchId ? overrides[0] : null;
        const resolvedCustomerPrice = override?.customerPrice ?? garment.customerPrice;
        const resolvedEmployeeRate = override?.employeeRate ?? garment.employeeRate;
        return {
            ...garment,
            resolvedCustomerPrice,
            resolvedEmployeeRate,
            isOverridden: !!override,
            overridesCount: overrides.length,
            marginAmount: resolvedCustomerPrice - resolvedEmployeeRate,
            marginPercentage: resolvedCustomerPrice > 0 ? Math.round(((resolvedCustomerPrice - resolvedEmployeeRate) / resolvedCustomerPrice) * 100) : 0,
            priceOffset: resolvedCustomerPrice - garment.customerPrice
        };
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
    async updateGarmentType(id, dto) {
        await this.prisma.garmentType.findUniqueOrThrow({ where: { id } });
        const { measurementCategoryIds, ...data } = dto;
        return this.prisma.garmentType.update({
            where: { id },
            data: {
                ...data,
                measurementCategories: measurementCategoryIds ? {
                    set: measurementCategoryIds.map(id => ({ id }))
                } : undefined
            }
        });
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
    async getBranchPrices(garmentTypeId) {
        return this.prisma.branchGarmentPrice.findMany({
            where: { garmentTypeId },
            include: { branch: true }
        });
    }
    async setBranchPrice(garmentTypeId, branchId, dto, userId) {
        const current = await this.prisma.branchGarmentPrice.findUnique({
            where: { branchId_garmentTypeId: { branchId, garmentTypeId } }
        });
        const result = await this.prisma.branchGarmentPrice.upsert({
            where: { branchId_garmentTypeId: { branchId, garmentTypeId } },
            create: {
                branchId,
                garmentTypeId,
                customerPrice: dto.customerPrice,
                employeeRate: dto.employeeRate
            },
            update: {
                customerPrice: dto.customerPrice,
                employeeRate: dto.employeeRate
            }
        });
        await this.prisma.branchPriceLog.create({
            data: {
                branch: { connect: { id: branchId } },
                garmentType: { connect: { id: garmentTypeId } },
                changedBy: { connect: { id: userId } },
                oldCustomerPrice: current?.customerPrice ?? null,
                oldEmployeeRate: current?.employeeRate ?? null,
                newCustomerPrice: dto.customerPrice,
                newEmployeeRate: dto.employeeRate,
                action: 'UPDATE'
            }
        });
        return result;
    }
    async deleteBranchPrice(garmentTypeId, branchId, userId) {
        const current = await this.prisma.branchGarmentPrice.findUnique({
            where: { branchId_garmentTypeId: { branchId, garmentTypeId } }
        });
        if (!current)
            return;
        const result = await this.prisma.branchGarmentPrice.delete({
            where: { branchId_garmentTypeId: { branchId, garmentTypeId } }
        });
        await this.prisma.branchPriceLog.create({
            data: {
                branch: { connect: { id: branchId } },
                garmentType: { connect: { id: garmentTypeId } },
                changedBy: { connect: { id: userId } },
                oldCustomerPrice: current.customerPrice,
                oldEmployeeRate: current.employeeRate,
                newCustomerPrice: null,
                newEmployeeRate: null,
                action: 'RESET'
            }
        });
        return result;
    }
    async getBranchPriceHistory(garmentTypeId, branchId) {
        return this.prisma.branchPriceLog.findMany({
            where: { garmentTypeId, branchId },
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