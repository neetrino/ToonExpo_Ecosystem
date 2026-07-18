import { z } from "zod";

import {
  DEFAULT_API_PORT,
  NODE_ENV_DEVELOPMENT,
  NODE_ENV_PRODUCTION,
  NODE_ENV_TEST,
} from "../common/constants/app.constants.js";

const envSchema = z.object({
  NODE_ENV: z
    .enum([NODE_ENV_DEVELOPMENT, NODE_ENV_PRODUCTION, NODE_ENV_TEST])
    .default(NODE_ENV_DEVELOPMENT),
  PORT: z.coerce.number().int().positive().default(DEFAULT_API_PORT),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
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
});

export type AppEnv = {
  NODE_ENV: "development" | "production" | "test";
  PORT: number;
  DATABASE_URL: string;
  CORS_ORIGINS: string[];
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

  return parsed.data;
};
