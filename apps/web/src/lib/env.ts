import { emptyToUndefined } from '@toonexpo/shared';
import { z } from 'zod';

export const webEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  /** Browser API base. Prefer same-origin `/nest` rewrite so session cookies work with SSR. */
  NEXT_PUBLIC_API_URL: z.string().min(1).default('/nest'),
  /** Server-side Nest base (direct Cloud Run / localhost:4000). Falls back to APP_URL + public path. */
  API_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  /** Optional — when unset, Sentry stays disabled (no SDK wire-up required). */
  SENTRY_DSN: z.preprocess(emptyToUndefined, z.string().url().optional()),
  NEXT_PUBLIC_SENTRY_DSN: z.preprocess(emptyToUndefined, z.string().url().optional()),
});

export type WebEnv = z.infer<typeof webEnvSchema>;

export function loadWebEnv(env: NodeJS.ProcessEnv = process.env): WebEnv {
  return webEnvSchema.parse({
    ...env,
    API_URL: emptyToUndefined(env.API_URL),
    NEXT_PUBLIC_API_URL: emptyToUndefined(env.NEXT_PUBLIC_API_URL) ?? '/nest',
  });
}
