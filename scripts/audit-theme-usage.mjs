#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TARGET_ROOTS = [
  "apps/web/app",
  "apps/web/components",
  "apps/web/hooks",
  "apps/web/lib",
  "apps/web/store",
  "packages/shared-constants/src",
  "packages/shared-types/src",
];
const TARGET_FILES = ["apps/web/package.json", "package.json"];
const SCAN_EXTENSIONS = new Set([".ts", ".tsx", ".css", ".json"]);
const SKIP_DIRS = new Set(["node_modules", ".next", "dist"]);

const findings = [];

const patterns = [
  {
    label: "preset theme runtime",
    regex: /\b(?:ThemePresetProvider|theme-css|theme-presets|@tbms\/shared-theme|next-themes)\b/g,
  },
  {
    label: "legacy theme class",
    regex:
      /\b(?:text-text-[a-z-]+|border-divider|bg-app-bar|text-app-bar-foreground|bg-theme-radial-top(?:-right)?|shadow-theme-(?:elevated|modal|soft)|scrollbar-theme|bg-primary-soft|bg-secondary-soft|border-secondary-border|(?:bg|text|border|fill|stroke)-(?:surface(?:-[a-z]+)?|panel(?:-[a-z]+)?|nav(?:-[a-z]+)?|status(?:-[a-z]+)?|highlight(?:-[a-z]+)?|code(?:-[a-z]+)?|sidebar-(?:active|muted|surface)(?:-[a-z-]+)?)|(?:fill|stroke)-text-(?:primary|secondary)|shadow-(?:soft|card|button))\b/g,
  },
  {
    label: "hardcoded palette class",
    regex:
      /\b(?:bg|text|border|fill|stroke)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-[0-9]{2,3}(?:\/[0-9]{1,3})?)?\b/g,
  },
  {
    label: "deleted global helper",
    regex: /\b(?:page-container|section-gap|glass-panel|screen-title|page-hero|workspace-bar-surface|sidebar-shell|stagger-[123])\b/g,
  },
  {
    label: "legacy primitive variant",
    regex:
      /\b(?:variant=["'](?:soft|destructiveOutline|premium|segmented|primary)["']|tone=["'](?:elevated|elevatedSoft|elevatedMuted|pending|surface|soft|primarySoft|inverseSoft|infoSoft|warningSoft|error|errorSoft|timelinePrimary|sidebar)["']|tone=\{["'](?:elevated|elevatedSoft|elevatedMuted|pending|surface|soft|primarySoft|inverseSoft|infoSoft|warningSoft|error|errorSoft|timelinePrimary|sidebar)["']\})/g,
  },
  {
    label: "legacy typography wrapper",
    regex: /\bTypography\b/g,
  },
];

function shouldSkipPath(absolutePath) {
  const normalized = absolutePath.replaceAll("\\", "/");
  return (
    normalized.includes("/apps/web/scripts/theme-audit.mjs") ||
    normalized.includes("/scripts/audit-theme-usage.mjs")
  );
}

function recordMatches(relativePath, source) {
  const lines = source.split("\n");

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    for (const pattern of patterns) {
      if (!pattern.regex.test(line)) {
        pattern.regex.lastIndex = 0;
        continue;
      }

      findings.push({
        file: relativePath,
        line: index + 1,
        label: pattern.label,
        sample: line.trim().slice(0, 200),
      });
      pattern.regex.lastIndex = 0;
    }
  }
}

function walk(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) {
      continue;
    }

    const absolutePath = path.join(directory, entry.name);
    if (shouldSkipPath(absolutePath)) {
      continue;
    }

    if (entry.isDirectory()) {
      walk(absolutePath);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (!SCAN_EXTENSIONS.has(path.extname(entry.name))) {
      continue;
    }

    const relativePath = path.relative(ROOT, absolutePath).replaceAll("\\", "/");
    recordMatches(relativePath, fs.readFileSync(absolutePath, "utf8"));
  }
}

for (const targetRoot of TARGET_ROOTS) {
  const absoluteRoot = path.join(ROOT, targetRoot);
  if (fs.existsSync(absoluteRoot)) {
    walk(absoluteRoot);
  }
}

for (const targetFile of TARGET_FILES) {
  const absolutePath = path.join(ROOT, targetFile);
  if (!fs.existsSync(absolutePath) || shouldSkipPath(absolutePath)) {
    continue;
  }

  recordMatches(targetFile, fs.readFileSync(absolutePath, "utf8"));
}

if (findings.length > 0) {
  console.error("Theme usage audit failed.");
  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} [${finding.label}] ${finding.sample}`);
  }
  process.exit(1);
}

console.log("Theme usage audit passed.");
