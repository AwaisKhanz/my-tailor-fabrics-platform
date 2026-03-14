const { PrismaClient } = require('@prisma/client');
const adminSeed = require('./seeds/admin');
const branchSeed = require('./seeds/branch');
const {
  parseRequestedTargets,
  getSeedAdminConfig,
  getSeedBranchConfig,
} = require('./seed-env');

const seedRegistry = {
  admin: adminSeed,
  branch: branchSeed,
};

function printAvailableSeeds() {
  console.log('Available seeds:');
  for (const seed of Object.values(seedRegistry)) {
    console.log(`- ${seed.name}: ${seed.description}`);
  }
}

async function main() {
  if (process.argv.includes('--list')) {
    printAvailableSeeds();
    return;
  }

  const requestedTargets = parseRequestedTargets(process.argv);
  const unknownTargets = requestedTargets.filter(
    (target) => !(target in seedRegistry),
  );

  if (unknownTargets.length > 0) {
    console.error(`Unknown seed target(s): ${unknownTargets.join(', ')}`);
    printAvailableSeeds();
    process.exit(1);
  }

  const prisma = new PrismaClient();
  const config = {
    admin: getSeedAdminConfig(),
    branch: getSeedBranchConfig(),
  };

  try {
    console.log(`Running seed target(s): ${requestedTargets.join(', ')}`);

    for (const target of requestedTargets) {
      await seedRegistry[target].run({ prisma, config });
    }

    console.log('Seed complete! 🚀');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
