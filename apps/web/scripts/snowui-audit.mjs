#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const TARGET_DIRS = ["app", "components"];
const ALLOWED_EXTENSIONS = new Set([".ts", ".tsx", ".css"]);
const ALLOWED_ROUNDED_PX = new Set([4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 80]);
const ALLOWED_TEXT_VALUES = new Set([
  "0.75rem",
  "0.875rem",
  "1rem",
  "1.125rem",
  "1.5rem",
  "2rem",
  "3rem",
  "4rem",
]);

const RULES = [
  {
    name: "No backdrop blur/filter classes",
    regex: /\bbackdrop-(?:blur|filter)\b/g,
  },
  {
    name: "No translucent SnowUI surface backgrounds",
    regex: /\bbg-(?:card|secondary|muted|popover|sidebar|background)\/\d{2}\b/g,
  },
  {
    name: "No translucent SnowUI surface borders",
    regex: /\bborder-(?:border|sidebar-border)\/\d{2}\b/g,
  },
  {
    name: "No translucent muted/sidebar text tokens",
    regex: /\btext-(?:muted-foreground|sidebar-foreground)\/\d{2}\b/g,
  },
  {
    name: "No translucent hover state on core semantic colors",
    regex: /\bhover:bg-(?:accent|secondary|primary|destructive)\/\d{2}\b/g,
  },
  {
    name: "No translucent HSL SnowUI surfaces in CSS",
    regex:
      /background:\s*hsl\(var\(--(?:background|card|popover|sidebar|secondary|accent|muted)\)\s*\/\s*0\.[0-9]+\)/g,
  },
];

async function listFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath)));
      continue;
    }
    if (ALLOWED_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

function collectLineMatches(filePath, source) {
  const issues = [];
  const relativePath = path.relative(ROOT, filePath);
  const lines = source.split("\n");

  lines.forEach((line, index) => {
    for (const rule of RULES) {
      for (const match of line.matchAll(rule.regex)) {
        issues.push(
          `${relativePath}:${index + 1} - ${rule.name}: "${match[0]}"`,
        );
      }
    }

    for (const match of line.matchAll(/rounded-\[(\d+)px\]/g)) {
      const rounded = Number(match[1]);
      if (!ALLOWED_ROUNDED_PX.has(rounded)) {
        issues.push(
          `${relativePath}:${index + 1} - Rounded value must use SnowUI scale: "${match[0]}"`,
        );
      } else {
        issues.push(
          `${relativePath}:${index + 1} - Use tokenized radius class instead of arbitrary value: "${match[0]}"`,
        );
      }
    }

    for (const match of line.matchAll(/text-\[([0-9.]+rem)\]/g)) {
      const textValue = match[1];
      if (!ALLOWED_TEXT_VALUES.has(textValue)) {
        issues.push(
          `${relativePath}:${index + 1} - Text size must use SnowUI scale: "${match[0]}"`,
        );
      }
    }
  });

  return issues;
}

async function main() {
  const issues = [];
  for (const dir of TARGET_DIRS) {
    const abs = path.join(ROOT, dir);
    const files = await listFiles(abs);
    for (const file of files) {
      const source = await fs.readFile(file, "utf8");
      issues.push(...collectLineMatches(file, source));
    }
  }

  if (issues.length > 0) {
    console.error("SnowUI audit failed.\n");
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    process.exit(1);
  }

  console.log("SnowUI audit passed.");
}

main().catch((error) => {
  console.error("SnowUI audit crashed:", error);
  process.exit(1);
});
