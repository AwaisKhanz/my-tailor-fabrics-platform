#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();

const REQUIRED_ROOT_TOKENS = [
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--destructive",
  "--destructive-foreground",
  "--border",
  "--input",
  "--ring",
  "--sidebar",
  "--sidebar-foreground",
  "--sidebar-border",
  "--radius",
  "--shadow-sm",
  "--shadow",
];

const REQUIRED_DARK_TOKENS = REQUIRED_ROOT_TOKENS.filter(
  (token) => token !== "--radius",
);

const REQUIRED_GLOBAL_CLASSES = [
  ".container",
  ".card",
  ".glass",
  ".meta",
  ".error",
];

const BANNED_GLOBAL_CLASSES = [
  ".page-container",
  ".section-gap",
  ".glass-panel",
  ".screen-title",
  ".subtitle",
  ".page-hero",
  ".workspace-bar-surface",
  ".sidebar-shell",
  ".stagger-1",
  ".stagger-2",
  ".stagger-3",
];

const BANNED_THEME_TOKENS = [
  "--font-ui",
  "--primary-strong",
  "--primary-soft",
  "--secondary-soft",
  "--secondary-border",
  "--surface",
  "--surface-soft",
  "--surface-strong",
  "--surface-muted",
  "--surface-panel",
  "--surface-input",
  "--panel-border",
  "--panel-border-strong",
  "--nav-surface",
  "--nav-border",
  "--code-bg",
  "--code-foreground",
  "--highlight-ring",
  "--sidebar-muted",
  "--sidebar-surface",
  "--sidebar-active",
  "--sidebar-active-foreground",
  "--status-ok",
  "--status-info",
  "--status-success-bg",
  "--status-success-border",
  "--status-success-foreground",
  "--status-warning-bg",
  "--status-warning-border",
  "--status-warning-foreground",
  "--status-danger-bg",
  "--status-danger-border",
  "--status-danger-foreground",
  "--bg-glow-cool",
  "--bg-glow-warm",
  "--bg-overlay-start",
  "--bg-overlay-end",
  "--elevation-shadow",
  "--card-shadow",
  "--button-shadow",
  "--soft-shadow",
  "--text-primary",
  "--text-secondary",
  "--text-disabled",
  "--text-inverse",
  "--divider",
  "--surface-elevated",
  "--app-bar",
  "--app-bar-foreground",
  "--overlay",
  "--overlay-strong",
];

const DELETED_PATHS = [
  "lib/theme-css.ts",
  "lib/theme-presets.ts",
  "components/ThemePresetProvider.tsx",
  "../../packages/shared-theme",
];

const REQUIRED_TAILWIND_SNIPPETS = [
  'ui: ["Inter", "SF Pro Text", "Segoe UI", "sans-serif"]',
  'sans: ["Inter", "SF Pro Text", "Segoe UI", "sans-serif"]',
  'background: "hsl(var(--background) / <alpha-value>)"',
  'foreground: "hsl(var(--foreground) / <alpha-value>)"',
  'border: "hsl(var(--border) / <alpha-value>)"',
  'input: "hsl(var(--input) / <alpha-value>)"',
  'ring: "hsl(var(--ring) / <alpha-value>)"',
  'card: {',
  'popover: {',
  'primary: {',
  'secondary: {',
  'muted: {',
  'accent: {',
  'destructive: {',
  'sidebar: {',
  'lg: "var(--radius)"',
  'sm: "var(--shadow-sm)"',
  'DEFAULT: "var(--shadow)"',
];

const BANNED_TAILWIND_SNIPPETS = [
  "var(--font-ui)",
  "surface: {",
  "panel: {",
  "nav: {",
  "code: {",
  "highlight: {",
  "status: {",
  "appBar:",
  "text:",
  "divider:",
  "inputSurface:",
  "interaction:",
  "pending:",
  "ready:",
  "overlay:",
  "soft-shadow",
  "card-shadow",
  "button-shadow",
];

const ALLOWED_EXTRA_TOKEN_PREFIXES = ["--snow-"];

