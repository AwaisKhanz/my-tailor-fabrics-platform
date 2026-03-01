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
exports.AttendanceController = void 0;
const common_1 = require("@nestjs/common");
const attendance_service_1 = require("./attendance.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const branch_guard_1 = require("../common/guards/branch.guard");
const auth_decorators_1 = require("../common/decorators/auth.decorators");
const shared_types_1 = require("@tbms/shared-types");
let AttendanceController = class AttendanceController {
    attendanceService;
    constructor(attendanceService) {
        this.attendanceService = attendanceService;
    }
    async clockIn(employeeId, note, req) {
        const data = await this.attendanceService.clockIn(employeeId, req.branchId, note);
        return { success: true, data };
    }
    async clockOut(recordId, req) {
        const data = await this.attendanceService.clockOut(recordId, req.branchId);
        return { success: true, data };
    }
    async findAll(employeeId, page, limit, req) {
        const data = await this.attendanceService.findAll(req.branchId, employeeId, Number(page) || 1, Number(limit) || 20);
        return { success: true, ...data };
    }
    async getEmployeeSummary(employeeId, req) {
        const data = await this.attendanceService.getEmployeeSummary(employeeId, req.branchId);
        return { success: true, data };
    }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ENTRY_OPERATOR, shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN, shared_types_1.Role.EMPLOYEE),
    (0, common_1.Post)('clock-in'),
    __param(0, (0, common_1.Body)('employeeId')),
    __param(1, (0, common_1.Body)('note')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "clockIn", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ENTRY_OPERATOR, shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN, shared_types_1.Role.EMPLOYEE),
    (0, common_1.Post)('clock-out/:recordId'),
    __param(0, (0, common_1.Param)('recordId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "clockOut", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.VIEWER, shared_types_1.Role.ENTRY_OPERATOR, shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('employeeId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "findAll", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.VIEWER, shared_types_1.Role.ENTRY_OPERATOR, shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Get)('employee/:employeeId/summary'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getEmployeeSummary", null);
exports.AttendanceController = AttendanceController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, branch_guard_1.BranchGuard),
    (0, common_1.Controller)('attendance'),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService])
], AttendanceController);
//# sourceMappingURL=attendance.controller.js.map