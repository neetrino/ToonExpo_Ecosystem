export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'edge') {
    return;
  }

  const { initSentry } = await import('./lib/sentry');
  initSentry();
}
