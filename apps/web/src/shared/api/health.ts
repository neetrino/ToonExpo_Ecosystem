import type { HealthResponse } from "@toonexpo/contracts";

import { HEALTH_FETCH_TIMEOUT_MS } from "@/shared/config/constants";

import { apiFetch } from "./client";

/**
 * Fetches NestJS health status. Returns `null` when the API is unreachable.
 */
export const getHealth = async (): Promise<HealthResponse | null> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, HEALTH_FETCH_TIMEOUT_MS);

  try {
    return await apiFetch<HealthResponse>({
      path: "/health",
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};
