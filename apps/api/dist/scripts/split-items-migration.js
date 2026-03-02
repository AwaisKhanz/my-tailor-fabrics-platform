"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Starting OrderItem split migration...');
    const itemsToSplit = await prisma.orderItem.findMany({
        where: {
            quantity: { gt: 1 },
            deletedAt: null,
        },
        orderBy: { createdAt: 'asc' },
    });
    console.log(`Found ${itemsToSplit.length} items to split.`);
    for (const item of itemsToSplit) {
        const qty = item.quantity;
        console.log(`Splitting Item ID: ${item.id}, Qty: ${qty}, Order: ${item.orderId}`);
        await prisma.orderItem.update({
            where: { id: item.id },
            data: { quantity: 1, pieceNo: 1 },
        });
        for (let i = 2; i <= qty; i++) {
            const newItem = await prisma.orderItem.create({
                data: {
                    orderId: item.orderId,
                    garmentTypeId: item.garmentTypeId,
                    garmentTypeName: item.garmentTypeName,
                    pieceNo: i,
                    employeeId: item.employeeId,
                    quantity: 1,
                    unitPrice: item.unitPrice,
                    employeeRate: item.employeeRate,
                    description: item.description,
                    fabricSource: 'SHOP',
                    dueDate: item.dueDate,
                    status: item.status,
                    completedAt: item.completedAt,
                    createdAt: item.createdAt,
                }
            });
            console.log(`  - Created PieceNo ${i} (ID: ${newItem.id})`);
        }
    }
    const singleItems = await prisma.orderItem.findMany({
        where: {
            quantity: 1,
            pieceNo: { equals: 1 },
            deletedAt: null
        }
    });
    const orders = await prisma.order.findMany({
        where: { deletedAt: null },
        include: { items: { where: { deletedAt: null }, orderBy: { createdAt: 'asc' } } }
    });
    for (const order of orders) {
        const gMap = {};
        for (const item of order.items) {
            gMap[item.garmentTypeId] = (gMap[item.garmentTypeId] || 0) + 1;
            if (item.pieceNo !== gMap[item.garmentTypeId]) {
                await prisma.orderItem.update({
                    where: { id: item.id },
                    data: { pieceNo: gMap[item.garmentTypeId] }
                });
                console.log(`Updated Order ${order.orderNumber} Item ${item.id} pieceNo to ${gMap[item.garmentTypeId]}`);
            }
        }
    }
    console.log('Migration complete.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=split-items-migration.js.map