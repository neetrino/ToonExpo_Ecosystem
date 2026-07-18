import { z } from "zod";

import { CSRF_COOKIE_NAME } from "@toonexpo/contracts";

import {
  DEFAULT_API_PORT,
  DEFAULT_DB_POOL_CONNECTION_TIMEOUT_MS,
  DEFAULT_DB_POOL_MAX,
  DEFAULT_DB_STATEMENT_TIMEOUT_MS,
  DEFAULT_SESSION_ABSOLUTE_TTL_SECONDS,
  DEFAULT_SESSION_COOKIE_NAME,
  DEFAULT_SESSION_IDLE_TTL_SECONDS,
  NODE_ENV_DEVELOPMENT,
  NODE_ENV_PRODUCTION,
  NODE_ENV_TEST,
} from "../common/constants/app.constants.js";

const emptyToUndefined = (value: unknown): unknown => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

const envSchema = z
  .object({
    NODE_ENV: z
      .enum([NODE_ENV_DEVELOPMENT, NODE_ENV_PRODUCTION, NODE_ENV_TEST])
      .default(NODE_ENV_DEVELOPMENT),
    PORT: z.coerce.number().int().positive().default(DEFAULT_API_PORT),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    APP_URL: z.preprocess(
      emptyToUndefined,
      z.string().url().default("http://localhost:3000"),
    ),
    CORS_ORIGINS: z
      .string()
      .min(1, "CORS_ORIGINS is required")
      .transform((value) =>
        value
          .split(",")
          .map((origin) => origin.trim())
          .filter((origin) => origin.length > 0),
      )
      .refine((origins) => origins.length > 0, {
        message: "CORS_ORIGINS must contain at least one origin",
      }),
    SESSION_TOKEN_PEPPER: z
      .string()
      .min(32, "SESSION_TOKEN_PEPPER must be at least 32 characters"),
    SESSION_COOKIE_NAME: z
      .preprocess(emptyToUndefined, z.string().min(1).optional())
      .transform((value) => value ?? DEFAULT_SESSION_COOKIE_NAME),
    SESSION_IDLE_TTL_SECONDS: z.preprocess(
      emptyToUndefined,
      z.coerce
        .number()
        .int()
        .positive()
        .default(DEFAULT_SESSION_IDLE_TTL_SECONDS),
    ),
    SESSION_ABSOLUTE_TTL_SECONDS: z.preprocess(
      emptyToUndefined,
      z.coerce
        .number()
        .int()
        .positive()
        .default(DEFAULT_SESSION_ABSOLUTE_TTL_SECONDS),
    ),
    CSRF_SECRET: z
      .string()
      .min(32, "CSRF_SECRET must be at least 32 characters"),
    CSRF_COOKIE_NAME: z
      .preprocess(emptyToUndefined, z.string().min(1).optional())
      .transform((value) => value ?? CSRF_COOKIE_NAME),
    RESEND_API_KEY: z.preprocess(
      emptyToUndefined,
      z.string().min(1).optional(),
    ),
    RESEND_FROM_EMAIL: z.preprocess(
      emptyToUndefined,
      z.string().email().optional(),
    ),
    BOS_API_KEY: z.preprocess(
      emptyToUndefined,
      z.string().min(32).optional(),
    ),
    R2_ACCOUNT_ID: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
    R2_ACCESS_KEY_ID: z.preprocess(
      emptyToUndefined,
      z.string().min(1).optional(),
    ),
    R2_SECRET_ACCESS_KEY: z.preprocess(
      emptyToUndefined,
      z.string().min(1).optional(),
    ),
    R2_BUCKET_NAME: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
    R2_PUBLIC_URL: z.preprocess(
      emptyToUndefined,
      z.string().url().optional(),
    ),
    SENTRY_DSN: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
    UPSTASH_REDIS_REST_URL: z.preprocess(
      emptyToUndefined,
      z.string().url().optional(),
    ),
    UPSTASH_REDIS_REST_TOKEN: z.preprocess(
      emptyToUndefined,
      z.string().min(1).optional(),
    ),
    DB_POOL_MAX: z.preprocess(
      emptyToUndefined,
      z.coerce.number().int().positive().default(DEFAULT_DB_POOL_MAX),
    ),
    DB_POOL_CONNECTION_TIMEOUT_MS: z.preprocess(
      emptyToUndefined,
      z.coerce
        .number()
        .int()
        .positive()
        .default(DEFAULT_DB_POOL_CONNECTION_TIMEOUT_MS),
    ),
    DB_STATEMENT_TIMEOUT_MS: z.preprocess(
      emptyToUndefined,
      z.coerce
        .number()
        .int()
        .positive()
        .default(DEFAULT_DB_STATEMENT_TIMEOUT_MS),
    ),
  })
  .superRefine((env, ctx) => {
    const hasUpstashUrl = Boolean(env.UPSTASH_REDIS_REST_URL);
    const hasUpstashToken = Boolean(env.UPSTASH_REDIS_REST_TOKEN);

    if (hasUpstashUrl !== hasUpstashToken) {
      ctx.addIssue({
        code: "custom",
        path: hasUpstashUrl
          ? ["UPSTASH_REDIS_REST_TOKEN"]
          : ["UPSTASH_REDIS_REST_URL"],
        message:
          "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must both be set or both omitted",
      });
    }

    if (env.NODE_ENV !== NODE_ENV_PRODUCTION) {
      return;
    }

    if (!env.RESEND_API_KEY) {
      ctx.addIssue({
        code: "custom",
        path: ["RESEND_API_KEY"],
        message: "RESEND_API_KEY is required in production",
      });
    }

    if (!env.RESEND_FROM_EMAIL) {
      ctx.addIssue({
        code: "custom",
        path: ["RESEND_FROM_EMAIL"],
        message: "RESEND_FROM_EMAIL is required in production",
      });
    }
  });

