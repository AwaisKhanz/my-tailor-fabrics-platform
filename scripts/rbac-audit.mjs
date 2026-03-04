import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const SHARED_POLICY_PATH = path.join(
  ROOT,
  "packages/shared-constants/src/authz.ts",
);
const SHARED_PERMISSIONS_PATH = path.join(
  ROOT,
  "packages/shared-types/src/authz.ts",
);
const FRONTEND_APP_DIR = path.join(ROOT, "apps/web/app");
const API_SRC_DIR = path.join(ROOT, "apps/api/src");
const REPORT_PATH = path.join(ROOT, "docs/rbac-audit-latest.md");
const FRONTEND_ONLY_PERMISSIONS = new Set([
  "appearance.manage",
]);

const HTTP_DECORATOR_PATTERN =
  /@(Get|Post|Put|Patch|Delete|Head|Options|All)\b/;
const PUBLIC_CONTROLLER_ALLOWLIST = new Set([
  "apps/api/src/app.controller.ts",
  "apps/api/src/auth/auth.controller.ts",
  "apps/api/src/orders/status.controller.ts",
]);

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function parseQuotedValues(value) {
  return [...value.matchAll(/["']([^"']+)["']/g)].map((match) => match[1]);
}

async function* walkFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      yield* walkFiles(fullPath);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    yield fullPath;
  }
}

function parsePermissionUniverse(content) {
  const blockMatch = content.match(
    /export const PERMISSIONS\s*=\s*\[([\s\S]*?)\]\s*as const;/m,
  );
  if (!blockMatch) {
    return [];
  }
  return parseQuotedValues(blockMatch[1]);
}

function parseRoutePolicies(content) {
  const blockMatch = content.match(
    /export const ROUTE_PERMISSION_POLICIES:[\s\S]*?=\s*\[([\s\S]*?)\]\s*;/m,
  );
  if (!blockMatch) {
    return [];
  }

  const policies = [];
  const objectMatches = [...blockMatch[1].matchAll(/\{([\s\S]*?)\}/g)];
  for (const objectMatch of objectMatches) {
    const body = objectMatch[1] ?? "";
    const pathnameMatch = body.match(/pathnamePrefix:\s*['"]([^'"]+)['"]/);
    if (!pathnameMatch) {
      continue;
    }

    const requireAllMatch = body.match(/requireAll:\s*\[([^\]]*)\]/);
    const requireAnyMatch = body.match(/requireAny:\s*\[([^\]]*)\]/);

    policies.push({
      pathnamePrefix: pathnameMatch[1],
      requireAll: requireAllMatch ? parseQuotedValues(requireAllMatch[1]) : [],
      requireAny: requireAnyMatch ? parseQuotedValues(requireAnyMatch[1]) : [],
    });
  }

  return policies;
}

function normalizeRoute(route) {
  if (!route || route === "/") {
    return "/";
  }
  return route.endsWith("/") ? route.slice(0, -1) : route;
}

function pageFileToRoute(relativeAppPath) {
  const withoutPage = relativeAppPath.replace(/\/page\.tsx$/, "");
  const parts = withoutPage.split("/").filter(Boolean);
  const filtered = parts.filter((part) => !(part.startsWith("(") && part.endsWith(")")));
  const route = `/${filtered.join("/")}`;
  return normalizeRoute(route);
}

function resolvePolicy(route, policies) {
  const normalized = normalizeRoute(route);
  const sorted = [...policies].sort(
    (left, right) => right.pathnamePrefix.length - left.pathnamePrefix.length,
  );

  return (
    sorted.find((policy) => {
      if (policy.pathnamePrefix === "/") {
        return normalized === "/";
      }
      return (
        normalized === policy.pathnamePrefix ||
        normalized.startsWith(`${policy.pathnamePrefix}/`)
      );
    }) ?? null
  );
}

