const { Role } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function run({ prisma, env }) {
  const email = env.SEED_ADMIN_EMAIL || 'admin@mytailorandfabrics.com';
  const password = env.SEED_ADMIN_PASSWORD || 'admin123';
  const name = env.SEED_ADMIN_NAME || 'Main Admin';

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role: Role.SUPER_ADMIN,
      isActive: true,
      branchId: null,
      deletedAt: null,
    },
    create: {
      email,
      name,
      passwordHash,
      role: Role.SUPER_ADMIN,
      branchId: null,
    },
  });

  console.log(`Created/Ensured Super Admin: ${admin.email}`);
}

module.exports = {
  name: 'admin',
  description: 'Create or update the production super admin account.',
  run,
};
