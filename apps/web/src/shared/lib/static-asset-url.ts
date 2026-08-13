const HTTP_URL_PATTERN = /^https?:\/\//i;

/**
 * Resolves static marketing/demo assets from Cloudflare R2.
 * Requires `NEXT_PUBLIC_R2_PUBLIC_URL` (or server-side `R2_PUBLIC_URL`) —
 * assets are not shipped in `apps/web/public` (upload via `pnpm media:upload-static`).
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

/**
 * Turns a catalog/media URL into a loadable src. Absolute URLs pass through;
 * root-relative demo paths are resolved against R2.
 */
export const resolvePublicAssetUrl = (url: string | null | undefined): string | null => {
  const trimmed = url?.trim();
  if (!trimmed) {
    return null;
  }
  if (HTTP_URL_PATTERN.test(trimmed)) {
    return trimmed;
  }
  return staticAssetUrl(trimmed);
};
