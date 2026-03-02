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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const receipt_service_1 = require("./receipt.service");
const create_order_dto_1 = require("./dto/create-order.dto");
const add_payment_dto_1 = require("./dto/add-payment.dto");
const update_status_dto_1 = require("./dto/update-status.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const branch_guard_1 = require("../common/guards/branch.guard");
const auth_decorators_1 = require("../common/decorators/auth.decorators");
const shared_types_1 = require("@tbms/shared-types");
let OrdersController = class OrdersController {
    ordersService;
    receiptService;
    constructor(ordersService, receiptService) {
        this.ordersService = ordersService;
        this.receiptService = receiptService;
    }
    async create(createOrderDto, req) {
        const data = await this.ordersService.create(createOrderDto, req.branchId, req.user.userId, req.user.role);
        return { success: true, data };
    }
    async findAll(page, limit, status, from, to, employeeId, search, sortBy, sortOrder, req) {
        const data = await this.ordersService.findAll(req.branchId, Number(page) || 1, Number(limit) || 20, { status, from, to, employeeId, search, sortBy, sortOrder });
        return { success: true, data };
    }
    async findOne(id, req) {
        const data = await this.ordersService.findOne(id, req.branchId);
        return { success: true, data };
    }
    async update(id, dto, req) {
        const data = await this.ordersService.update(id, req.branchId, dto, req.user.role);
        return { success: true, data };
    }
    async cancel(id, req) {
        const data = await this.ordersService.cancelOrder(id, req.branchId, req.user.userId);
        return { success: true, data };
    }
    async addItem(id, dto, req) {
        const data = await this.ordersService.addItem(id, req.branchId, dto);
        return { success: true, data };
    }
    async updateItem(id, itemId, dto, req) {
        const data = await this.ordersService.updateItem(id, itemId, req.branchId, dto);
        return { success: true, data };
    }
    async removeItem(id, itemId, req) {
        await this.ordersService.removeItem(id, itemId, req.branchId);
        return { success: true };
    }
    async addPayment(id, addPaymentDto, req) {
        const data = await this.ordersService.addPayment(id, req.branchId, addPaymentDto, req.user.userId);
        return { success: true, data };
    }
    async updateStatus(id, updateStatusDto, req) {
        const data = await this.ordersService.updateStatus(id, req.branchId, updateStatusDto, req.user.userId);
        return { success: true, data };
    }
    async getReceipt(id, req, res) {
        const stream = await this.receiptService.generateOrderReceipt(id, req.branchId);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=receipt-${id}.pdf`,
        });
        stream.pipe(res);
    }
    async shareOrder(id, req) {
        const data = await this.ordersService.generateShareLink(id, req.branchId);
        return { success: true, data };
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ENTRY_OPERATOR, shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_order_dto_1.CreateOrderDto, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "create", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.VIEWER, shared_types_1.Role.ENTRY_OPERATOR, shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('from')),
    __param(4, (0, common_1.Query)('to')),
    __param(5, (0, common_1.Query)('employeeId')),
    __param(6, (0, common_1.Query)('search')),
    __param(7, (0, common_1.Query)('sortBy')),
    __param(8, (0, common_1.Query)('sortOrder')),
    __param(9, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findAll", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.VIEWER, shared_types_1.Role.ENTRY_OPERATOR, shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findOne", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ENTRY_OPERATOR, shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "update", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "cancel", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ENTRY_OPERATOR, shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Post)(':id/items'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "addItem", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ENTRY_OPERATOR, shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Patch)(':id/items/:itemId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateItem", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Delete)(':id/items/:itemId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "removeItem", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ENTRY_OPERATOR, shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Post)(':id/payment'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_payment_dto_1.AddPaymentDto, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "addPayment", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ENTRY_OPERATOR, shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_status_dto_1.UpdateOrderStatusDto, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateStatus", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.VIEWER, shared_types_1.Role.ENTRY_OPERATOR, shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Get)(':id/receipt'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getReceipt", null);
__decorate([
    (0, auth_decorators_1.Roles)(shared_types_1.Role.ENTRY_OPERATOR, shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN),
    (0, common_1.Post)(':id/share'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "shareOrder", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, branch_guard_1.BranchGuard),
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService,
        receipt_service_1.ReceiptService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map