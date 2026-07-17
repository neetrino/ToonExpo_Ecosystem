import { emptyToUndefined } from '@toonexpo/shared';
import { z } from 'zod';

export const webEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  /** Absolute Nest API origin for browser and server fetches (no Next proxy). */
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:4000'),
  /** Optional — when unset, Sentry stays disabled (no SDK wire-up required). */
  SENTRY_DSN: z.preprocess(emptyToUndefined, z.string().url().optional()),
  NEXT_PUBLIC_SENTRY_DSN: z.preprocess(emptyToUndefined, z.string().url().optional()),
});

export type WebEnv = z.infer<typeof webEnvSchema>;

export function loadWebEnv(env: NodeJS.ProcessEnv = process.env): WebEnv {
  return webEnvSchema.parse({
    ...env,
    NEXT_PUBLIC_API_URL: emptyToUndefined(env.NEXT_PUBLIC_API_URL) ?? 'http://localhost:4000',
  });
}
