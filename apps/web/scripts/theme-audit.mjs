#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();

function failWithIssues(issues) {
  if (issues.length === 0) {
    console.log("Theme audit passed.");
    return;
  }

  console.error("Theme audit failed.\n");
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

async function readJson(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  const source = await fs.readFile(filePath, "utf8");
  return JSON.parse(source);
}

async function ensureExists(relativePath, issues) {
  try {
    await fs.access(path.join(ROOT, relativePath));
  } catch {
    issues.push(`Missing required file: ${relativePath}`);
  }
}

async function main() {
  const issues = [];

  await Promise.all([
    ensureExists("../../packages/ui/components.json", issues),
    ensureExists("../../packages/ui/src/styles/globals.css", issues),
    ensureExists("tailwind.config.ts", issues),
    ensureExists("app/layout.tsx", issues),
    ensureExists("components/ThemeProvider.tsx", issues),
    ensureExists("lib/theme.ts", issues),
  ]);

  const [webPackage, webComponents, uiPackage, uiComponents] =
    await Promise.all([
      readJson("package.json"),
      readJson("components.json"),
      readJson("../../packages/ui/package.json"),
      readJson("../../packages/ui/components.json"),
    ]);

  const webDeps = {
    ...(webPackage.dependencies ?? {}),
    ...(webPackage.devDependencies ?? {}),
  };
  if (!("@tbms/ui" in webDeps)) {
    issues.push("apps/web/package.json must depend on @tbms/ui.");
  }
  if (!("next-themes" in webDeps)) {
    issues.push("apps/web/package.json must depend on next-themes.");
  }

  if (webComponents.style !== "base-nova") {
    issues.push(`apps/web/components.json style must be "base-nova".`);
  }
  if (webComponents.rtl !== false) {
    issues.push("apps/web/components.json must keep rtl=false for phase 1.");
  }
  if (webComponents?.aliases?.ui !== "@tbms/ui/components") {
    issues.push('apps/web/components.json aliases.ui must be "@tbms/ui/components".');
  }
  if (webComponents?.aliases?.utils !== "@tbms/ui/lib/utils") {
    issues.push('apps/web/components.json aliases.utils must be "@tbms/ui/lib/utils".');
  }

  if (uiPackage.name !== "@tbms/ui") {
    issues.push('packages/ui/package.json name must be "@tbms/ui".');
  }
  if (!("@base-ui/react" in (uiPackage.dependencies ?? {}))) {
    issues.push("packages/ui/package.json must include @base-ui/react dependency.");
  }
  if (uiComponents.style !== "base-nova") {
    issues.push(`packages/ui/components.json style must be "base-nova".`);
  }

  const [layoutSource, themeProviderSource, themeSource, globalsSource, tailwindSource] = await Promise.all([
    fs.readFile(path.join(ROOT, "app/layout.tsx"), "utf8"),
    fs.readFile(path.join(ROOT, "components/ThemeProvider.tsx"), "utf8"),
    fs.readFile(path.join(ROOT, "lib/theme.ts"), "utf8"),
    fs.readFile(path.join(ROOT, "../../packages/ui/src/styles/globals.css"), "utf8"),
    fs.readFile(path.join(ROOT, "tailwind.config.ts"), "utf8"),
  ]);

  if (!layoutSource.includes('import "@tbms/ui/globals.css";')) {
    issues.push('app/layout.tsx must import "@tbms/ui/globals.css".');
  }

  if (!themeProviderSource.includes("next-themes")) {
    issues.push("ThemeProvider must use next-themes.");
  }
  if (!themeSource.includes("THEME_STORAGE_KEY")) {
    issues.push("lib/theme.ts must export THEME_STORAGE_KEY.");
  }
  if (themeSource.includes("THEME_COOKIE_KEY")) {
    issues.push("lib/theme.ts must not export THEME_COOKIE_KEY after next-themes migration.");
  }
  if (globalsSource.includes("--snow-") || globalsSource.includes("snow-")) {
    issues.push(
      "packages/ui/src/styles/globals.css must not contain legacy snow tokens or snow utility names.",
    );
  }
  if (tailwindSource.includes("snow-") || tailwindSource.includes("--snow-")) {
    issues.push("tailwind.config.ts must not include legacy snow token mappings.");
  }

  failWithIssues(issues);
}

main().catch((error) => {
  console.error("Theme audit crashed:", error);
  process.exit(1);
});
