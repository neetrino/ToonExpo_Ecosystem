/**
 * Vitest sets `VITEST=true` before modules load. Read it directly (not via
 * ConfigService) so throttling and other infra can bypass distributed storage
 * in tests — shared Upstash counters would leak state across parallel files.
 */
export const isVitestRuntime = (): boolean => process.env["VITEST"] === "true";
