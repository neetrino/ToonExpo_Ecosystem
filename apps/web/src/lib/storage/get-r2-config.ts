import { loadWebEnv } from '@/lib/env';

import { resolveR2Config, type R2Config } from './r2-config';

/** Reads optional R2_* from web env; null when incomplete. */
export function getR2Config(): R2Config | null {
  return resolveR2Config(loadWebEnv());
}

export function isR2Configured(): boolean {
  return getR2Config() !== null;
}
