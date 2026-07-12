import { emptyToUndefined } from '@toonexpo/shared';
import { z } from 'zod';

export const webEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:4000'),
  AUTH_SECRET: z.string().min(32),
  AUTH_URL: z.string().url().optional(),
  DATABASE_URL: z.string().url().optional(),
  /** Optional — when unset, rate limiting fails open (local/CI). */
  UPSTASH_REDIS_REST_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  UPSTASH_REDIS_REST_TOKEN: z.preprocess(emptyToUndefined, z.string().optional()),
  /** Optional — when unset, invite emails are skipped (account still created). */
  RESEND_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  RESEND_FROM_EMAIL: z.preprocess(emptyToUndefined, z.string().email().optional()),
});

export type WebEnv = z.infer<typeof webEnvSchema>;

export function loadWebEnv(env: NodeJS.ProcessEnv = process.env): WebEnv {
  return webEnvSchema.parse({
    ...env,
    AUTH_SECRET: emptyToUndefined(env.AUTH_SECRET),
    AUTH_URL: emptyToUndefined(env.AUTH_URL),
    DATABASE_URL: emptyToUndefined(env.DATABASE_URL),
  });
}
