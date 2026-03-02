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
exports.EmployeesController = void 0;
const common_1 = require("@nestjs/common");
const employees_service_1 = require("./employees.service");
const create_employee_dto_1 = require("./dto/create-employee.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const branch_guard_1 = require("../common/guards/branch.guard");
const auth_decorators_1 = require("../common/decorators/auth.decorators");
const shared_types_1 = require("@tbms/shared-types");
let EmployeesController = class EmployeesController {
    employeesService;
    constructor(employeesService) {
        this.employeesService = employeesService;
    }
    async create(createEmployeeDto, req) {
        const data = await this.employeesService.create(createEmployeeDto, req.branchId);
        return { success: true, data };
    }
    async findAll(page, limit, search, req) {
        const data = await this.employeesService.findAll(req.branchId, Number(page) || 1, Number(limit) || 20, search);
        return { success: true, data };
    }
    async findOne(id, req) {
        const data = await this.employeesService.findOne(id, req.branchId);
        return { success: true, data };
    }
    async update(id, updateEmployeeDto, req) {
        const data = await this.employeesService.update(id, req.branchId, updateEmployeeDto);
        return { success: true, data };
    }
    async remove(id, req) {
        const data = await this.employeesService.remove(id, req.branchId);
        return { success: true, data };
    }
    async createUserAccount(id, email, rawPass, req) {
        const data = await this.employeesService.createUserAccount(id, req.branchId, email, rawPass);
        return { success: true, user: { id: data.id, email: data.email } };
    }
    async getStats(id, req) {
        const data = await this.employeesService.getStats(id, req.branchId);
        return { success: true, data };
    }
    async getItems(id, page, limit, req) {
        const data = await this.employeesService.getItems(id, req.branchId, Number(page) || 1, Number(limit) || 20);
        return { success: true, data };
    }
    async addDocument(id, label, fileUrl, fileType, req) {
        const data = await this.employeesService.addDocument(id, req.branchId, label, fileUrl, fileType, req.user.userId);
        return { success: true, data };
    }
    async getMyProfile(req) {
        const data = await this.employeesService.getMyProfile(req.user.employeeId, req.branchId);
        return { success: true, data };
    }
    async getMyStats(req) {
        const data = await this.employeesService.getMyStats(req.user.employeeId, req.branchId);
        return { success: true, data };
    }
    async getMyItems(page, limit, req) {
        const data = await this.employeesService.getMyItems(req.user.employeeId, req.branchId, Number(page) || 1, Number(limit) || 20);
        return { success: true, data };
    }
};
exports.EmployeesController = EmployeesController;
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_employee_dto_1.CreateEmployeeDto, Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "create", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ENTRY_OPERATOR, shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "findAll", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ENTRY_OPERATOR, shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "findOne", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_employee_dto_1.UpdateEmployeeDto, Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "update", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "remove", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Post)(':id/user-account'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('email')),
    __param(2, (0, common_1.Body)('password')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "createUserAccount", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ENTRY_OPERATOR, shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Get)(':id/stats'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "getStats", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ENTRY_OPERATOR, shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Get)(':id/items'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "getItems", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Post)(':id/documents'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('label')),
    __param(2, (0, common_1.Body)('fileUrl')),
    __param(3, (0, common_1.Body)('fileType')),
    __param(4, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "addDocument", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.EMPLOYEE),
    (0, common_1.Get)('my/profile'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "getMyProfile", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.EMPLOYEE),
    (0, common_1.Get)('my/stats'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "getMyStats", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.EMPLOYEE),
    (0, common_1.Get)('my/items'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "getMyItems", null);
exports.EmployeesController = EmployeesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, branch_guard_1.BranchGuard),
    (0, common_1.Controller)('employees'),
    __metadata("design:paramtypes", [employees_service_1.EmployeesService])
], EmployeesController);
//# sourceMappingURL=employees.controller.js.map