function extractBlock(content, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = content.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\n\\s*\\}`, "m"));
  return match?.[1] ?? null;
}

function extractTokens(block) {
  return new Set([...block.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((match) => match[1]));
}

function diffTokens(actual, expected) {
  const missing = expected.filter((token) => !actual.has(token));
  const unexpected = [...actual].filter(
    (token) =>
      !expected.includes(token) &&
      !ALLOWED_EXTRA_TOKEN_PREFIXES.some((prefix) => token.startsWith(prefix)),
  );
  return { missing, unexpected };
}

async function pathExists(relativePath) {
  try {
    await fs.access(path.join(ROOT, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const issues = [];

  const globalsPath = path.join(ROOT, "app/globals.css");
  const tailwindPath = path.join(ROOT, "tailwind.config.ts");
  const themeContractPath = path.join(ROOT, "lib/theme.ts");
  const packageJsonPath = path.join(ROOT, "package.json");

  const [globalsCss, tailwindConfig, themeContractSource, packageJsonSource] =
    await Promise.all([
      fs.readFile(globalsPath, "utf8"),
      fs.readFile(tailwindPath, "utf8"),
      fs.readFile(themeContractPath, "utf8"),
      fs.readFile(packageJsonPath, "utf8"),
    ]);

  const rootBlock = extractBlock(globalsCss, ":root");
  const darkBlock = extractBlock(globalsCss, ".dark");

  if (!rootBlock) {
    issues.push("Missing :root theme token block in app/globals.css");
  }

  if (!darkBlock) {
    issues.push("Missing .dark theme token block in app/globals.css");
  }

  if (rootBlock) {
    const diff = diffTokens(extractTokens(rootBlock), REQUIRED_ROOT_TOKENS);
    if (diff.missing.length > 0) {
      issues.push(`Missing light theme tokens: ${diff.missing.join(", ")}`);
    }
    if (diff.unexpected.length > 0) {
      issues.push(`Unexpected light theme tokens: ${diff.unexpected.join(", ")}`);
    }
  }

  if (darkBlock) {
    const diff = diffTokens(extractTokens(darkBlock), REQUIRED_DARK_TOKENS);
    if (diff.missing.length > 0) {
      issues.push(`Missing dark theme tokens: ${diff.missing.join(", ")}`);
    }
    if (diff.unexpected.length > 0) {
      issues.push(`Unexpected dark theme tokens: ${diff.unexpected.join(", ")}`);
    }
  }

  for (const token of BANNED_THEME_TOKENS) {
    if (globalsCss.includes(token)) {
      issues.push(`Banned theme token still present in app/globals.css: ${token}`);
    }
  }

  for (const selector of REQUIRED_GLOBAL_CLASSES) {
    if (!globalsCss.includes(selector)) {
      issues.push(`Missing global utility class in app/globals.css: ${selector}`);
    }
  }

  for (const selector of BANNED_GLOBAL_CLASSES) {
    if (globalsCss.includes(selector)) {
      issues.push(`Deleted global utility class still present in app/globals.css: ${selector}`);
    }
  }

  for (const snippet of REQUIRED_TAILWIND_SNIPPETS) {
    if (!tailwindConfig.includes(snippet)) {
      issues.push(`Missing Tailwind semantic mapping snippet: ${snippet}`);
    }
  }

  for (const snippet of BANNED_TAILWIND_SNIPPETS) {
    if (tailwindConfig.includes(snippet)) {
      issues.push(`Banned Tailwind mapping still present: ${snippet}`);
    }
  }

  if (!themeContractSource.includes('export type AppTheme = "light" | "dark"')) {
    issues.push('lib/theme.ts must export AppTheme = "light" | "dark"');
  }
  if (!themeContractSource.includes('THEME_STORAGE_KEY = "masi-lite-theme"')) {
    issues.push('lib/theme.ts must export THEME_STORAGE_KEY = "masi-lite-theme"');
  }
  if (!themeContractSource.includes('THEME_COOKIE_KEY = "masi-lite-theme"')) {
    issues.push('lib/theme.ts must export THEME_COOKIE_KEY = "masi-lite-theme"');
  }

  const packageJson = JSON.parse(packageJsonSource);
  const dependencies = {
    ...(packageJson.dependencies ?? {}),
    ...(packageJson.devDependencies ?? {}),
  };

  for (const dependency of ["next-themes", "@tbms/shared-theme"]) {
    if (dependency in dependencies) {
      issues.push(`Banned dependency still present in apps/web/package.json: ${dependency}`);
    }
  }

  for (const relativePath of DELETED_PATHS) {
    if (await pathExists(relativePath)) {
      issues.push(`Deleted theme path still exists: ${relativePath}`);
    }
  }

  if (issues.length > 0) {
    console.error("Theme audit failed.\n");
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    process.exit(1);
  }

  console.log("Theme audit passed.");
}

main().catch((error) => {
  console.error("Theme audit crashed:", error);
  process.exit(1);
});