async function collectFrontendGuards() {
  const guards = [];

  for await (const fullPath of walkFiles(FRONTEND_APP_DIR)) {
    if (!fullPath.endsWith("page.tsx")) {
      continue;
    }

    const relative = toPosix(path.relative(FRONTEND_APP_DIR, fullPath));
    if (!relative.startsWith("(dashboard)/")) {
      continue;
    }

    const content = await fs.readFile(fullPath, "utf8");
    if (!content.includes("withRoleGuard(")) {
      continue;
    }

    const guardMatch = content.match(
      /withRoleGuard\s*\(\s*[^,]+,\s*\{([\s\S]*?)\}\s*\)/m,
    );
    if (!guardMatch) {
      continue;
    }

    const guardConfig = guardMatch[1] ?? "";
    const allMatch = guardConfig.match(/all:\s*\[([^\]]*)\]/m);
    const anyMatch = guardConfig.match(/any:\s*\[([^\]]*)\]/m);
    const rolesMatch = guardConfig.match(/roles:\s*\[([^\]]*)\]/m);

    guards.push({
      file: `apps/web/app/${relative}`,
      route: pageFileToRoute(relative),
      all: allMatch ? parseQuotedValues(allMatch[1]) : [],
      any: anyMatch ? parseQuotedValues(anyMatch[1]) : [],
      roles: rolesMatch ? parseQuotedValues(rolesMatch[1]) : [],
    });
  }

  return guards.sort((left, right) => left.route.localeCompare(right.route));
}

async function collectBackendAuthz() {
  const usedPermissions = new Set();
  const uncoveredMethods = [];

  for await (const fullPath of walkFiles(API_SRC_DIR)) {
    if (!fullPath.endsWith(".controller.ts")) {
      continue;
    }

    const relative = toPosix(path.relative(ROOT, fullPath));
    const content = await fs.readFile(fullPath, "utf8");
    const classDecoratorMatch = content.match(
      /((?:@\w+(?:\([^)]*\))?\s*)*)\s*export class\s+\w+/m,
    );
    const classDecorators = classDecoratorMatch?.[1] ?? "";
    const hasClassPermissionDecorator =
      classDecorators.includes("@RequirePermissions(") ||
      classDecorators.includes("@RequireAnyPermissions(");

    for (const match of content.matchAll(/@RequirePermissions\(([^)]*)\)/g)) {
      for (const permission of parseQuotedValues(match[1] ?? "")) {
        usedPermissions.add(permission);
      }
    }
    for (const match of content.matchAll(/@RequireAnyPermissions\(([^)]*)\)/g)) {
      for (const permission of parseQuotedValues(match[1] ?? "")) {
        usedPermissions.add(permission);
      }
    }

    const methodMatches = [
      ...content.matchAll(
        /((?:@\w+(?:\([^)]*\))?\s*)+)\s*(?:async\s+)?([A-Za-z0-9_]+)\s*\(/g,
      ),
    ];

    for (const methodMatch of methodMatches) {
      const decorators = methodMatch[1] ?? "";
      const methodName = methodMatch[2] ?? "unknown";

      if (!HTTP_DECORATOR_PATTERN.test(decorators)) {
        continue;
      }

      const hasPermissionDecorator =
        decorators.includes("@RequirePermissions(") ||
        decorators.includes("@RequireAnyPermissions(");

      if (hasPermissionDecorator || hasClassPermissionDecorator) {
        continue;
      }

      if (PUBLIC_CONTROLLER_ALLOWLIST.has(relative)) {
        continue;
      }

      if (decorators.includes("@Public(") || decorators.includes("@Public")) {
        continue;
      }

      uncoveredMethods.push({
        file: relative,
        method: methodName,
      });
    }
  }

  return {
    usedPermissions,
    uncoveredMethods,
  };
}

function formatPermissionList(list) {
  if (!list || list.length === 0) {
    return "—";
  }
  return list.map((item) => `\`${item}\``).join(", ");
}

async function writeReport({
  guards,
  routePolicies,
  routeIssues,
  backendPermissions,
  uncoveredMethods,
  policyPermissionIssues,
  unknownPermissionIssues,
}) {
  const rows = guards.map((guard) => {
    const policy = resolvePolicy(guard.route, routePolicies);
    const guardPermissions = [...guard.all, ...guard.any];
    const statusIssues = routeIssues.filter((issue) => issue.file === guard.file);
    const status = statusIssues.length > 0 ? "FAIL" : "PASS";

    return `| \`${guard.route}\` | ${formatPermissionList(
      policy ? [...policy.requireAll, ...policy.requireAny] : [],
    )} | ${formatPermissionList(guardPermissions)} | ${status} |`;
  });

  const uncoveredRows =
    uncoveredMethods.length === 0
      ? "- None"
      : uncoveredMethods
          .map((item) => `- \`${item.file}\` -> \`${item.method}()\``)
          .join("\n");

  const backendPermissionRows =
    backendPermissions.size === 0
      ? "- None"
      : [...backendPermissions]
          .sort((a, b) => a.localeCompare(b))
          .map((permission) => `- \`${permission}\``)
          .join("\n");

  const report = [
    "# RBAC Audit Matrix",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Frontend Guard vs Route Policy",
    "",
    "| Route | Policy Permissions | Guard Permissions | Status |",
    "|---|---|---|---|",
    ...rows,
    "",
    "## Backend Decorator Coverage",
    "",
    uncoveredRows,
    "",
    "## Backend Decorator Permission Set",
    "",
    backendPermissionRows,
    "",
    "## Audit Summary",
    "",
    `- Route parity issues: ${routeIssues.length}`,
    `- Unknown guard permissions: ${unknownPermissionIssues.length}`,
    `- Policy permissions missing in backend decorators: ${policyPermissionIssues.length}`,
    `- Backend HTTP methods missing permission decorators: ${uncoveredMethods.length}`,
    "",
  ].join("\n");

  await fs.writeFile(REPORT_PATH, report, "utf8");
}

