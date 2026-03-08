const { PrismaClient } = require('@prisma/client');
const adminSeed = require('./seeds/admin');

const seedRegistry = {
  admin: adminSeed,
};

function parseRequestedTargets(argv, env) {
  const cliTarget = argv
    .slice(2)
    .find((arg) => arg.startsWith('--target='));
  const rawTargets =
    cliTarget?.slice('--target='.length) ??
    env.SEED_TARGET ??
    'admin';

  return rawTargets
    .split(',')
    .map((target) => target.trim().toLowerCase())
    .filter(Boolean);
}

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

  const requestedTargets = parseRequestedTargets(process.argv, process.env);
  const unknownTargets = requestedTargets.filter(
    (target) => !(target in seedRegistry),
  );

  if (unknownTargets.length > 0) {
    console.error(`Unknown seed target(s): ${unknownTargets.join(', ')}`);
    printAvailableSeeds();
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    console.log(`Running seed target(s): ${requestedTargets.join(', ')}`);

    for (const target of requestedTargets) {
      await seedRegistry[target].run({ prisma, env: process.env });
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
