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
exports.RatesController = void 0;
const common_1 = require("@nestjs/common");
const rates_service_1 = require("./rates.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const auth_decorators_1 = require("../common/decorators/auth.decorators");
const shared_types_1 = require("@tbms/shared-types");
let RatesController = class RatesController {
    ratesService;
    constructor(ratesService) {
        this.ratesService = ratesService;
    }
    async findAll(req, page, limit, search) {
        const branchId = req.user.role === shared_types_1.Role.SUPER_ADMIN ? null : req.user.branchId;
        const { data, total } = await this.ratesService.findAll({
            branchId,
            search,
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
        });
        return {
            success: true,
            data,
            meta: {
                total,
                page: page ? parseInt(page) : 1,
                lastPage: Math.ceil(total / (limit ? parseInt(limit) : 10))
            }
        };
    }
    async create(dto, req) {
        if (req.user.role !== shared_types_1.Role.SUPER_ADMIN) {
            dto.branchId = req.user.branchId;
        }
        return this.ratesService.create({ ...dto, createdById: req.user.id });
    }
    async getHistory(garmentTypeId, stepKey, branchId) {
        return this.ratesService.getHistory(garmentTypeId, stepKey, branchId);
    }
};
exports.RatesController = RatesController;
__decorate([
    (0, common_1.Get)(),
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], RatesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RatesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    __param(0, (0, common_1.Query)('garmentTypeId')),
    __param(1, (0, common_1.Query)('stepKey')),
    __param(2, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], RatesController.prototype, "getHistory", null);
exports.RatesController = RatesController = __decorate([
    (0, common_1.Controller)('rates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [rates_service_1.RatesService])
], RatesController);
//# sourceMappingURL=rates.controller.js.map