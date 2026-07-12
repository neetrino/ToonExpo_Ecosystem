import { emptyToUndefined } from '@toonexpo/shared';

/**
 * Lightweight Sentry gate. No-op when DSN is unset so local/CI builds stay free
 * of `@sentry/nextjs`. When a DSN exists, run the official Next.js Sentry wizard
 * and replace this stub with real `Sentry.init`.
 */
export function initSentry(): void {
  const dsn = emptyToUndefined(process.env.SENTRY_DSN) ?? emptyToUndefined(process.env.NEXT_PUBLIC_SENTRY_DSN);
  if (typeof dsn !== 'string' || dsn.length === 0) {
    return;
  }
  // DSN present but SDK not installed yet — intentional no-op until wizard lands.
}