async function main() {
  const sharedPolicyContent = await fs.readFile(SHARED_POLICY_PATH, "utf8");
  const sharedPermissionsContent = await fs.readFile(
    SHARED_PERMISSIONS_PATH,
    "utf8",
  );

  const routePolicies = parseRoutePolicies(sharedPolicyContent);
  const permissionUniverse = new Set(
    parsePermissionUniverse(sharedPermissionsContent),
  );
  const frontendGuards = await collectFrontendGuards();
  const backend = await collectBackendAuthz();

  const issues = [];
  const routeIssues = [];
  const unknownPermissionIssues = [];
  const policyPermissionIssues = [];

  for (const guard of frontendGuards) {
    const policy = resolvePolicy(guard.route, routePolicies);
    if (!policy) {
      const issue = `[RoutePolicy] ${guard.file}: No matching shared route policy for route "${guard.route}"`;
      issues.push(issue);
      routeIssues.push({ file: guard.file, issue });
      continue;
    }

    const allSet = new Set(guard.all);
    const combinedGuardPermissions = new Set([...guard.all, ...guard.any]);

    for (const required of policy.requireAll) {
      if (!allSet.has(required)) {
        const issue = `[RouteGuard] ${guard.file}: Missing required policy permission "${required}" in guard all[]`;
        issues.push(issue);
        routeIssues.push({ file: guard.file, issue });
      }
    }

    if (policy.requireAny.length > 0) {
      const hasAny = policy.requireAny.some((permission) =>
        combinedGuardPermissions.has(permission),
      );
      if (!hasAny) {
        const issue = `[RouteGuard] ${guard.file}: Guard does not satisfy policy requireAny (${policy.requireAny.join(", ")})`;
        issues.push(issue);
        routeIssues.push({ file: guard.file, issue });
      }
    }

    for (const permission of combinedGuardPermissions) {
      if (!permissionUniverse.has(permission)) {
        const issue = `[GuardPermission] ${guard.file}: Unknown permission "${permission}"`;
        issues.push(issue);
        unknownPermissionIssues.push({ file: guard.file, permission });
      }
    }
  }

  const policyPermissionSet = new Set(
    routePolicies.flatMap((policy) => [
      ...policy.requireAll,
      ...policy.requireAny,
    ]),
  );

  for (const permission of policyPermissionSet) {
    if (FRONTEND_ONLY_PERMISSIONS.has(permission)) {
      continue;
    }
    if (!backend.usedPermissions.has(permission)) {
      const issue = `[BackendPermission] Route policy permission "${permission}" is not present in backend RequirePermissions decorators`;
      issues.push(issue);
      policyPermissionIssues.push(permission);
    }
  }

  for (const uncovered of backend.uncoveredMethods) {
    issues.push(
      `[BackendDecorator] ${uncovered.file}: HTTP method "${uncovered.method}()" is missing @RequirePermissions/@RequireAnyPermissions`,
    );
  }

  await writeReport({
    guards: frontendGuards,
    routePolicies,
    routeIssues,
    backendPermissions: backend.usedPermissions,
    uncoveredMethods: backend.uncoveredMethods,
    policyPermissionIssues,
    unknownPermissionIssues,
  });

  if (issues.length > 0) {
    console.error("RBAC audit failed. Violations found:\n");
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    console.error(`\nDetailed matrix report: ${toPosix(path.relative(ROOT, REPORT_PATH))}`);
    process.exit(1);
  }

  console.log("RBAC audit passed. No violations found.");
  console.log(`Detailed matrix report: ${toPosix(path.relative(ROOT, REPORT_PATH))}`);
}

main().catch((error) => {
  console.error("RBAC audit crashed:", error);
  process.exit(1);
});
