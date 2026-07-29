/**
 * Resolves static marketing/demo assets to Cloudflare R2 when configured.
 * Falls back to same-origin `/public` paths for local-only setups.
 *
 * Only reads `NEXT_PUBLIC_R2_PUBLIC_URL` — never server-only `R2_PUBLIC_URL`.
 * This helper runs in Client Components; a server-only env would SSR the CDN
 * URL and hydrate with a local path (React hydration mismatch).
 */
export const staticAssetUrl = (path: string): string => {
  const base = process.env['NEXT_PUBLIC_R2_PUBLIC_URL']?.trim();
  const normalized = path.startsWith('/') ? path : `/${path}`;

  if (!base) {
    return normalized;
  }

  return `${base.replace(/\/$/, '')}${normalized}`;
};
