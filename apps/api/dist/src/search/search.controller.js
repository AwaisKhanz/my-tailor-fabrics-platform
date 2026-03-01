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
exports.SearchController = void 0;
const common_1 = require("@nestjs/common");
const search_service_1 = require("./search.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const branch_guard_1 = require("../common/guards/branch.guard");
const auth_decorators_1 = require("../common/decorators/auth.decorators");
const shared_types_1 = require("@tbms/shared-types");
let SearchController = class SearchController {
    searchService;
    constructor(searchService) {
        this.searchService = searchService;
    }
    async queryCustomers(query, req) {
        const branchId = req.branchId;
        const limit = Number(req.query.limit) || 10;
        const data = await this.searchService.searchCustomers(query || '', branchId, limit);
        return { success: true, data };
    }
    async queryEmployees(query, req) {
        const branchId = req.branchId;
        const limit = Number(req.query.limit) || 10;
        const data = await this.searchService.searchEmployees(query || '', branchId, limit);
        return { success: true, data };
    }
};
exports.SearchController = SearchController;
__decorate([
    (0, common_1.Get)('customers'),
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ENTRY_OPERATOR, shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "queryCustomers", null);
__decorate([
    (0, common_1.Get)('employees'),
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ENTRY_OPERATOR, shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "queryEmployees", null);
exports.SearchController = SearchController = __decorate([
    (0, common_1.Controller)('search'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, branch_guard_1.BranchGuard),
    __metadata("design:paramtypes", [search_service_1.SearchService])
], SearchController);
//# sourceMappingURL=search.controller.js.map