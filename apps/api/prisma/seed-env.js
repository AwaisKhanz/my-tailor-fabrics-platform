function resolveOptionalEnv(name) {
  const value = process.env[name];
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseRequestedTargets(argv) {
  const cliTarget = argv.slice(2).find((arg) => arg.startsWith('--target='));
  const rawTargets =
    cliTarget?.slice('--target='.length) ??
    resolveOptionalEnv('SEED_TARGET') ??
    'admin';

  return rawTargets
    .split(',')
    .map((target) => target.trim().toLowerCase())
    .filter(Boolean);
}

function getSeedAdminConfig() {
  return {
    email:
      resolveOptionalEnv('SEED_ADMIN_EMAIL') ??
      'admin@mytailorandfabrics.com',
    password: resolveOptionalEnv('SEED_ADMIN_PASSWORD') ?? 'admin123',
    name: resolveOptionalEnv('SEED_ADMIN_NAME') ?? 'Main Admin',
  };
}

module.exports = {
  parseRequestedTargets,
  getSeedAdminConfig,
};
