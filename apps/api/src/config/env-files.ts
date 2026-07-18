import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));

/**
 * Candidate `.env` paths for local monorepo and container runtimes.
 */
export const resolveEnvFilePaths = (): string[] => {
  const candidates = [
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), "../../.env"),
    resolve(MODULE_DIR, "../../../../.env"),
  ];

  return [...new Set(candidates.filter((path) => existsSync(path)))];
};
