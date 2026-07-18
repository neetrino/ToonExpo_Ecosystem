import { API_V1_PREFIX } from "@toonexpo/contracts";

import { getPublicEnv } from "@/shared/config/env";

import { ApiError } from "./errors";

export type ApiFetchOptions = RequestInit & {
  /** Absolute or relative path under the API v1 prefix (e.g. `/health`). */
  path: string;
};

/**
 * Builds a full API v1 URL from a path segment.
 */
export const buildApiUrl = (path: string, baseUrl?: string): string => {
  const origin = (baseUrl ?? getPublicEnv().apiBaseUrl).replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${API_V1_PREFIX}${normalizedPath}`;
};

const isEmptyBody = (response: Response): boolean => {
  if (response.status === 204 || response.status === 205) {
    return true;
  }

  const length = response.headers.get("content-length");
  return length === "0";
};

/**
 * Typed fetch wrapper for NestJS `/api/v1` endpoints.
 * Throws {@link ApiError} on non-OK responses; callers handle domain failures.
 */
export const apiFetch = async <T>(options: ApiFetchOptions): Promise<T> => {
  const { path, ...init } = options;
  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: {
      Accept: "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText);
  }

  if (isEmptyBody(response)) {
    return undefined as T;
  }

  return (await response.json()) as T;
};
