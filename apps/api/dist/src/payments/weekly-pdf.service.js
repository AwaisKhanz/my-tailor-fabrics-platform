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
exports.WeeklyPdfService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const React = __importStar(require("react"));
const renderer_1 = require("@react-pdf/renderer");
const renderer_2 = require("@react-pdf/renderer");
const styles = renderer_2.StyleSheet.create({
    page: { padding: 30, fontSize: 12, fontFamily: 'Helvetica' },
    header: { fontSize: 20, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
    subHeader: { fontSize: 12, marginBottom: 20, textAlign: 'center', color: '#555' },
    table: { display: 'flex', flexDirection: 'column', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#bfbfbf' },
    tableRow: { margin: 'auto', flexDirection: 'row' },
    tableColHeader: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderColor: '#bfbfbf', backgroundColor: '#f0f0f0', padding: 5 },
    tableCol: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderColor: '#bfbfbf', padding: 5 },
    tableCellHeader: { margin: 'auto', fontSize: 10, fontWeight: 'bold' },
    tableCell: { margin: 'auto', fontSize: 10 },
    footer: { marginTop: 30, fontSize: 10, textAlign: 'center', color: '#888' }
});
const WeeklyPaymentDocument = ({ data }) => {
    const totalPaid = data.reduce((sum, row) => sum + (Number(row.paidThisWeek) || 0), 0);
    const dateStr = new Date().toLocaleDateString();
    return (React.createElement(renderer_2.Document, null,
        React.createElement(renderer_2.Page, { size: "A4", style: styles.page },
            React.createElement(renderer_2.Text, { style: styles.header }, "Weekly Payment Report"),
            React.createElement(renderer_2.Text, { style: styles.subHeader },
                "Generated on: ",
                dateStr),
            React.createElement(renderer_2.View, { style: styles.table },
                React.createElement(renderer_2.View, { style: styles.tableRow },
                    React.createElement(renderer_2.View, { style: styles.tableColHeader },
                        React.createElement(renderer_2.Text, { style: styles.tableCellHeader }, "Employee Code")),
                    React.createElement(renderer_2.View, { style: styles.tableColHeader },
                        React.createElement(renderer_2.Text, { style: styles.tableCellHeader }, "Employee Name")),
                    React.createElement(renderer_2.View, { style: styles.tableColHeader },
                        React.createElement(renderer_2.Text, { style: styles.tableCellHeader }, "Paid This Week (Rs)")),
                    React.createElement(renderer_2.View, { style: styles.tableColHeader },
                        React.createElement(renderer_2.Text, { style: styles.tableCellHeader }, "Signature"))),
                data.map((row, i) => (React.createElement(renderer_2.View, { style: styles.tableRow, key: i },
                    React.createElement(renderer_2.View, { style: styles.tableCol },
                        React.createElement(renderer_2.Text, { style: styles.tableCell }, row.employeeCode)),
                    React.createElement(renderer_2.View, { style: styles.tableCol },
                        React.createElement(renderer_2.Text, { style: styles.tableCell }, row.employeeName)),
                    React.createElement(renderer_2.View, { style: styles.tableCol },
                        React.createElement(renderer_2.Text, { style: styles.tableCell }, (Number(row.paidThisWeek) / 100).toFixed(2))),
                    React.createElement(renderer_2.View, { style: styles.tableCol },
                        React.createElement(renderer_2.Text, { style: styles.tableCell })),
                    "  "))),
                React.createElement(renderer_2.View, { style: styles.tableRow },
                    React.createElement(renderer_2.View, { style: styles.tableCol },
                        React.createElement(renderer_2.Text, { style: styles.tableCell })),
                    React.createElement(renderer_2.View, { style: styles.tableCol },
                        React.createElement(renderer_2.Text, { style: [styles.tableCell, { fontWeight: 'bold' }] }, "Grand Total")),
                    React.createElement(renderer_2.View, { style: styles.tableCol },
                        React.createElement(renderer_2.Text, { style: [styles.tableCell, { fontWeight: 'bold' }] }, (totalPaid / 100).toFixed(2))),
                    React.createElement(renderer_2.View, { style: styles.tableCol },
                        React.createElement(renderer_2.Text, { style: styles.tableCell })))),
            React.createElement(renderer_2.Text, { style: styles.footer }, "*This is a computer-generated document tracking cash disbursements."))));
};
let WeeklyPdfService = class WeeklyPdfService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generatePdfStream(data) {
        if (!data || data.length === 0) {
            throw new common_1.NotFoundException('No payments found for this week to generate report.');
        }
        const element = React.createElement(WeeklyPaymentDocument, { data });
        return (0, renderer_1.renderToStream)(element);
    }
};
exports.WeeklyPdfService = WeeklyPdfService;
exports.WeeklyPdfService = WeeklyPdfService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WeeklyPdfService);
//# sourceMappingURL=weekly-pdf.service.js.map