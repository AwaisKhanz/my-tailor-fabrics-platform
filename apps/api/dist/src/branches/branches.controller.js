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
exports.BranchesController = void 0;
const common_1 = require("@nestjs/common");
const branches_service_1 = require("./branches.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const auth_decorators_1 = require("../common/decorators/auth.decorators");
const shared_types_1 = require("@tbms/shared-types");
let BranchesController = class BranchesController {
    branchesService;
    constructor(branchesService) {
        this.branchesService = branchesService;
    }
    async findAll(page, limit, search) {
        const data = await this.branchesService.findAll({
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            search,
        });
        return { success: true, ...data };
    }
    async getStats() {
        const data = await this.branchesService.getStats();
        return { success: true, data };
    }
    async findOne(id) {
        const data = await this.branchesService.findOne(id);
        return { success: true, data };
    }
    async createBranch(body) {
        const data = await this.branchesService.create(body);
        return { success: true, data };
    }
    async updateBranch(id, body) {
        const data = await this.branchesService.update(id, body);
        return { success: true, data };
    }
    async remove(id) {
        await this.branchesService.remove(id);
        return { success: true };
    }
};
exports.BranchesController = BranchesController;
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.SUPER_ADMIN, shared_types_1.Role.ADMIN, shared_types_1.Role.ENTRY_OPERATOR, shared_types_1.Role.VIEWER, shared_types_1.Role.EMPLOYEE),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], BranchesController.prototype, "findAll", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.SUPER_ADMIN, shared_types_1.Role.ADMIN),
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BranchesController.prototype, "getStats", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.SUPER_ADMIN, shared_types_1.Role.ADMIN),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BranchesController.prototype, "findOne", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BranchesController.prototype, "createBranch", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BranchesController.prototype, "updateBranch", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BranchesController.prototype, "remove", null);
exports.BranchesController = BranchesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('branches'),
    __metadata("design:paramtypes", [branches_service_1.BranchesService])
], BranchesController);
//# sourceMappingURL=branches.controller.js.map