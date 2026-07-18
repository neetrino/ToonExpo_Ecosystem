import type { ApiFetchOptions } from "@/shared/api/client";

export type PortalRequestOptions = {
  cookieHeader?: string | undefined;
};

const jsonCredentials = {
  credentials: "include" as const,
  headers: { "Content-Type": "application/json" },
};

/**
 * Forwards Cookie header for SSR portal fetches.
 */
export const withPortalCookie = (
  options: ApiFetchOptions,
  cookieHeader?: string,
): ApiFetchOptions => {
  if (!cookieHeader) {
    return options;
  }
  return {
    ...options,
    headers: {
      ...(options.headers as Record<string, string> | undefined),
      Cookie: cookieHeader,
    },
  };
};

export { jsonCredentials };
