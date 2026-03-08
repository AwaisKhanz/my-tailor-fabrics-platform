import { access } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const candidates = [
  path.resolve("apps/web/.next/standalone/apps/web/server.js"),
  path.resolve("apps/web/.next/standalone/server.js"),
];

let serverPath;

for (const candidate of candidates) {
  try {
    await access(candidate);
    serverPath = candidate;
    break;
  } catch {
    // Try the next candidate.
  }
}

if (!serverPath) {
  console.error(
    "Unable to locate the Next.js standalone server. Run `npm run build:do:web` first.",
  );
  process.exit(1);
}

await import(pathToFileURL(serverPath).href);
