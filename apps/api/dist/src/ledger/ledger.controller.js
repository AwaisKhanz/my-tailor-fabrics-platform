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
exports.LedgerController = void 0;
const common_1 = require("@nestjs/common");
const ledger_service_1 = require("./ledger.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const auth_decorators_1 = require("../common/decorators/auth.decorators");
const shared_types_1 = require("@tbms/shared-types");
const shared_constants_1 = require("@tbms/shared-constants");
let LedgerController = class LedgerController {
    ledgerService;
    constructor(ledgerService) {
        this.ledgerService = ledgerService;
    }
    async createManualEntry(dto, req) {
        const data = await this.ledgerService.createEntry({
            ...dto,
            branchId: req.branchId,
            createdById: req.user.userId,
        });
        return { success: true, data };
    }
    async getBalance(employeeId) {
        const summary = await this.ledgerService.getBalance(employeeId);
        return { success: true, data: summary };
    }
    async getStatement(employeeId, from, to, type, page, limit) {
        const result = await this.ledgerService.getStatement(employeeId, {
            from,
            to,
            type,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
        });
        return { success: true, data: result };
    }
    async getEarnings(employeeId, weeksBack) {
        const data = await this.ledgerService.getEarningsByPeriod(employeeId, weeksBack ? parseInt(weeksBack) : 12);
        return { success: true, data };
    }
    async deleteEntry(id, req) {
        const data = await this.ledgerService.remove(id, req.branchId);
        return { success: true, data };
    }
};
exports.LedgerController = LedgerController;
__decorate([
    (0, common_1.Post)(),
    (0, auth_decorators_1.Roles)(...shared_constants_1.ADMIN_ROLES),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LedgerController.prototype, "createManualEntry", null);
__decorate([
    (0, common_1.Get)(':employeeId/balance'),
    (0, auth_decorators_1.Roles)(...shared_constants_1.ADMIN_ROLES),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LedgerController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Get)(':employeeId/statement'),
    (0, auth_decorators_1.Roles)(...shared_constants_1.ADMIN_ROLES),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __param(3, (0, common_1.Query)('type')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], LedgerController.prototype, "getStatement", null);
__decorate([
    (0, common_1.Get)(':employeeId/earnings'),
    (0, auth_decorators_1.Roles)(...shared_constants_1.ADMIN_ROLES),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Query)('weeksBack')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LedgerController.prototype, "getEarnings", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, auth_decorators_1.Roles)(...shared_constants_1.ADMIN_ROLES),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LedgerController.prototype, "deleteEntry", null);
exports.LedgerController = LedgerController = __decorate([
    (0, common_1.Controller)('ledger'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [ledger_service_1.LedgerService])
], LedgerController);
//# sourceMappingURL=ledger.controller.js.map