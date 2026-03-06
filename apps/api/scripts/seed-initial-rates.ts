import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting RateCard seeding...');

  // Find the admin user to use as createdById for seeded rate cards
  const adminUser = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' },
    orderBy: { createdAt: 'asc' },
  });
  if (!adminUser)
    throw new Error('No SUPER_ADMIN user found. Please seed users first.');

  const garmentTypes = await prisma.garmentType.findMany({
    include: {
      workflowSteps: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
    },
  });

  for (const garmentType of garmentTypes) {
    if (garmentType.workflowSteps.length === 0) {
      console.log(`Skipping ${garmentType.name} - no active workflow steps.`);
      continue;
    }

    console.log(`Processing ${garmentType.name}...`);

    // Ensure every active workflow step has one global open rate row.
    // Placeholder amounts start at 0 and can be updated from the rates UI.
    for (const step of garmentType.workflowSteps) {
      const existing = await prisma.rateCard.findFirst({
        where: {
          branchId: null,
          garmentTypeId: garmentType.id,
          stepKey: step.stepKey,
          effectiveTo: null,
          deletedAt: null,
        },
      });

      if (existing) {
        continue;
      }

      console.log(
        `Creating placeholder rate for ${garmentType.name} ${step.stepKey}: 0`,
      );
      await prisma.rateCard.create({
        data: {
          branchId: null,
          garmentTypeId: garmentType.id,
          stepKey: step.stepKey,
          amount: 0,
          stepTemplateId: step.id,
          createdById: adminUser.id,
          effectiveFrom: new Date('2024-01-01'),
        },
      });
    }
  }

  console.log('Seeding completed.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
