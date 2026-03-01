import { PrismaClient, Role, FieldType, OrderStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seed starting...');

  // 1. System Settings
  await prisma.systemSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default', useTaskWorkflow: false }
  });
  console.log('Created/Ensured System Settings.');

  // 2. Create Default Branch
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

  // 3. Create Super Admin User
  const adminEmail = 'admin@tbms.com';
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Main Admin',
      passwordHash: hashedPassword,
      role: Role.SUPER_ADMIN,
      branchId: null,
    },
  });
  console.log(`Created/Ensured Super Admin: ${admin.email}`);

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

  const catShalwar = await prisma.measurementCategory.upsert({
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

  // 5. Create Employees
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

  const emp2 = await prisma.employee.upsert({
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

  // 6. Create Customers
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

  const customer2 = await prisma.customer.upsert({
    where: { sizeNumber: 'C-MAIN-0002' },
    update: {},
    create: {
      sizeNumber: 'C-MAIN-0002',
      branchId: branch.id,
      fullName: 'Zahid Hussain',
      phone: '03449998888'
    }
  });

  // 7. Create an Order
  const order = await prisma.order.upsert({
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
        create: [
          { amount: 100000, receivedById: admin.id }
        ]
      }
    }
  });

  console.log('Created Mock Employees, Customers, and Orders.');

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
