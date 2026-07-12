import { emptyToUndefined } from '@toonexpo/shared';
import { z } from 'zod';

export const apiEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_URL: z.string().url().default('http://localhost:4000'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  AUTH_SECRET: z.string().min(32),
  /** Shared secret for BOS inbound integration. Empty/unset disables the endpoint (503). */
  BOS_API_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  RESEND_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  RESEND_FROM_EMAIL: z.preprocess(emptyToUndefined, z.string().email().optional()),
  R2_ACCOUNT_ID: z.preprocess(emptyToUndefined, z.string().optional()),
  R2_ACCESS_KEY_ID: z.preprocess(emptyToUndefined, z.string().optional()),
  R2_SECRET_ACCESS_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  R2_BUCKET_NAME: z.preprocess(emptyToUndefined, z.string().optional()),
  R2_PUBLIC_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  UPSTASH_REDIS_REST_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  UPSTASH_REDIS_REST_TOKEN: z.preprocess(emptyToUndefined, z.string().optional()),
  /**
   * Optional override to mount Swagger `/docs` even when NODE_ENV=production.
   * Empty/unset → false. Accepts the string "true".
   */
  SWAGGER_ENABLED: z.preprocess((value) => {
    const cleaned = emptyToUndefined(value);
    if (cleaned === undefined) {
      return undefined;
    }
    if (cleaned === 'true' || cleaned === true) {
      return true;
    }
    if (cleaned === 'false' || cleaned === false) {
      return false;
    }
    return cleaned;
  }, z.boolean().optional()),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

export function loadApiEnv(env: NodeJS.ProcessEnv = process.env): ApiEnv {
  return apiEnvSchema.parse(env);
}
