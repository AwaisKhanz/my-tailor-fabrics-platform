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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seed starting...');
    const branch = await prisma.branch.upsert({
        where: { code: 'MAIN' },
        update: {},
        create: {
            code: 'MAIN',
            name: 'Main Branch',
            address: 'Main Office Address',
            phone: '000-000-0000',
        },
    });
    console.log(`Created/Ensured Branch: ${branch.name} (${branch.code})`);
    const adminEmail = 'admin@tbms.com';
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            name: 'Main Admin',
            passwordHash: hashedPassword,
            role: client_1.Role.SUPER_ADMIN,
            branchId: null,
        },
    });
    console.log(`Created/Ensured Super Admin: ${admin.email}`);
    const garmentTypes = [
        { name: 'Shalwar Kameez', customerPrice: 150000, employeeRate: 50000 },
        { name: 'Suit (2-Piece)', customerPrice: 450000, employeeRate: 150000 },
        { name: 'Waistcoat', customerPrice: 200000, employeeRate: 70000 },
    ];
    for (const gt of garmentTypes) {
        await prisma.garmentType.upsert({
            where: { id: gt.name },
            update: {},
            create: {
                name: gt.name,
                customerPrice: gt.customerPrice,
                employeeRate: gt.employeeRate,
            },
        });
    }
    console.log('Seed complete! 🚀');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map