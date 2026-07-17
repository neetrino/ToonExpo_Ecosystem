import { emptyToUndefined } from '@toonexpo/shared';
import { z } from 'zod';

export const webEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  /** Browser API base. Prefer same-origin `/nest` rewrite so session cookies work with SSR. */
  NEXT_PUBLIC_API_URL: z.string().min(1).default('/nest'),
  /** Server-side Nest base (direct Cloud Run / localhost:4000). Falls back to APP_URL + public path. */
  API_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  /** Deprecated for web — Nest owns sessions. Kept optional during migration. */
  AUTH_SECRET: z.preprocess(emptyToUndefined, z.string().min(32).optional()),
  AUTH_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  DATABASE_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  /** Optional — when unset, rate limiting fails open (local/CI). */
  UPSTASH_REDIS_REST_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  UPSTASH_REDIS_REST_TOKEN: z.preprocess(emptyToUndefined, z.string().optional()),
  /** Optional — when unset, invite emails are skipped (account still created). */
  RESEND_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  RESEND_FROM_EMAIL: z.preprocess(emptyToUndefined, z.string().email().optional()),
  /** Optional — when unset, media presign returns storageNotConfigured (URL paste still works). */
  R2_ACCOUNT_ID: z.preprocess(emptyToUndefined, z.string().optional()),
  R2_ACCESS_KEY_ID: z.preprocess(emptyToUndefined, z.string().optional()),
  R2_SECRET_ACCESS_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  R2_BUCKET_NAME: z.preprocess(emptyToUndefined, z.string().optional()),
  R2_PUBLIC_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  /** Optional — when unset, Sentry stays disabled (no SDK wire-up required). */
  SENTRY_DSN: z.preprocess(emptyToUndefined, z.string().url().optional()),
  NEXT_PUBLIC_SENTRY_DSN: z.preprocess(emptyToUndefined, z.string().url().optional()),
});

export type WebEnv = z.infer<typeof webEnvSchema>;

export function loadWebEnv(env: NodeJS.ProcessEnv = process.env): WebEnv {
  return webEnvSchema.parse({
    ...env,
    AUTH_SECRET: emptyToUndefined(env.AUTH_SECRET),
    AUTH_URL: emptyToUndefined(env.AUTH_URL),
    DATABASE_URL: emptyToUndefined(env.DATABASE_URL),
    API_URL: emptyToUndefined(env.API_URL),
    NEXT_PUBLIC_API_URL: emptyToUndefined(env.NEXT_PUBLIC_API_URL) ?? '/nest',
  });
}
