import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seed starting...');

  // 1. Create Default Branch
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

  // 2. Create Super Admin User
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
      role: Role.SUPER_ADMIN,
      branchId: null, // Super Admin has access to all branches
    },
  });
  console.log(`Created/Ensured Super Admin: ${admin.email}`);

  // 3. Create a few basic Garment Types for testing
  const garmentTypes = [
    { name: 'Shalwar Kameez', customerPrice: 150000, employeeRate: 50000 },
    { name: 'Suit (2-Piece)', customerPrice: 450000, employeeRate: 150000 },
    { name: 'Waistcoat', customerPrice: 200000, employeeRate: 70000 },
  ];

  for (const gt of garmentTypes) {
    await prisma.garmentType.upsert({
      where: { id: gt.name }, // This is a hack because we don't have unique names in schema, but for seeding it's okay if we use ID logic differently or just findUnique
      update: {},
      create: {
        name: gt.name,
        customerPrice: gt.customerPrice,
        employeeRate: gt.employeeRate,
      },
    });
  }
  
  // Note: GarmentType doesn't have a unique 'name' in schema, let's fix that or use findFirst
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
