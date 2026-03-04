import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TARGET_DIRS = ["app", "components", "lib"];
const FILE_EXTENSIONS = new Set([".ts", ".tsx", ".css"]);

const allowColorLiteralFiles = new Set([
  "../../packages/shared-theme/src/theme-presets.ts",
]);

const allowInlineBackgroundStyleFiles = new Set([
  "components/config/appearance/appearance-settings-page.tsx",
]);

const requiredCssTokenBlocks = [
  { selector: ":root,\n  :root[data-theme-preset=\"modern-minimal\"]", label: "Modern Minimal Light" },
  { selector: ".dark,\n  .dark[data-theme-preset=\"modern-minimal\"]", label: "Modern Minimal Dark" },
  { selector: ":root[data-theme-preset=\"heritage-craft\"]", label: "Heritage Craft Light" },
  { selector: ".dark[data-theme-preset=\"heritage-craft\"]", label: "Heritage Craft Dark" },
  { selector: ":root[data-theme-preset=\"royal-atelier\"]", label: "Royal Atelier Light" },
  { selector: ".dark[data-theme-preset=\"royal-atelier\"]", label: "Royal Atelier Dark" },
];

const requiredCssTokens = [
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
  "--success",
  "--success-foreground",
  "--warning",
  "--warning-foreground",
  "--info",
  "--info-foreground",
  "--pending",
  "--pending-foreground",
  "--ready",
  "--ready-foreground",
  "--brand-dark",
  "--overlay",
  "--overlay-strong",
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5",
  "--chart-6",
  "--chart-7",
  "--chart-8",
];

const expectedRoutes = [
  "app/(dashboard)/page.tsx",
  "app/(dashboard)/my-orders/page.tsx",
  "app/(dashboard)/orders/page.tsx",
  "app/(dashboard)/orders/new/page.tsx",
  "app/(dashboard)/orders/[id]/page.tsx",
  "app/(dashboard)/customers/page.tsx",
  "app/(dashboard)/customers/[id]/page.tsx",
  "app/(dashboard)/employees/page.tsx",
  "app/(dashboard)/employees/[id]/page.tsx",
  "app/(dashboard)/payments/page.tsx",
  "app/(dashboard)/expenses/page.tsx",
  "app/(dashboard)/reports/page.tsx",
  "app/(dashboard)/settings/page.tsx",
  "app/(dashboard)/settings/branches/page.tsx",
  "app/(dashboard)/settings/branches/[id]/page.tsx",
  "app/(dashboard)/settings/garments/page.tsx",
  "app/(dashboard)/settings/garments/[id]/page.tsx",
  "app/(dashboard)/settings/measurements/page.tsx",
  "app/(dashboard)/settings/measurements/[id]/page.tsx",
  "app/(dashboard)/settings/rates/page.tsx",
  "app/(dashboard)/settings/design-types/page.tsx",
  "app/(dashboard)/settings/users/page.tsx",
  "app/(dashboard)/settings/appearance/page.tsx",
  "app/login/page.tsx",
  "app/status/[token]/page.tsx",
  "app/unauthorized/page.tsx",
];

const rules = [
  {
    name: "Hardcoded hex color",
    regex: /#[0-9A-Fa-f]{3,8}\b/g,
    allow: (relativePath) => allowColorLiteralFiles.has(relativePath),
  },
  {
    name: "Hardcoded rgba/rgb color",
    regex: /rgba?\(/g,
    allow: (relativePath) => allowColorLiteralFiles.has(relativePath),
  },
  {
    name: "Raw black/white utility class",
    regex: /\b(?:bg|text|border|ring|from|to|via|shadow)-(?:black|white)(?:\/\d{1,3})?\b/g,
    allow: () => false,
  },
  {
    name: "Raw Tailwind palette utility class",
    regex:
      /\b(?:bg|text|border|ring|from|to|via|stroke|fill|shadow)-(?:black|white|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)(?:-\d{1,3})?(?:\/\d{1,3})?\b/g,
    allow: () => false,
  },
  {
    name: "Inline background/backgroundColor style",
    regex: /style=\{\{[\s\S]*?background(?:Color)?\s*:/g,
    allow: (relativePath) => allowInlineBackgroundStyleFiles.has(relativePath),
  },
];

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

    const extension = path.extname(entry.name);
    if (!FILE_EXTENSIONS.has(extension)) {
      continue;
    }

    yield fullPath;
  }
}

function getLineNumber(content, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (content[i] === "\n") {
      line += 1;
    }
  }
  return line;
}

