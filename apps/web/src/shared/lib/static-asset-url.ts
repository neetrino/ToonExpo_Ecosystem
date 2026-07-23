/**
 * Resolves static marketing/demo assets to Cloudflare R2 when configured.
 * Falls back to same-origin `/public` paths for local-only setups.
 */
export const staticAssetUrl = (path: string): string => {
  const base =
    process.env['NEXT_PUBLIC_R2_PUBLIC_URL']?.trim() || process.env['R2_PUBLIC_URL']?.trim();
  const normalized = path.startsWith('/') ? path : `/${path}`;

  if (!base) {
    return normalized;
  }

  return `${base.replace(/\/$/, '')}${normalized}`;
};
