"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ExcelJS = __importStar(require("exceljs"));
const stream = __importStar(require("stream"));
let ExportService = class ExportService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async exportToStream(workbook) {
        const passThrough = new stream.PassThrough();
        await workbook.xlsx.write(passThrough);
        passThrough.end();
        return passThrough;
    }
    async exportOrders(branchId, from, to) {
        const where = branchId
            ? { branchId }
            : {};
        if (from && to) {
            where.orderDate = { gte: new Date(from), lte: new Date(to) };
        }
        else if (from) {
            where.orderDate = { gte: new Date(from) };
        }
        else if (to) {
            where.orderDate = { lte: new Date(to) };
        }
        const orders = await this.prisma.order.findMany({
            where,
            include: { customer: true, items: true, branch: true },
            orderBy: { orderDate: 'desc' },
        });
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Orders');
        sheet.columns = [
            { header: 'Order Number', key: 'orderNumber', width: 20 },
            { header: 'Date', key: 'orderDate', width: 20 },
            { header: 'Customer', key: 'customer', width: 25 },
            { header: 'Branch', key: 'branch', width: 20 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'SubTotal (Rs)', key: 'subtotal', width: 15 },
            { header: 'Discount (Rs)', key: 'discount', width: 15 },
            { header: 'Total (Rs)', key: 'total', width: 15 },
            { header: 'Paid (Rs)', key: 'paid', width: 15 },
            { header: 'Balance Due (Rs)', key: 'balanceDue', width: 15 },
            { header: 'Items Count', key: 'itemsCount', width: 15 },
        ];
        orders.forEach((o) => {
            sheet.addRow({
                orderNumber: o.orderNumber,
                orderDate: o.orderDate.toISOString().split('T')[0],
                customer: o.customer.fullName,
                branch: o.branch.name,
                status: o.status,
                subtotal: o.subtotal / 100,
                discount: o.discountAmount / 100,
                total: o.totalAmount / 100,
                paid: o.totalPaid / 100,
                balanceDue: o.balanceDue / 100,
                itemsCount: o.items.reduce((sum, item) => sum + item.quantity, 0),
            });
        });
        return this.exportToStream(workbook);
    }
    async exportPayments(branchId, from, to) {
        const where = {};
        if (branchId)
            where.employee = { branchId };
        let dateFilter;
        if (from && to)
            dateFilter = { gte: new Date(from), lte: new Date(to) };
        else if (from)
            dateFilter = { gte: new Date(from) };
        else if (to)
            dateFilter = { lte: new Date(to) };
        if (dateFilter)
            where.paidAt = dateFilter;
        const payments = await this.prisma.payment.findMany({
            where,
            include: { employee: true, processedBy: true },
            orderBy: { paidAt: 'desc' },
        });
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Payments');
        sheet.columns = [
            { header: 'Date', key: 'date', width: 20 },
            { header: 'Employee', key: 'employee', width: 25 },
            { header: 'Amount (Rs)', key: 'amount', width: 15 },
            { header: 'Processed By', key: 'processedBy', width: 25 },
            { header: 'Notes', key: 'note', width: 40 },
        ];
        payments.forEach((p) => sheet.addRow({
            date: p.paidAt.toISOString().split('T')[0],
            employee: p.employee.fullName,
            amount: p.amount / 100,
            processedBy: p.processedBy.email,
            note: p.note,
        }));
        return this.exportToStream(workbook);
    }
    async exportExpenses(branchId, from, to) {
        const where = branchId
            ? { branchId }
            : {};
        let dateFilter;
        if (from && to)
            dateFilter = { gte: new Date(from), lte: new Date(to) };
        else if (from)
            dateFilter = { gte: new Date(from) };
        else if (to)
            dateFilter = { lte: new Date(to) };
        if (dateFilter)
            where.expenseDate = dateFilter;
        const expenses = await this.prisma.expense.findMany({
            where,
            orderBy: { expenseDate: 'desc' },
        });
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Expenses');
        sheet.columns = [
            { header: 'Date', key: 'date', width: 20 },
            { header: 'Branch ID', key: 'branchId', width: 20 },
            { header: 'Category ID', key: 'categoryId', width: 20 },
            { header: 'Amount (Rs)', key: 'amount', width: 15 },
            { header: 'Description', key: 'description', width: 35 },
            { header: 'Added By (ID)', key: 'addedById', width: 25 },
        ];
        expenses.forEach((e) => sheet.addRow({
            date: e.expenseDate.toISOString().split('T')[0],
            branchId: e.branchId,
            categoryId: e.categoryId,
            amount: e.amount / 100,
            description: e.description,
            addedById: e.addedById,
        }));
        return this.exportToStream(workbook);
    }
    async exportEmployeeSummaries(branchId) {
        const employees = await this.prisma.employee.findMany({
            where: branchId ? { branchId } : {},
            include: { branch: true },
        });
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Employee Summaries');
        sheet.columns = [
            { header: 'Code', key: 'code', width: 10 },
            { header: 'Name', key: 'name', width: 25 },
            { header: 'Branch', key: 'branch', width: 20 },
            { header: 'Lifetime Earned (Rs)', key: 'earned', width: 20 },
            { header: 'Lifetime Paid (Rs)', key: 'paid', width: 20 },
            { header: 'Current Balance (Rs)', key: 'balance', width: 20 },
        ];
        for (const emp of employees) {
            const raw = await this.prisma.$queryRaw `
        SELECT COALESCE(SUM("employeeRate" * quantity), 0) AS earned
        FROM "OrderItem"
        WHERE "employeeId" = ${emp.id} AND status IN ('COMPLETED', 'DELIVERED')
      `;
            const paid = await this.prisma.payment.aggregate({
                where: { employeeId: emp.id },
                _sum: { amount: true },
            });
            const earnedAmt = Number(raw[0]?.earned ?? 0);
            const paidAmt = paid._sum.amount ?? 0;
            sheet.addRow({
                code: emp.employeeCode,
                name: emp.fullName,
                branch: emp.branch.name,
                earned: earnedAmt / 100,
                paid: paidAmt / 100,
                balance: (earnedAmt - paidAmt) / 100,
            });
        }
        return this.exportToStream(workbook);
    }
};
exports.ExportService = ExportService;
exports.ExportService = ExportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExportService);
//# sourceMappingURL=export.service.js.map