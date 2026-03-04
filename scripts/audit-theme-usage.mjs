#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TARGET_ROOTS = ["apps/web/app", "apps/web/components"];
const SCAN_EXTENSIONS = new Set([".ts", ".tsx", ".css"]);
const SKIP_DIRS = new Set(["node_modules", ".next", "dist"]);

const findings = [];

const patterns = [
  {
    label: "hex color literal",
    regex: /#[0-9a-fA-F]{3,8}\b/g,
  },
  {
    label: "rgb/hsl color function",
    regex: /\b(?:rgb|rgba|hsl|hsla)\(/g,
  },
  {
    label: "arbitrary color utility",
    regex: /\b(?:bg|text|border|ring|fill|stroke)-\[(?:#|rgb|rgba|hsl|hsla|var\(|[a-zA-Z])[^\]]*\]/g,
  },
];

function shouldSkipPath(absolutePath) {
  const normalized = absolutePath.replaceAll("\\", "/");
  return (
    normalized.includes("/apps/web/app/globals.css") ||
    normalized.includes("/apps/web/lib/theme-css.ts") ||
    normalized.includes("/apps/web/scripts/theme-audit.mjs")
  );
}

function walk(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) {
      continue;
    }

    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(absolutePath);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const extension = path.extname(entry.name);
    if (!SCAN_EXTENSIONS.has(extension)) {
      continue;
    }

    if (shouldSkipPath(absolutePath)) {
      continue;
    }

    const relativePath = path.relative(ROOT, absolutePath).replaceAll("\\", "/");
    const source = fs.readFileSync(absolutePath, "utf8");
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
          sample: line.trim().slice(0, 160),
        });
        pattern.regex.lastIndex = 0;
      }
    }
  }
}

for (const targetRoot of TARGET_ROOTS) {
  const absoluteRoot = path.join(ROOT, targetRoot);
  if (fs.existsSync(absoluteRoot)) {
    walk(absoluteRoot);
  }
}

if (findings.length > 0) {
  console.error("Theme usage audit failed. Found non-tokenized color usage:");
  for (const finding of findings) {
    console.error(
      `- ${finding.file}:${finding.line} [${finding.label}] ${finding.sample}`,
    );
  }
  process.exit(1);
}

console.log("Theme usage audit passed.");
