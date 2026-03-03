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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersController = void 0;
const common_1 = require("@nestjs/common");
const customers_service_1 = require("./customers.service");
const create_customer_dto_1 = require("./dto/create-customer.dto");
const upsert_measurement_dto_1 = require("./dto/upsert-measurement.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const branch_guard_1 = require("../common/guards/branch.guard");
const auth_decorators_1 = require("../common/decorators/auth.decorators");
const shared_constants_1 = require("@tbms/shared-constants");
let CustomersController = class CustomersController {
    customersService;
    constructor(customersService) {
        this.customersService = customersService;
    }
    async create(createCustomerDto, req) {
        const data = await this.customersService.create(createCustomerDto, req.branchId);
        return { success: true, data };
    }
    async findAll(page, limit, search, isVip, status, req) {
        const data = await this.customersService.findAll(req.branchId, Number(page) || 1, Number(limit) || 20, search, isVip === 'true' ? true : undefined, status);
        return { success: true, data };
    }
    async findOne(id, req) {
        const data = await this.customersService.findOne(id, req.branchId);
        return { success: true, data };
    }
    async update(id, updateCustomerDto, req) {
        const data = await this.customersService.update(id, req.branchId, updateCustomerDto);
        return { success: true, data };
    }
    async remove(id, req) {
        const data = await this.customersService.remove(id, req.branchId);
        return { success: true, data };
    }
    async getOrders(id, page, limit, req) {
        const data = await this.customersService.getOrders(id, req.branchId, Number(page) || 1, Number(limit) || 20);
        return { success: true, data };
    }
    async upsertMeasurement(id, dto, req) {
        const data = await this.customersService.upsertMeasurement(id, req.branchId, dto);
        return { success: true, data };
    }
    async toggleVip(id, isVip, req) {
        const data = await this.customersService.toggleVip(id, req.branchId, isVip);
        return { success: true, data };
    }
};
exports.CustomersController = CustomersController;
__decorate([
    (0, auth_decorators_1.Roles)(...shared_constants_1.OPERATOR_ROLES),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_customer_dto_1.CreateCustomerDto, Object]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "create", null);
__decorate([
    (0, auth_decorators_1.Roles)(...shared_constants_1.OPERATOR_ROLES),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('isVip')),
    __param(4, (0, common_1.Query)('status')),
    __param(5, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "findAll", null);
__decorate([
    (0, auth_decorators_1.Roles)(...shared_constants_1.OPERATOR_ROLES),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "findOne", null);
__decorate([
    (0, auth_decorators_1.Roles)(...shared_constants_1.OPERATOR_ROLES),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_customer_dto_1.UpdateCustomerDto, Object]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "update", null);
__decorate([
    (0, auth_decorators_1.Roles)(...shared_constants_1.ADMIN_ROLES),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "remove", null);
__decorate([
    (0, auth_decorators_1.Roles)(...shared_constants_1.OPERATOR_ROLES),
    (0, common_1.Get)(':id/orders'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getOrders", null);
__decorate([
    (0, auth_decorators_1.Roles)(...shared_constants_1.OPERATOR_ROLES),
    (0, common_1.Post)(':id/measurements'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upsert_measurement_dto_1.UpsertMeasurementDto, Object]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "upsertMeasurement", null);
__decorate([
    (0, auth_decorators_1.Roles)(...shared_constants_1.OPERATOR_ROLES),
    (0, common_1.Patch)(':id/vip'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('isVip')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, Object]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "toggleVip", null);
exports.CustomersController = CustomersController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, branch_guard_1.BranchGuard),
    (0, common_1.Controller)('customers'),
    __metadata("design:paramtypes", [customers_service_1.CustomersService])
], CustomersController);
//# sourceMappingURL=customers.controller.js.map