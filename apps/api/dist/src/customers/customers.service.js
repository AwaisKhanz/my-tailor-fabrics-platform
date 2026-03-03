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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const search_service_1 = require("../search/search.service");
let CustomersService = class CustomersService {
    prisma;
    searchService;
    constructor(prisma, searchService) {
        this.prisma = prisma;
        this.searchService = searchService;
    }
    async generateSizeNumber(branchId) {
        const branch = await this.prisma.branch.findUnique({
            where: { id: branchId },
        });
        if (!branch)
            throw new common_1.NotFoundException('Branch not found');
        const prefix = `C-${branch.code}-`;
        const lastCustomer = await this.prisma.customer.findFirst({
            where: { branchId, sizeNumber: { startsWith: prefix } },
            orderBy: { sizeNumber: 'desc' },
        });
        let nextNumber = 1;
        if (lastCustomer) {
            const parts = lastCustomer.sizeNumber.split('-');
            if (parts.length === 3)
                nextNumber = parseInt(parts[2], 10) + 1;
        }
        return `${prefix}${String(nextNumber).padStart(4, '0')}`;
    }
    async create(createCustomerDto, branchId) {
        const sizeNumber = await this.generateSizeNumber(branchId);
        return this.prisma.customer.create({
            data: { ...createCustomerDto, sizeNumber, branchId },
        });
    }
    async findAll(branchId, page = 1, limit = 20, search, isVip, status) {
        if (search && search.trim().length >= 2) {
            const results = await this.searchService.searchCustomers(search, branchId, limit);
            return {
                data: results,
                meta: { total: results.length, page: 1, lastPage: 1 },
            };
        }
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
            ...(branchId ? { branchId } : {}),
            ...(typeof isVip === 'boolean' ? { isVip } : {}),
            ...(status ? { status } : {}),
        };
        const [data, total] = await Promise.all([
            this.prisma.customer.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.customer.count({ where }),
        ]);
        return { data, meta: { total, page, lastPage: Math.ceil(total / limit) } };
    }
    async findOne(id, branchId) {
        const customer = await this.prisma.customer.findFirst({
            where: {
                id,
                deletedAt: null,
                ...(branchId ? { branchId } : {}),
            },
            include: { measurements: { include: { category: true } } },
        });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        const [totalOrders, stats] = await Promise.all([
            this.prisma.order.count({
                where: {
                    customerId: id,
                    deletedAt: null,
                    ...(branchId ? { branchId } : {}),
                },
            }),
            this.prisma.order.aggregate({
                where: {
                    customerId: id,
                    deletedAt: null,
                    ...(branchId ? { branchId } : {}),
                },
                _sum: { totalPaid: true },
            }),
        ]);
        return {
            ...customer,
            stats: {
                totalOrders,
                totalSpent: stats._sum.totalPaid || 0,
            },
        };
    }
    async update(id, branchId, updateCustomerDto) {
        await this.findOne(id, branchId);
        return this.prisma.customer.update({
            where: { id },
            data: updateCustomerDto,
        });
    }
    async remove(id, branchId) {
        await this.findOne(id, branchId);
        return this.prisma.customer.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async getOrders(id, branchId, page = 1, limit = 20) {
        await this.findOne(id, branchId);
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.order.findMany({
                where: {
                    customerId: id,
                    deletedAt: null,
                    ...(branchId ? { branchId } : {}),
                },
                skip,
                take: limit,
                orderBy: { orderDate: 'desc' },
                include: { items: true },
            }),
            this.prisma.order.count({
                where: {
                    customerId: id,
                    deletedAt: null,
                    ...(branchId ? { branchId } : {}),
                },
            }),
        ]);
        return { data, total };
    }
    async upsertMeasurement(id, branchId, dto) {
        await this.findOne(id, branchId);
        const category = await this.prisma.measurementCategory.findUnique({
            where: { id: dto.categoryId },
        });
        if (!category || !category.isActive)
            throw new common_1.NotFoundException('Measurement Category not found or inactive');
        return this.prisma.customerMeasurement.upsert({
            where: {
                customerId_categoryId: { customerId: id, categoryId: dto.categoryId },
            },
            update: { values: dto.values },
            create: {
                customerId: id,
                categoryId: dto.categoryId,
                values: dto.values,
            },
        });
    }
    async toggleVip(id, branchId, isVip) {
        await this.findOne(id, branchId);
        return this.prisma.customer.update({ where: { id }, data: { isVip } });
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        search_service_1.SearchService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map