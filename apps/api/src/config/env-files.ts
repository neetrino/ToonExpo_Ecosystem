import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const MONOREPO_ROOT = resolve(MODULE_DIR, '../../../..');
const API_ROOT = resolve(MODULE_DIR, '../../');

/**
 * Candidate `.env` paths (first existing wins via ConfigModule list order).
 * Prefer app-local overrides, then monorepo root.
 */
export const resolveEnvFilePaths = (): string[] => {
  const candidates = [
    resolve(API_ROOT, '.env.local'),
    resolve(API_ROOT, '.env'),
    resolve(MONOREPO_ROOT, '.env.local'),
    resolve(MONOREPO_ROOT, '.env'),
    // Fallbacks when cwd is apps/api or repo root during nest watch / tests.
    resolve(process.cwd(), '.env.local'),
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), '../../.env.local'),
    resolve(process.cwd(), '../../.env'),
  ];

  return [...new Set(candidates.filter((path) => existsSync(path)))];
};
