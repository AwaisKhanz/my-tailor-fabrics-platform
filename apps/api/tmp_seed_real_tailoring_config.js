const { PrismaClient, FieldType } = require('@prisma/client');

const prisma = new PrismaClient();

const categories = [
  { name: 'Shalwar', fields: ['Length', 'Waist', 'Hip', 'Thigh', 'Knee', 'Bottom'] },
  { name: 'Kameez', fields: ['Length', 'Shoulder', 'Chest', 'Waist', 'Hip', 'Sleeve Length', 'Arm Hole', 'Neck', 'Cuff'] },
  { name: 'Shirt', fields: ['Length', 'Shoulder', 'Chest', 'Waist', 'Hip', 'Sleeve Length', 'Arm Hole', 'Neck', 'Collar', 'Cuff'] },
  { name: 'Pant', fields: ['Length', 'Waist', 'Hip', 'Thigh', 'Knee', 'Bottom', 'Rise'] },
  { name: 'Trouser', fields: ['Length', 'Waist', 'Hip', 'Thigh', 'Knee', 'Bottom', 'Rise'] },
  { name: 'Waistcoat', fields: ['Length', 'Shoulder', 'Chest', 'Waist', 'Hip', 'Neck'] },
  { name: 'Coat', fields: ['Length', 'Shoulder', 'Chest', 'Waist', 'Hip', 'Sleeve Length', 'Arm Hole', 'Neck', 'Cuff'] },
  { name: 'Sherwani', fields: ['Length', 'Shoulder', 'Chest', 'Waist', 'Hip', 'Sleeve Length', 'Arm Hole', 'Neck', 'Cuff'] },
];

const garments = [
  { name: 'Shalwar Kameez', customerPrice: 3500, measurementCategories: ['Shalwar', 'Kameez'], steps: [['PRE_WASHING', 'Pre-washing', 1, 100], ['CUTTING', 'Cutting', 2, 200], ['STITCHING', 'Stitching', 3, 700], ['FINISHING', 'Finishing', 4, 150]] },
  { name: 'Kameez Trouser', customerPrice: 3600, measurementCategories: ['Kameez', 'Trouser'], steps: [['PRE_WASHING', 'Pre-washing', 1, 100], ['CUTTING', 'Cutting', 2, 220], ['STITCHING', 'Stitching', 3, 750], ['FINISHING', 'Finishing', 4, 150]] },
  { name: 'Shirt', customerPrice: 1800, measurementCategories: ['Shirt'], steps: [['CUTTING', 'Cutting', 1, 150], ['STITCHING', 'Stitching', 2, 400], ['FINISHING', 'Finishing', 3, 100]] },
  { name: 'Pant', customerPrice: 2000, measurementCategories: ['Pant'], steps: [['CUTTING', 'Cutting', 1, 170], ['STITCHING', 'Stitching', 2, 450], ['FINISHING', 'Finishing', 3, 100]] },
  { name: 'Trouser', customerPrice: 2000, measurementCategories: ['Trouser'], steps: [['CUTTING', 'Cutting', 1, 170], ['STITCHING', 'Stitching', 2, 450], ['FINISHING', 'Finishing', 3, 100]] },
  { name: 'Waistcoat', customerPrice: 2500, measurementCategories: ['Waistcoat'], steps: [['CUTTING', 'Cutting', 1, 180], ['STITCHING', 'Stitching', 2, 500], ['FINISHING', 'Finishing & Button', 3, 120]] },
  { name: 'Coat', customerPrice: 8000, measurementCategories: ['Coat'], steps: [['CUTTING', 'Cutting', 1, 350], ['STITCHING', 'Stitching', 2, 1800], ['FINISHING', 'Finishing', 3, 300]] },
  { name: 'Sherwani', customerPrice: 12000, measurementCategories: ['Sherwani'], steps: [['CUTTING', 'Cutting', 1, 400], ['STITCHING', 'Stitching', 2, 2200], ['FINISHING', 'Finishing', 3, 350]] },
  { name: '2-Piece Suit', customerPrice: 9000, measurementCategories: ['Shirt', 'Pant'], steps: [['CUTTING', 'Cutting', 1, 320], ['STITCHING', 'Stitching', 2, 1600], ['FINISHING', 'Finishing', 3, 250]] },
  { name: '3-Piece Suit', customerPrice: 12500, measurementCategories: ['Shirt', 'Pant', 'Waistcoat'], steps: [['CUTTING', 'Cutting', 1, 400], ['STITCHING', 'Stitching', 2, 2200], ['FINISHING', 'Finishing', 3, 350]] },
];

async function main() {
  const admin = await prisma.user.findFirst({ where: { email: 'admin@mytailorandfabrics.com', deletedAt: null } });
  const mainBranch = await prisma.branch.findFirst({ where: { code: 'MAIN', deletedAt: null } });

  if (!admin) throw new Error('Admin user not found');
  if (!mainBranch) throw new Error('Main branch not found');

  await prisma.$transaction(async (tx) => {
    await tx.rateCard.deleteMany({});
    await tx.workflowStepTemplate.deleteMany({});
    await tx.garmentPriceLog.deleteMany({});
    await tx.garmentType.deleteMany({});
    await tx.measurementField.deleteMany({});
    await tx.measurementSection.deleteMany({});
    await tx.measurementCategory.deleteMany({});

    const categoryMap = new Map();

    for (let i = 0; i < categories.length; i += 1) {
      const category = categories[i];
      const created = await tx.measurementCategory.create({ data: { name: category.name, sortOrder: i, isActive: true } });
      const section = await tx.measurementSection.create({ data: { categoryId: created.id, name: 'Core Measurements', sortOrder: 0 } });

      for (let fieldIndex = 0; fieldIndex < category.fields.length; fieldIndex += 1) {
        await tx.measurementField.create({
          data: {
            categoryId: created.id,
            sectionId: section.id,
            label: category.fields[fieldIndex],
            fieldType: FieldType.NUMBER,
            isRequired: true,
            sortOrder: fieldIndex,
            dropdownOptions: [],
          },
        });
      }

      categoryMap.set(category.name, created.id);
    }

    for (let i = 0; i < garments.length; i += 1) {
      const garment = garments[i];
      const createdGarment = await tx.garmentType.create({
        data: {
          name: garment.name,
          customerPrice: garment.customerPrice * 100,
          sortOrder: i,
          isActive: true,
          measurementCategories: {
            connect: garment.measurementCategories.map((name) => ({ id: categoryMap.get(name) })),
          },
        },
      });

      for (const [stepKey, stepName, sortOrder, amountRupees] of garment.steps) {
        const step = await tx.workflowStepTemplate.create({
          data: {
            garmentTypeId: createdGarment.id,
            stepKey,
            stepName,
            sortOrder,
            isRequired: true,
            isActive: true,
          },
        });

        await tx.rateCard.create({
          data: {
            branchId: mainBranch.id,
            garmentTypeId: createdGarment.id,
            stepTemplateId: step.id,
            stepKey,
            amount: amountRupees * 100,
            effectiveFrom: new Date('2026-03-01T00:00:00.000Z'),
            createdById: admin.id,
          },
        });
      }
    }
  });

  console.log('Seeded tailoring configuration successfully.');
  console.log(`Measurement categories: ${categories.length}`);
  console.log(`Garments: ${garments.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
