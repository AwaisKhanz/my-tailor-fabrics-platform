#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const checks = ["theme:audit", "snowui:audit"];

for (const check of checks) {
  const result = spawnSync("pnpm", ["run", check], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("Shadcn foundation audit passed.");
