const isProduction = process.env.NODE_ENV === 'production';

function resolveOptionalEnv(name) {
  const value = process.env[name];
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function resolveSeedSecret(name, devFallback) {
  const value = resolveOptionalEnv(name);
  if (value) {
    return value;
  }

  if (isProduction) {
    throw new Error(`${name} is required when running seeds in production`);
  }

  return devFallback;
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
    password: resolveSeedSecret('SEED_ADMIN_PASSWORD', 'admin123'),
    name: resolveOptionalEnv('SEED_ADMIN_NAME') ?? 'Main Admin',
  };
}

module.exports = {
  parseRequestedTargets,
  getSeedAdminConfig,
};
