import { describe, expect, it, vi } from 'vitest';

describe('initSentry', () => {
  it('is a no-op when DSN env vars are unset', async () => {
    vi.resetModules();
    delete process.env.SENTRY_DSN;
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;

    const { initSentry } = await import('./sentry');
    expect(() => initSentry()).not.toThrow();
  });

  it('is still a no-op stub when a DSN is set (SDK wizard follow-up)', async () => {
    vi.resetModules();
    process.env.SENTRY_DSN = 'https://examplePublicKey@o0.ingest.sentry.io/0';

    const { initSentry } = await import('./sentry');
    expect(() => initSentry()).not.toThrow();

    delete process.env.SENTRY_DSN;
  });
});
