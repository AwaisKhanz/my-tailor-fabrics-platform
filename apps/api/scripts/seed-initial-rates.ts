import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting RateCard seeding...');

  const garmentTypes = await prisma.garmentType.findMany({
    include: { workflowSteps: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } }
  });

  for (const gt of garmentTypes) {
    if (gt.workflowSteps.length === 0) {
      console.log(`Skipping ${gt.name} - no active workflow steps.`);
      continue;
    }

    console.log(`Processing ${gt.name}...`);

    // Basic split logic:
    // If only one step, 100%
    // If multiple, try to identify CUTTING (20%), STITCHING (60%), others (split remainder)
    
    const steps = gt.workflowSteps;
    const totalRate = gt.employeeRate;
    
    let consumedRate = 0;
    const rates = [];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      let stepRate = 0;

      if (steps.length === 1) {
        stepRate = totalRate;
      } else {
        const key = step.stepKey.toUpperCase();
        if (key.includes('CUTTING')) {
          stepRate = Math.floor(totalRate * 0.20);
        } else if (key.includes('STITCHING')) {
          // If it's the only stitching step, or the last stitching step
          stepRate = Math.floor(totalRate * 0.60);
        } else if (key.includes('PRESSING')) {
          stepRate = Math.floor(totalRate * 0.10);
        } else {
          // generic step
          const remainingSteps = steps.length - 1 - i;
          const available = totalRate - consumedRate;
          stepRate = Math.floor(available / (remainingSteps + 1));
        }
      }

      // Safeguard for the last step to take the remainder
      if (i === steps.length - 1) {
        stepRate = totalRate - consumedRate;
      }
      
      if (stepRate < 0) stepRate = 0;
      consumedRate += stepRate;

      rates.push({
        stepKey: step.stepKey,
        stepName: step.stepName,
        rate: stepRate,
        stepTemplateId: step.id
      });
    }

    // Upsert Global RateCards
    for (const r of rates) {
      const existing = await prisma.rateCard.findFirst({
        where: {
          branchId: null,
          garmentTypeId: gt.id,
          stepKey: r.stepKey,
          effectiveTo: null,
          deletedAt: null
        }
      });

      if (existing) {
        if (existing.rate !== r.rate) {
          console.log(`Updating rate for ${gt.name} ${r.stepKey}: ${existing.rate} -> ${r.rate}`);
          await prisma.rateCard.update({
            where: { id: existing.id },
            data: { rate: r.rate }
          });
        }
      } else {
        console.log(`Creating rate for ${gt.name} ${r.stepKey}: ${r.rate}`);
        await prisma.rateCard.create({
          data: {
            branchId: null,
            garmentTypeId: gt.id,
            stepKey: r.stepKey,
            rate: r.rate,
            stepTemplateId: r.stepTemplateId,
            effectiveFrom: new Date('2024-01-01') // arbitrary past date for initial seed
          }
        });
      }
    }
  }

  console.log('Seeding completed.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
