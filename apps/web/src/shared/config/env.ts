import { z } from "zod";

import { API_PROXY_TARGET_ENV } from "./api-proxy.constants";
import { DEFAULT_API_ORIGIN } from "./constants";

export { API_PROXY_TARGET_ENV } from "./api-proxy.constants";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
});

const serverEnvSchema = z.object({
  API_PROXY_TARGET: z.string().url().optional(),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  API_URL: z.string().url().optional(),
});

export type PublicEnv = {
  /** Empty string means same-origin relative URLs (proxy mode). */
  apiBaseUrl: string;
};

const trimOptionalEnv = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
};

const readApiProxyTarget = (): string | undefined =>
  trimOptionalEnv(process.env[API_PROXY_TARGET_ENV]);

/** True when same-origin proxy rewrites are enabled (server-only env). */
export const isApiProxyEnabled = (): boolean =>
  readApiProxyTarget() !== undefined;

const formatEnvValidationError = (error: z.ZodError): string =>
  error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");

/**
 * Validates and resolves public web environment variables for browser fetch.
 * When `NEXT_PUBLIC_API_URL` is unset and `API_PROXY_TARGET` is set, returns
 * an empty base URL so requests stay same-origin through the Next.js rewrite.
 */
export const getPublicEnv = (): PublicEnv => {
  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_API_URL: trimOptionalEnv(process.env["NEXT_PUBLIC_API_URL"]),
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid public environment: ${formatEnvValidationError(parsed.error)}`,
    );
  }

  if (parsed.data.NEXT_PUBLIC_API_URL) {
    return { apiBaseUrl: parsed.data.NEXT_PUBLIC_API_URL };
  }

  if (isApiProxyEnabled()) {
    return { apiBaseUrl: "" };
  }

  const apiUrl = trimOptionalEnv(process.env["API_URL"]);
  if (apiUrl) {
    return { apiBaseUrl: apiUrl };
  }

  return { apiBaseUrl: DEFAULT_API_ORIGIN };
};

/**
 * Absolute API origin for server-side fetch (RSC, route handlers).
 * Node fetch cannot use relative URLs; when the browser uses the proxy,
 * the server calls `API_PROXY_TARGET` directly.
 */
export const getServerApiBaseUrl = (): string => {
  const parsed = serverEnvSchema.safeParse({
    API_PROXY_TARGET: readApiProxyTarget(),
    NEXT_PUBLIC_API_URL: trimOptionalEnv(process.env["NEXT_PUBLIC_API_URL"]),
    API_URL: trimOptionalEnv(process.env["API_URL"]),
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid server environment: ${formatEnvValidationError(parsed.error)}`,
    );
  }

  return (
    parsed.data.NEXT_PUBLIC_API_URL ??
    parsed.data.API_URL ??
    parsed.data.API_PROXY_TARGET ??
    DEFAULT_API_ORIGIN
  );
};
