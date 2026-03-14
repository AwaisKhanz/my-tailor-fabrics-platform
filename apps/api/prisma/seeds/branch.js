async function run({ prisma, config }) {
  const code = config.branch.code.trim().toUpperCase();
  const name = config.branch.name.trim();

  if (!code) {
    throw new Error('SEED_BRANCH_CODE must not be empty');
  }
  if (!name) {
    throw new Error('SEED_BRANCH_NAME must not be empty');
  }

  const branch = await prisma.branch.upsert({
    where: { code },
    update: {
      name,
      address: config.branch.address ?? null,
      phone: config.branch.phone ?? null,
      isActive: true,
      deletedAt: null,
    },
    create: {
      code,
      name,
      address: config.branch.address ?? null,
      phone: config.branch.phone ?? null,
      isActive: true,
    },
  });

  console.log(`Created/Ensured Branch: ${branch.code} (${branch.name})`);
}

module.exports = {
  name: 'branch',
  description:
    'Create or update a branch by code (defaults to MAIN / Main Branch).',
  run,
};
