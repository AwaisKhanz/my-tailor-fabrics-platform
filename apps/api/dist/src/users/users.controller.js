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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const auth_decorators_1 = require("../common/decorators/auth.decorators");
const shared_constants_1 = require("@tbms/shared-constants");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async findAll(branchId) {
        const data = await this.usersService.findAll(branchId);
        return { success: true, data };
    }
    async getStats() {
        const data = await this.usersService.getStats();
        return { success: true, data };
    }
    async create(body) {
        const data = await this.usersService.create(body);
        return { success: true, data };
    }
    async setActive(id, isActive) {
        const data = await this.usersService.setActive(id, isActive);
        return { success: true, data };
    }
    async remove(id) {
        await this.usersService.remove(id);
        return { success: true };
    }
    async update(id, body) {
        const data = await this.usersService.update(id, body);
        return { success: true, data };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, auth_decorators_1.Roles)(...shared_constants_1.SUPER_ADMIN_ONLY_ROLES),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, auth_decorators_1.Roles)(...shared_constants_1.SUPER_ADMIN_ONLY_ROLES),
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getStats", null);
__decorate([
    (0, auth_decorators_1.Roles)(...shared_constants_1.SUPER_ADMIN_ONLY_ROLES),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    (0, auth_decorators_1.Roles)(...shared_constants_1.SUPER_ADMIN_ONLY_ROLES),
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "setActive", null);
__decorate([
    (0, auth_decorators_1.Roles)(...shared_constants_1.SUPER_ADMIN_ONLY_ROLES),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
__decorate([
    (0, auth_decorators_1.Roles)(...shared_constants_1.SUPER_ADMIN_ONLY_ROLES),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map