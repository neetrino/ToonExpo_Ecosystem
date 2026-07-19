import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const TEST_DIR = fileURLToPath(new URL('.', import.meta.url));
const ROOT_ENV_PATH = resolve(TEST_DIR, '../../../.env');

/** Load monorepo root `.env` when present (local dev); CI uses workflow env instead. */
export const loadRootEnv = (): void => {
  if (!existsSync(ROOT_ENV_PATH)) {
    return;
  }

  process.loadEnvFile?.(ROOT_ENV_PATH);
};
