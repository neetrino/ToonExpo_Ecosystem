/**
 * Canonical public site origin for metadata (favicon / Open Graph absolute URLs).
 * Prefer explicit env, then Vercel production/preview host, then localhost.
 */
export const resolveSiteUrl = (): string => {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProduction) {
    return `https://${vercelProduction.replace(/\/$/, '')}`;
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/$/, '')}`;
  }

  return 'http://localhost:3000';
};
