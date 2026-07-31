/**
 * Resolves static marketing/demo assets from Cloudflare R2.
 * Requires `NEXT_PUBLIC_R2_PUBLIC_URL` (or `R2_PUBLIC_URL`) — assets are not
 * shipped in `apps/web/public` (upload via `pnpm media:upload-static`).
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