export type AppEnv = {
  NODE_ENV: "development" | "production" | "test";
  PORT: number;
  DATABASE_URL: string;
  APP_URL: string;
  CORS_ORIGINS: string[];
  SESSION_TOKEN_PEPPER: string;
  SESSION_COOKIE_NAME: string;
  SESSION_IDLE_TTL_SECONDS: number;
  SESSION_ABSOLUTE_TTL_SECONDS: number;
  CSRF_SECRET: string;
  CSRF_COOKIE_NAME: string;
  RESEND_API_KEY?: string | undefined;
  RESEND_FROM_EMAIL?: string | undefined;
  BOS_API_KEY?: string | undefined;
  R2_ACCOUNT_ID?: string | undefined;
  R2_ACCESS_KEY_ID?: string | undefined;
  R2_SECRET_ACCESS_KEY?: string | undefined;
  R2_BUCKET_NAME?: string | undefined;
  R2_PUBLIC_URL?: string | undefined;
  SENTRY_DSN?: string | undefined;
  UPSTASH_REDIS_REST_URL?: string | undefined;
  UPSTASH_REDIS_REST_TOKEN?: string | undefined;
  DB_POOL_MAX: number;
  DB_POOL_CONNECTION_TIMEOUT_MS: number;
  DB_STATEMENT_TIMEOUT_MS: number;
};

/**
 * Validates and parses process environment for API startup.
 */
export const validateEnv = (config: Record<string, unknown>): AppEnv => {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${details}`);
  }

  const data = parsed.data;
  const result: AppEnv = {
    NODE_ENV: data.NODE_ENV,
    PORT: data.PORT,
    DATABASE_URL: data.DATABASE_URL,
    APP_URL: data.APP_URL,
    CORS_ORIGINS: data.CORS_ORIGINS,
    SESSION_TOKEN_PEPPER: data.SESSION_TOKEN_PEPPER,
    SESSION_COOKIE_NAME: data.SESSION_COOKIE_NAME,
    SESSION_IDLE_TTL_SECONDS: data.SESSION_IDLE_TTL_SECONDS,
    SESSION_ABSOLUTE_TTL_SECONDS: data.SESSION_ABSOLUTE_TTL_SECONDS,
    CSRF_SECRET: data.CSRF_SECRET,
    CSRF_COOKIE_NAME: data.CSRF_COOKIE_NAME,
    DB_POOL_MAX: data.DB_POOL_MAX,
    DB_POOL_CONNECTION_TIMEOUT_MS: data.DB_POOL_CONNECTION_TIMEOUT_MS,
    DB_STATEMENT_TIMEOUT_MS: data.DB_STATEMENT_TIMEOUT_MS,
  };

  if (data.RESEND_API_KEY) {
    result.RESEND_API_KEY = data.RESEND_API_KEY;
  }

  if (data.RESEND_FROM_EMAIL) {
    result.RESEND_FROM_EMAIL = data.RESEND_FROM_EMAIL;
  }

  if (data.BOS_API_KEY) {
    result.BOS_API_KEY = data.BOS_API_KEY;
  }

  if (data.R2_ACCOUNT_ID) {
    result.R2_ACCOUNT_ID = data.R2_ACCOUNT_ID;
  }

  if (data.R2_ACCESS_KEY_ID) {
    result.R2_ACCESS_KEY_ID = data.R2_ACCESS_KEY_ID;
  }

  if (data.R2_SECRET_ACCESS_KEY) {
    result.R2_SECRET_ACCESS_KEY = data.R2_SECRET_ACCESS_KEY;
  }

  if (data.R2_BUCKET_NAME) {
    result.R2_BUCKET_NAME = data.R2_BUCKET_NAME;
  }

  if (data.R2_PUBLIC_URL) {
    result.R2_PUBLIC_URL = data.R2_PUBLIC_URL;
  }

  if (data.SENTRY_DSN) {
    result.SENTRY_DSN = data.SENTRY_DSN;
  }

  if (data.UPSTASH_REDIS_REST_URL) {
    result.UPSTASH_REDIS_REST_URL = data.UPSTASH_REDIS_REST_URL;
  }

  if (data.UPSTASH_REDIS_REST_TOKEN) {
    result.UPSTASH_REDIS_REST_TOKEN = data.UPSTASH_REDIS_REST_TOKEN;
  }

  return result;
};
