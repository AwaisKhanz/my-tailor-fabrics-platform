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
exports.ReceiptService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const React = __importStar(require("react"));
const renderer_1 = require("@react-pdf/renderer");
const styles = renderer_1.StyleSheet.create({
    page: { flexDirection: 'column', backgroundColor: '#FFFFFF', padding: 30 },
    header: { fontSize: 24, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
    section: { margin: 10, padding: 10, flexGrow: 1 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    label: { fontSize: 12, fontWeight: 'bold' },
    value: { fontSize: 12 },
    title: { fontSize: 16, marginTop: 20, marginBottom: 10, fontWeight: 'bold', textDecoration: 'underline' },
    itemRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EEEEEE', paddingVertical: 5 },
    itemColName: { width: '50%', fontSize: 10 },
    itemColQty: { width: '15%', fontSize: 10, textAlign: 'center' },
    itemColPrice: { width: '35%', fontSize: 10, textAlign: 'right' },
    totalRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
});
const ReceiptDocument = ({ order }) => (React.createElement(renderer_1.Document, null,
    React.createElement(renderer_1.Page, { size: "A4", style: styles.page },
        React.createElement(renderer_1.Text, { style: styles.header }, "My Tailor & Fabrics - Receipt"),
        React.createElement(renderer_1.View, { style: styles.section },
            React.createElement(renderer_1.View, { style: styles.row },
                React.createElement(renderer_1.Text, { style: styles.label }, "Order #:"),
                React.createElement(renderer_1.Text, { style: styles.value }, order.orderNumber)),
            React.createElement(renderer_1.View, { style: styles.row },
                React.createElement(renderer_1.Text, { style: styles.label }, "Date:"),
                React.createElement(renderer_1.Text, { style: styles.value }, new Date(order.orderDate).toLocaleDateString())),
            React.createElement(renderer_1.View, { style: styles.row },
                React.createElement(renderer_1.Text, { style: styles.label }, "Customer:"),
                React.createElement(renderer_1.Text, { style: styles.value },
                    order.customer.fullName,
                    " (",
                    order.customer.phone,
                    ")")),
            React.createElement(renderer_1.View, { style: styles.row },
                React.createElement(renderer_1.Text, { style: styles.label }, "Branch:"),
                React.createElement(renderer_1.Text, { style: styles.value }, order.branch.name)),
            React.createElement(renderer_1.Text, { style: styles.title }, "Items"),
            React.createElement(renderer_1.View, { style: styles.itemRow },
                React.createElement(renderer_1.Text, { style: [styles.itemColName, { fontWeight: 'bold' }] }, "Item"),
                React.createElement(renderer_1.Text, { style: [styles.itemColQty, { fontWeight: 'bold' }] }, "Qty"),
                React.createElement(renderer_1.Text, { style: [styles.itemColPrice, { fontWeight: 'bold' }] }, "Price")),
            order.items.map((item) => (React.createElement(renderer_1.View, { style: styles.itemRow, key: item.id },
                React.createElement(renderer_1.Text, { style: styles.itemColName }, item.garmentTypeName),
                React.createElement(renderer_1.Text, { style: styles.itemColQty }, item.quantity),
                React.createElement(renderer_1.Text, { style: styles.itemColPrice },
                    "Rs ",
                    (item.unitPrice / 100).toFixed(2))))),
            React.createElement(renderer_1.Text, { style: styles.title }, "Summary"),
            React.createElement(renderer_1.View, { style: styles.row },
                React.createElement(renderer_1.Text, { style: styles.label }, "Subtotal:"),
                React.createElement(renderer_1.Text, { style: styles.value },
                    "Rs ",
                    (order.subtotal / 100).toFixed(2))),
            React.createElement(renderer_1.View, { style: styles.row },
                React.createElement(renderer_1.Text, { style: styles.label }, "Discount:"),
                React.createElement(renderer_1.Text, { style: styles.value },
                    "- Rs ",
                    (order.discountAmount / 100).toFixed(2))),
            React.createElement(renderer_1.View, { style: styles.row },
                React.createElement(renderer_1.Text, { style: styles.label }, "Total Amount:"),
                React.createElement(renderer_1.Text, { style: styles.value },
                    "Rs ",
                    (order.totalAmount / 100).toFixed(2))),
            React.createElement(renderer_1.View, { style: styles.row },
                React.createElement(renderer_1.Text, { style: styles.label }, "Total Paid:"),
                React.createElement(renderer_1.Text, { style: styles.value },
                    "Rs ",
                    (order.totalPaid / 100).toFixed(2))),
            React.createElement(renderer_1.View, { style: styles.row },
                React.createElement(renderer_1.Text, { style: styles.label }, "Balance Due:"),
                React.createElement(renderer_1.Text, { style: styles.value },
                    "Rs ",
                    (order.balanceDue / 100).toFixed(2)))))));
let ReceiptService = class ReceiptService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateOrderReceipt(orderId, branchId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId, branchId },
            include: {
                customer: true,
                branch: true,
                items: true,
            },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found or access denied');
        }
        const element = React.createElement(ReceiptDocument, { order: order });
        return (0, renderer_1.renderToStream)(element);
    }
};
exports.ReceiptService = ReceiptService;
exports.ReceiptService = ReceiptService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReceiptService);
//# sourceMappingURL=receipt.service.js.map