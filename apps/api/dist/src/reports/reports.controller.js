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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const export_service_1 = require("./export.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const branch_guard_1 = require("../common/guards/branch.guard");
const auth_decorators_1 = require("../common/decorators/auth.decorators");
const shared_types_1 = require("@tbms/shared-types");
let ReportsController = class ReportsController {
    reportsService;
    exportService;
    constructor(reportsService, exportService) {
        this.reportsService = reportsService;
        this.exportService = exportService;
    }
    async getDashboard(req, targetBranchId) {
        let resolvedBranchId = req.branchId;
        if (req.user.role === shared_types_1.Role.SUPER_ADMIN && targetBranchId !== undefined) {
            resolvedBranchId = targetBranchId === 'all' ? undefined : targetBranchId;
        }
        const data = await this.reportsService.getDashboardStats(resolvedBranchId);
        return { success: true, data };
    }
    resolveBranch(req, targetBranchId) {
        let resolved = req.branchId;
        if (req.user.role === shared_types_1.Role.SUPER_ADMIN && targetBranchId !== undefined) {
            resolved = targetBranchId === 'all' ? undefined : targetBranchId;
        }
        return resolved;
    }
    async exportOrders(req, res, targetBranchId, from, to) {
        const branchId = this.resolveBranch(req, targetBranchId);
        const stream = await this.exportService.exportOrders(branchId, from, to);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="orders.xlsx"',
        });
        stream.pipe(res);
    }
    async exportPayments(req, res, targetBranchId, from, to) {
        const branchId = this.resolveBranch(req, targetBranchId);
        const stream = await this.exportService.exportPayments(branchId, from, to);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="payments.xlsx"',
        });
        stream.pipe(res);
    }
    async exportExpenses(req, res, targetBranchId, from, to) {
        const branchId = this.resolveBranch(req, targetBranchId);
        const stream = await this.exportService.exportExpenses(branchId, from, to);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="expenses.xlsx"',
        });
        stream.pipe(res);
    }
    async exportEmployees(req, res, targetBranchId) {
        const branchId = this.resolveBranch(req, targetBranchId);
        const stream = await this.exportService.exportEmployeeSummaries(branchId);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="employees.xlsx"',
        });
        stream.pipe(res);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN, shared_types_1.Role.VIEWER),
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getDashboard", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN, shared_types_1.Role.VIEWER),
    (0, common_1.Get)('export/orders'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('branchId')),
    __param(3, (0, common_1.Query)('from')),
    __param(4, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportOrders", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN, shared_types_1.Role.VIEWER),
    (0, common_1.Get)('export/payments'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('branchId')),
    __param(3, (0, common_1.Query)('from')),
    __param(4, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportPayments", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN, shared_types_1.Role.VIEWER),
    (0, common_1.Get)('export/expenses'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('branchId')),
    __param(3, (0, common_1.Query)('from')),
    __param(4, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportExpenses", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN, shared_types_1.Role.VIEWER),
    (0, common_1.Get)('export/employees'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportEmployees", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)('reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, branch_guard_1.BranchGuard),
    __metadata("design:paramtypes", [reports_service_1.ReportsService,
        export_service_1.ExportService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map