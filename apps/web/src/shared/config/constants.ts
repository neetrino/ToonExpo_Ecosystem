import type { SupportedLocale } from "@toonexpo/shared";

/** Public web default locale (Armenian). */
export const WEB_DEFAULT_LOCALE: SupportedLocale = "hy";

/** Fallback API origin for local development when env is unset. */
export const DEFAULT_API_ORIGIN = "http://localhost:4000";

/** Health request timeout in milliseconds. */
export const HEALTH_FETCH_TIMEOUT_MS = 3_000;
