import { PrismaClient, Role, FieldType, OrderStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  COAT_INITIAL_RATES,
  COAT_WORKFLOW_STEP_PRESETS,
  SHALWAR_KAMEEZ_INITIAL_RATES,
  SHALWAR_KAMEEZ_WORKFLOW_STEP_PRESETS,
} from '@tbms/shared-constants';

const prisma = new PrismaClient();
const isEnvTrue = (value?: string) =>
  (value ?? '').trim().toLowerCase() === 'true';
const shouldSeedCoreData = isEnvTrue(process.env.SEED_CORE_DATA);
const shouldSeedDemoData =
  isEnvTrue(process.env.SEED_DEMO_DATA);
const shouldSeedCoreCatalogData = shouldSeedCoreData || shouldSeedDemoData;

async function main() {
  console.log('Seed starting...');
  console.log(
    `Core catalog data seeding: ${shouldSeedCoreCatalogData ? 'enabled' : 'disabled'}`,
  );
  console.log(
    `Demo transactional data seeding: ${shouldSeedDemoData ? 'enabled' : 'disabled'}`,
  );

  // 1. Create Super Admin User
  const adminEmail = 'admin@tbms.com';
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Main Admin',
      passwordHash: hashedPassword,
      role: Role.SUPER_ADMIN,
      isActive: true,
      branchId: null,
      deletedAt: null,
    },
    create: {
      email: adminEmail,
      name: 'Main Admin',
      passwordHash: hashedPassword,
      role: Role.SUPER_ADMIN,
      branchId: null,
    },
  });
  console.log(`Created/Ensured Super Admin: ${admin.email}`);

  if (!shouldSeedCoreCatalogData) {
    console.log(
      'Skipped settings/catalog templates (set SEED_CORE_DATA=true or SEED_DEMO_DATA=true to include).',
    );
    console.log('Seed complete! 🚀');
    return;
  }

  // 2. System Settings
  await prisma.systemSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default', useTaskWorkflow: false }
  });
  console.log('Created/Ensured System Settings.');

  // 3. Create Default Branch
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

  // 4. Create Garment Types & Measurement Categories
  const gtShalwar = await prisma.garmentType.upsert({
    where: { id: 'gt_shalwar_kameez' },
    update: {},
    create: {
      id: 'gt_shalwar_kameez',
      name: 'Shalwar Kameez',
      customerPrice: 150000,
      employeeRate: 50000,
    },
  });

  // Shalwar Kameez Workflow Steps
  for (const step of SHALWAR_KAMEEZ_WORKFLOW_STEP_PRESETS) {
    await prisma.workflowStepTemplate.upsert({
      where: {
        garmentTypeId_stepKey: {
          garmentTypeId: gtShalwar.id,
          stepKey: step.stepKey,
        },
      },
      update: {},
      create: {
        garmentTypeId: gtShalwar.id,
        stepKey: step.stepKey,
        stepName: step.stepName,
        sortOrder: step.sortOrder,
        isRequired: step.isRequired,
      }
    });
  }

  const gtCoat = await prisma.garmentType.upsert({
    where: { id: 'gt_coat' },
    update: {},
    create: {
      id: 'gt_coat',
      name: 'Coat',
      customerPrice: 2000000,
      employeeRate: 800000,
    },
  });

  // Coat Workflow Steps
  for (const step of COAT_WORKFLOW_STEP_PRESETS) {
    const template = await prisma.workflowStepTemplate.upsert({
      where: {
        garmentTypeId_stepKey: { garmentTypeId: gtCoat.id, stepKey: step.stepKey },
      },
      update: {},
      create: {
        garmentTypeId: gtCoat.id,
        stepKey: step.stepKey,
        stepName: step.stepName,
        sortOrder: step.sortOrder,
        isRequired: step.isRequired,
      }
    });

    const seededRateAmount = COAT_INITIAL_RATES[step.stepKey];
    if (typeof seededRateAmount === 'number') {
      await prisma.rateCard.upsert({
        where: { id: `rate_coat_${step.stepKey.toLowerCase()}` },
        update: {},
        create: {
          id: `rate_coat_${step.stepKey.toLowerCase()}`,
          garmentTypeId: gtCoat.id,
          stepKey: step.stepKey,
          stepTemplateId: template.id,
          amount: seededRateAmount,
          createdById: admin.id,
          effectiveFrom: new Date('2025-01-01'),
        }
      });
    }
  }

  for (const step of SHALWAR_KAMEEZ_WORKFLOW_STEP_PRESETS) {
    const template = await prisma.workflowStepTemplate.findUnique({
      where: {
        garmentTypeId_stepKey: {
          garmentTypeId: gtShalwar.id,
          stepKey: step.stepKey,
        },
      },
    });
    const seededRateAmount = SHALWAR_KAMEEZ_INITIAL_RATES[step.stepKey];
    if (template && typeof seededRateAmount === 'number') {
      await prisma.rateCard.upsert({
        where: { id: `rate_sk_${step.stepKey.toLowerCase()}` },
        update: {},
        create: {
          id: `rate_sk_${step.stepKey.toLowerCase()}`,
          garmentTypeId: gtShalwar.id,
          stepKey: step.stepKey,
          stepTemplateId: template.id,
          amount: seededRateAmount,
          createdById: admin.id,
          effectiveFrom: new Date('2025-01-01'),
        }
      });
    }
  }

  await prisma.measurementCategory.upsert({
    where: { id: 'cat_shalwar' },
    update: {},
    create: {
      id: 'cat_shalwar',
      name: 'Shalwar Kameez Measurements',
      fields: {
        create: [
          { label: 'Shoulder', fieldType: FieldType.NUMBER, unit: 'inches' },
          { label: 'Chest', fieldType: FieldType.NUMBER, unit: 'inches' },
          { label: 'Length', fieldType: FieldType.NUMBER, unit: 'inches' }
        ]
      },
      garmentTypes: { connect: [{ id: gtShalwar.id }] }
    }
  });

  if (shouldSeedDemoData) {
    // 5. Create demo Employees
    const emp1 = await prisma.employee.upsert({
      where: { employeeCode: 'EMP-MAIN-0001' },
      update: {},
      create: {
        employeeCode: 'EMP-MAIN-0001',
        branchId: branch.id,
        fullName: 'Ahmed Raza',
        phone: '03001234567',
        designation: 'Master Tailor'
      }
    });

    await prisma.employee.upsert({
      where: { employeeCode: 'EMP-MAIN-0002' },
      update: {},
      create: {
        employeeCode: 'EMP-MAIN-0002',
        branchId: branch.id,
        fullName: 'Ali Khan',
        phone: '03007654321',
        designation: 'Tailor'
      }
    });

    // 6. Create demo Customers
    const customer1 = await prisma.customer.upsert({
      where: { sizeNumber: 'C-MAIN-0001' },
      update: {},
      create: {
        sizeNumber: 'C-MAIN-0001',
        branchId: branch.id,
        fullName: 'Kamran Ali',
        phone: '03331112222'
      }
    });

    await prisma.customer.upsert({
      where: { sizeNumber: 'C-MAIN-0002' },
      update: {},
      create: {
        sizeNumber: 'C-MAIN-0002',
        branchId: branch.id,
        fullName: 'Zahid Hussain',
        phone: '03449998888'
      }
    });

    // 7. Create demo Order
    await prisma.order.upsert({
      where: { orderNumber: 'ORD-2025-MAIN-00001' },
      update: {},
      create: {
        orderNumber: 'ORD-2025-MAIN-00001',
        branchId: branch.id,
        customerId: customer1.id,
        createdById: admin.id,
        subtotal: 300000,
        totalAmount: 300000,
        balanceDue: 200000,
        totalPaid: 100000,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        status: OrderStatus.IN_PROGRESS,
        items: {
          create: [
            {
              garmentTypeId: gtShalwar.id,
              garmentTypeName: gtShalwar.name,
              quantity: 2,
              unitPrice: gtShalwar.customerPrice,
              employeeRate: gtShalwar.employeeRate,
              employeeId: emp1.id,
            }
          ]
        },
        payments: {
          create: [{ amount: 100000, receivedById: admin.id }]
        }
      }
    });

    console.log('Seeded demo employees, customers, and orders.');
  } else {
    console.log(
      'Skipped demo employees/customers/orders (set SEED_DEMO_DATA=true to include).',
    );
  }

  // 8. Create Initial Design Types
  const designTypes = [
    { name: 'Simple', price: 20000, rate: 10000, sortOrder: 1 },
    { name: 'Heavy', price: 30000, rate: 15000, sortOrder: 2 },
    { name: 'Custom', price: 0, rate: 0, sortOrder: 3 },
  ];

  for (const dt of designTypes) {
    await prisma.designType.upsert({
      where: { id: `dt_${dt.name.toLowerCase()}` },
      update: {},
      create: {
        id: `dt_${dt.name.toLowerCase()}`,
        name: dt.name,
        defaultPrice: dt.price,
        defaultRate: dt.rate,
        sortOrder: dt.sortOrder,
        isActive: true,
      }
    });
  }
  console.log('Seeded Design Types.');

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
