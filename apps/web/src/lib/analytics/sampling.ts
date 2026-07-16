import type { AnalyticsEventType } from '@toonexpo/domain';

/** Default keep-all rate for PROJECT_VIEW / APARTMENT_VIEW sampling. */
export const DEFAULT_ANALYTICS_SAMPLE_RATE = 1;

const SAMPLED_VIEW_TYPES = new Set<AnalyticsEventType>(['PROJECT_VIEW', 'APARTMENT_VIEW']);

/**
 * Fail-safe parse of ANALYTICS_SAMPLE_RATE (0–1). Invalid/empty → keep 100%.
 */
export function parseAnalyticsSampleRate(raw: string | undefined): number {
  if (raw === undefined || raw === '') {
    return DEFAULT_ANALYTICS_SAMPLE_RATE;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    return DEFAULT_ANALYTICS_SAMPLE_RATE;
  }

  return parsed;
}

/**
 * Whether a view event should be persisted under the configured sample rate.
 * Non-view events always record.
 */
export function shouldSampleAnalyticsEvent(type: AnalyticsEventType, rate: number): boolean {
  if (!SAMPLED_VIEW_TYPES.has(type)) {
    return true;
  }
  if (rate >= 1) {
    return true;
  }
  if (rate <= 0) {
    return false;
  }
  return Math.random() < rate;
}

/**
 * Heuristic bot / prerender UA filter. Returns false when UA is missing
 * (skip filter — call sites without headers still record).
 */
export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent) {
    return false;
  }

  return /bot|crawler|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link preview|whatsapp|telegrambot|prerender|headlesschrome|lighthouse|pagespeed|preview/i.test(
    userAgent,
  );
}
