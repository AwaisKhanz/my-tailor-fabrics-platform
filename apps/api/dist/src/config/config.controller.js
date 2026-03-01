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
exports.ConfigController = void 0;
const common_1 = require("@nestjs/common");
const config_service_1 = require("./config.service");
const garment_type_dto_1 = require("./dto/garment-type.dto");
const measurement_category_dto_1 = require("./dto/measurement-category.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const branch_guard_1 = require("../common/guards/branch.guard");
const auth_decorators_1 = require("../common/decorators/auth.decorators");
const shared_types_1 = require("@tbms/shared-types");
let ConfigController = class ConfigController {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    async getBranches() {
        const data = await this.configService.getBranches();
        return { success: true, data };
    }
    async getGarmentTypes(req, search, page, limit, branchIdQuery) {
        const activeBranchId = branchIdQuery || req.branchId;
        const data = await this.configService.getGarmentTypes({
            branchId: activeBranchId,
            search,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10
        });
        return { success: true, data };
    }
    async getGarmentType(id, req, branchIdQuery) {
        const activeBranchId = branchIdQuery || req.branchId;
        const data = await this.configService.getGarmentType(id, activeBranchId);
        return { success: true, data };
    }
    async getGarmentStats() {
        const data = await this.configService.getGarmentStats();
        return { success: true, data };
    }
    async createGarmentType(dto) {
        const data = await this.configService.createGarmentType(dto);
        return { success: true, data };
    }
    async updateGarmentType(id, dto) {
        const data = await this.configService.updateGarmentType(id, dto);
        return { success: true, data };
    }
    async getBranchPrices(garmentTypeId) {
        const data = await this.configService.getBranchPrices(garmentTypeId);
        return { success: true, data };
    }
    async setBranchPrice(garmentTypeId, body, req) {
        const data = await this.configService.setBranchPrice(garmentTypeId, req.branchId, body, req.user.userId);
        return { success: true, data };
    }
    async deleteBranchPrice(garmentTypeId, req) {
        await this.configService.deleteBranchPrice(garmentTypeId, req.branchId, req.user.userId);
        return { success: true };
    }
    async getBranchPriceHistory(garmentTypeId, req) {
        const data = await this.configService.getBranchPriceHistory(garmentTypeId, req.branchId);
        return { success: true, data };
    }
    async getMeasurementCategories(search, page, limit) {
        const data = await this.configService.getMeasurementCategories({
            search,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10
        });
        return { success: true, data };
    }
    async createMeasurementCategory(dto) {
        const data = await this.configService.createMeasurementCategory(dto);
        return { success: true, data };
    }
    async updateMeasurementCategory(id, dto) {
        const data = await this.configService.updateMeasurementCategory(id, dto);
        return { success: true, data };
    }
    async addMeasurementField(categoryId, dto) {
        const data = await this.configService.addMeasurementField(categoryId, dto);
        return { success: true, data };
    }
    async updateMeasurementField(id, dto) {
        const data = await this.configService.updateMeasurementField(id, dto);
        return { success: true, data };
    }
    async deleteMeasurementField(id) {
        await this.configService.deleteMeasurementField(id);
        return { success: true };
    }
    async deleteMeasurementCategory(id) {
        await this.configService.deleteMeasurementCategory(id);
        return { success: true };
    }
};
exports.ConfigController = ConfigController;
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Get)('branches'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "getBranches", null);
__decorate([
    (0, common_1.Get)('garment-types'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "getGarmentTypes", null);
__decorate([
    (0, common_1.Get)('garment-types/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "getGarmentType", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Get)('garment-stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "getGarmentStats", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Post)('garment-types'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [garment_type_dto_1.CreateGarmentTypeDto]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "createGarmentType", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Put)('garment-types/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, garment_type_dto_1.UpdateGarmentTypeDto]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "updateGarmentType", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Get)('garment-types/:id/branch-prices'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "getBranchPrices", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Put)('garment-types/:id/branch-prices'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, garment_type_dto_1.SetBranchPriceDto, Object]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "setBranchPrice", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Delete)('garment-types/:id/branch-prices'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "deleteBranchPrice", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Get)('garment-types/:id/history'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "getBranchPriceHistory", null);
__decorate([
    (0, common_1.Get)('measurement-categories'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "getMeasurementCategories", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Post)('measurement-categories'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [measurement_category_dto_1.CreateMeasurementCategoryDto]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "createMeasurementCategory", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Put)('measurement-categories/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, measurement_category_dto_1.UpdateMeasurementCategoryDto]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "updateMeasurementCategory", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Post)('measurement-categories/:id/fields'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, measurement_category_dto_1.CreateMeasurementFieldDto]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "addMeasurementField", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Put)('measurement-fields/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, measurement_category_dto_1.UpdateMeasurementFieldDto]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "updateMeasurementField", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Delete)('measurement-fields/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "deleteMeasurementField", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Delete)('measurement-categories/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConfigController.prototype, "deleteMeasurementCategory", null);
exports.ConfigController = ConfigController = __decorate([
    (0, common_1.Controller)('config'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, branch_guard_1.BranchGuard),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], ConfigController);
//# sourceMappingURL=config.controller.js.map