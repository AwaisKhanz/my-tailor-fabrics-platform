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
exports.ExpensesController = void 0;
const common_1 = require("@nestjs/common");
const expenses_service_1 = require("./expenses.service");
const expense_dto_1 = require("./dto/expense.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const branch_guard_1 = require("../common/guards/branch.guard");
const auth_decorators_1 = require("../common/decorators/auth.decorators");
const shared_types_1 = require("@tbms/shared-types");
let ExpensesController = class ExpensesController {
    expensesService;
    constructor(expensesService) {
        this.expensesService = expensesService;
    }
    async create(dto, req) {
        const data = await this.expensesService.create(req.branchId, req.user.userId, dto);
        return { success: true, data };
    }
    async findAll(req, page, limit, categoryId, from, to, sortBy, sortOrder) {
        const data = await this.expensesService.findAll(req.branchId, Number(page) || 1, Number(limit) || 20, categoryId, from, to, sortBy, sortOrder);
        return { success: true, ...data };
    }
    async findAllCategories() {
        const data = await this.expensesService.findAllCategories();
        return { success: true, data };
    }
    async findOne(id, req) {
        const data = await this.expensesService.findOne(id, req.branchId);
        return { success: true, data };
    }
    async update(id, dto, req) {
        const data = await this.expensesService.update(id, req.branchId, dto);
        return { success: true, data };
    }
    async remove(id, req) {
        await this.expensesService.remove(id, req.branchId);
        return { success: true };
    }
};
exports.ExpensesController = ExpensesController;
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [expense_dto_1.CreateExpenseDto, Object]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "create", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('categoryId')),
    __param(4, (0, common_1.Query)('from')),
    __param(5, (0, common_1.Query)('to')),
    __param(6, (0, common_1.Query)('sortBy')),
    __param(7, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "findAll", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "findAllCategories", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "findOne", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, expense_dto_1.UpdateExpenseDto, Object]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "update", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "remove", null);
exports.ExpensesController = ExpensesController = __decorate([
    (0, common_1.Controller)('expenses'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, branch_guard_1.BranchGuard),
    __metadata("design:paramtypes", [expenses_service_1.ExpensesService])
], ExpensesController);
//# sourceMappingURL=expenses.controller.js.map