function relativeFromRoot(fullPath) {
  return path.relative(ROOT, fullPath).split(path.sep).join("/");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readTokenBlock(content, selector) {
  const escaped = escapeRegExp(selector);
  const pattern = new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\n\\s*\\}`, "m");
  const match = content.match(pattern);
  return match?.[1] ?? null;
}

async function main() {
  const issues = [];

  for (const targetDir of TARGET_DIRS) {
    const absoluteDir = path.join(ROOT, targetDir);
    try {
      await fs.access(absoluteDir);
    } catch {
      continue;
    }

    for await (const filePath of walkFiles(absoluteDir)) {
      const relativePath = relativeFromRoot(filePath);
      const content = await fs.readFile(filePath, "utf8");

      for (const rule of rules) {
        if (rule.allow(relativePath)) {
          continue;
        }

        const matches = [...content.matchAll(rule.regex)];
        for (const match of matches) {
          const index = match.index ?? 0;
          const line = getLineNumber(content, index);
          issues.push({
            rule: rule.name,
            file: relativePath,
            line,
            sample: match[0],
          });
        }
      }
    }
  }

  const globalsCssPath = path.join(ROOT, "app/globals.css");
  const globalsCss = await fs.readFile(globalsCssPath, "utf8");

  for (const block of requiredCssTokenBlocks) {
    const tokenBlock = readTokenBlock(globalsCss, block.selector);
    if (!tokenBlock) {
      issues.push({
        rule: "Missing theme token block",
        file: "app/globals.css",
        line: 1,
        sample: block.label,
      });
      continue;
    }

    for (const token of requiredCssTokens) {
      if (!tokenBlock.includes(`${token}:`)) {
        issues.push({
          rule: "Missing token in theme block",
          file: "app/globals.css",
          line: 1,
          sample: `${block.label} -> ${token}`,
        });
      }
    }
  }

  for (const routePath of expectedRoutes) {
    const fullRoutePath = path.join(ROOT, routePath);
    try {
      await fs.access(fullRoutePath);
    } catch {
      issues.push({
        rule: "Missing expected route page file",
        file: routePath,
        line: 1,
        sample: routePath,
      });
    }
  }

  const presetsPath = path.join(ROOT, "../../packages/shared-theme/src/theme-presets.ts");
  const presetsContent = await fs.readFile(presetsPath, "utf8");

  const presetIdsBlockMatch = presetsContent.match(
    /THEME_PRESET_IDS\s*=\s*\[([\s\S]*?)\]\s*as const;/m,
  );

  if (!presetIdsBlockMatch) {
    issues.push({
      rule: "Missing theme preset IDs declaration",
      file: "packages/shared-theme/src/theme-presets.ts",
      line: 1,
      sample: "THEME_PRESET_IDS",
    });
  }

  const expectedPresetIds = presetIdsBlockMatch
    ? [...presetIdsBlockMatch[1].matchAll(/"([^"]+)"/g)].map((match) => match[1])
    : [];

  if (expectedPresetIds.length === 0) {
    issues.push({
      rule: "No theme preset IDs declared",
      file: "packages/shared-theme/src/theme-presets.ts",
      line: 1,
      sample: "THEME_PRESET_IDS",
    });
  }

  for (const presetId of expectedPresetIds) {
    if (!presetsContent.includes(`id: "${presetId}"`)) {
      issues.push({
        rule: "Missing expected theme preset",
        file: "packages/shared-theme/src/theme-presets.ts",
        line: 1,
        sample: presetId,
      });
    }
  }

  if (issues.length > 0) {
    console.error("Theme audit failed. Violations found:\n");
    for (const issue of issues) {
      console.error(`- [${issue.rule}] ${issue.file}:${issue.line} -> ${issue.sample}`);
    }
    process.exit(1);
  }

  console.log("Theme audit passed. No violations found.");
  console.log(
    `Validated ${requiredCssTokenBlocks.length} theme blocks, ${expectedPresetIds.length} presets, and ${expectedRoutes.length} routes.`,
  );
}

main().catch((error) => {
  console.error("Theme audit crashed:", error);
  process.exit(1);
});
