import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting OrderItem split migration...');

  // 1. Find all OrderItems with quantity > 1
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

    // Update the first one to pieceNo 1 and quantity 1
    await prisma.orderItem.update({
      where: { id: item.id },
      data: { quantity: 1, pieceNo: 1 },
    });

    // Create remaining pieces
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

  // 2. Also update pieceNo for single quantity items that aren't set (if any)
  const singleItems = await prisma.orderItem.findMany({
      where: {
          quantity: 1,
          pieceNo: { equals: 1 }, // default is 1, so they might already be 1
          deletedAt: null
      }
  });
  
  // Note: If multiple garments of same type exist in an order with qty 1, 
  // they'll all have pieceNo 1 initially. We need to fix that.
  
  const orders = await prisma.order.findMany({
      where: { deletedAt: null },
      include: { items: { where: { deletedAt: null }, orderBy: { createdAt: 'asc' } } }
  });

  for (const order of orders) {
      const gMap: Record<string, number> = {};
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
