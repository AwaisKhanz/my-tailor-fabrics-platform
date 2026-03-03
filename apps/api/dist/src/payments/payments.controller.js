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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const payments_service_1 = require("./payments.service");
const payment_dto_1 = require("./dto/payment.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const branch_guard_1 = require("../common/guards/branch.guard");
const auth_decorators_1 = require("../common/decorators/auth.decorators");
const shared_constants_1 = require("@tbms/shared-constants");
const weekly_pdf_service_1 = require("./weekly-pdf.service");
let PaymentsController = class PaymentsController {
    paymentsService;
    weeklyPdfService;
    constructor(paymentsService, weeklyPdfService) {
        this.paymentsService = paymentsService;
        this.weeklyPdfService = weeklyPdfService;
    }
    async getSummary(employeeId) {
        const data = await this.paymentsService.getEmployeeBalanceSummary(employeeId);
        return { success: true, data };
    }
    async disbursePay(dto, req) {
        const data = await this.paymentsService.disbursePay(dto.employeeId, dto.amount, req.user.userId, req.user.branchId ?? '', dto.note);
        return { success: true, data };
    }
    async getHistory(employeeId, page, limit, sortBy, sortOrder) {
        const data = await this.paymentsService.getHistory(employeeId, Number(page) || 1, Number(limit) || 20, sortBy, sortOrder);
        return { success: true, ...data };
    }
    async getWeeklyReport() {
        const data = await this.paymentsService.getWeeklyReport();
        return { success: true, data };
    }
    async getWeeklyReportPdf(res) {
        const data = await this.paymentsService.getWeeklyReport();
        const pdfStream = await this.weeklyPdfService.generatePdfStream(data);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline; filename="weekly_payments.pdf"',
        });
        pdfStream.pipe(res);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, auth_decorators_1.Roles)(...shared_constants_1.ADMIN_ROLES),
    (0, common_1.Get)('employee/:id/summary'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getSummary", null);
__decorate([
    (0, auth_decorators_1.Roles)(...shared_constants_1.ADMIN_ROLES),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payment_dto_1.DisbursePaymentDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "disbursePay", null);
__decorate([
    (0, auth_decorators_1.Roles)(...shared_constants_1.ADMIN_ROLES),
    (0, common_1.Get)('employee/:id/history'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('sortBy')),
    __param(4, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getHistory", null);
__decorate([
    (0, auth_decorators_1.Roles)(...shared_constants_1.ADMIN_ROLES),
    (0, common_1.Get)('weekly-report'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getWeeklyReport", null);
__decorate([
    (0, auth_decorators_1.Roles)(...shared_constants_1.ADMIN_ROLES),
    (0, common_1.Get)('weekly-report/pdf'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getWeeklyReportPdf", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, branch_guard_1.BranchGuard),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService,
        weekly_pdf_service_1.WeeklyPdfService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map