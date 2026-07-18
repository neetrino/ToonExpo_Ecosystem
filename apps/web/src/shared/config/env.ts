import { z } from "zod";

import { DEFAULT_API_ORIGIN } from "./constants";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  API_URL: z.string().url().optional(),
});

export type PublicEnv = {
  apiBaseUrl: string;
};

/**
 * Validates and resolves public web environment variables.
 * Prefers `NEXT_PUBLIC_API_URL`, then `API_URL`, then local default.
 */
export const getPublicEnv = (): PublicEnv => {
  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env["NEXT_PUBLIC_API_URL"],
    API_URL: process.env["API_URL"],
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid public environment: ${details}`);
  }

  const apiBaseUrl =
    parsed.data.NEXT_PUBLIC_API_URL ??
    parsed.data.API_URL ??
    DEFAULT_API_ORIGIN;

  return { apiBaseUrl };
};
