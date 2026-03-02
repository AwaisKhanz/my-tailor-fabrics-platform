"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Starting RateCard seeding...');
    const adminUser = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' }, orderBy: { createdAt: 'asc' } });
    if (!adminUser)
        throw new Error('No SUPER_ADMIN user found. Please seed users first.');
    const garmentTypes = await prisma.garmentType.findMany({
        include: { workflowSteps: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } }
    });
    for (const gt of garmentTypes) {
        if (gt.workflowSteps.length === 0) {
            console.log(`Skipping ${gt.name} - no active workflow steps.`);
            continue;
        }
        console.log(`Processing ${gt.name}...`);
        const steps = gt.workflowSteps;
        const totalRate = gt.employeeRate;
        let consumedRate = 0;
        const rates = [];
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            let stepRate = 0;
            if (steps.length === 1) {
                stepRate = totalRate;
            }
            else {
                const key = step.stepKey.toUpperCase();
                if (key.includes('CUTTING')) {
                    stepRate = Math.floor(totalRate * 0.20);
                }
                else if (key.includes('STITCHING')) {
                    stepRate = Math.floor(totalRate * 0.60);
                }
                else if (key.includes('PRESSING')) {
                    stepRate = Math.floor(totalRate * 0.10);
                }
                else {
                    const remainingSteps = steps.length - 1 - i;
                    const available = totalRate - consumedRate;
                    stepRate = Math.floor(available / (remainingSteps + 1));
                }
            }
            if (i === steps.length - 1) {
                stepRate = totalRate - consumedRate;
            }
            if (stepRate < 0)
                stepRate = 0;
            consumedRate += stepRate;
            rates.push({
                stepKey: step.stepKey,
                stepName: step.stepName,
                amount: stepRate,
                stepTemplateId: step.id
            });
        }
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
                if (existing.amount !== r.amount) {
                    console.log(`Updating rate for ${gt.name} ${r.stepKey}: ${existing.amount} -> ${r.amount}`);
                    await prisma.rateCard.update({
                        where: { id: existing.id },
                        data: { amount: r.amount }
                    });
                }
            }
            else {
                console.log(`Creating rate for ${gt.name} ${r.stepKey}: ${r.amount}`);
                await prisma.rateCard.create({
                    data: {
                        branchId: null,
                        garmentTypeId: gt.id,
                        stepKey: r.stepKey,
                        amount: r.amount,
                        stepTemplateId: r.stepTemplateId,
                        createdById: adminUser.id,
                        effectiveFrom: new Date('2024-01-01')
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
//# sourceMappingURL=seed-initial-rates.js.map