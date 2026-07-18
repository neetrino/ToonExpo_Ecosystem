import * as Sentry from "@sentry/nextjs";

/** Fraction of web transactions sent to Sentry performance monitoring. */
export const SENTRY_TRACES_SAMPLE_RATE = 0.1;

type SentryInitOptions = NonNullable<Parameters<typeof Sentry.init>[0]>;

const emptyToUndefined = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
};

/**
 * Shared Sentry init options for client, server, and edge runtimes.
 * Returns undefined when `NEXT_PUBLIC_SENTRY_DSN` is unset so Sentry stays disabled.
 */
export const createSentryOptions = (): SentryInitOptions | undefined => {
  const dsn = emptyToUndefined(process.env["NEXT_PUBLIC_SENTRY_DSN"]);

  if (!dsn) {
    return undefined;
  }

  return {
    dsn,
    environment: process.env["NODE_ENV"] ?? "development",
    tracesSampleRate: SENTRY_TRACES_SAMPLE_RATE,
  };
};
