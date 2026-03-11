#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const TARGET_DIRS = ["app", "components", "hooks", "lib"];
const FILE_EXTENSIONS = new Set([".ts", ".tsx"]);

async function listFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath)));
      continue;
    }
    if (FILE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

async function findLegacyUiFiles() {
  const legacyDir = path.join(ROOT, "components/ui");
  try {
    const entries = await fs.readdir(legacyDir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".tsx"))
      .map((entry) => path.join("components/ui", entry.name));
  } catch {
    return [];
  }
}

async function main() {
  const issues = [];
  const legacyUiFiles = await findLegacyUiFiles();

  for (const file of legacyUiFiles) {
    issues.push(
      `Legacy UI file exists: ${file}. Move shared UI to @tbms/ui/components and delete local web UI wrappers.`,
    );
  }

  const allFiles = (
    await Promise.all(TARGET_DIRS.map((dir) => listFiles(path.join(ROOT, dir))))
  ).flat();

  for (const filePath of allFiles) {
    const source = await fs.readFile(filePath, "utf8");

    if (source.includes("@/components/ui/")) {
      issues.push(
        `${path.relative(ROOT, filePath)} imports "@/components/ui/*". Use "@tbms/ui/components/*" directly.`,
      );
    }
  }

  if (issues.length > 0) {
    console.error("Shared shadcn audit failed.\n");
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    process.exit(1);
  }

  console.log("Shared shadcn audit passed.");
}

main().catch((error) => {
  console.error("Shared shadcn audit crashed:", error);
  process.exit(1);
});
