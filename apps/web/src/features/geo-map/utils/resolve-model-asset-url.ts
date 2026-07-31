import { GEO_MAP_R2_PROXY_PATH_PREFIX } from '@/features/geo-map/constants';

/**
 * Rewrites absolute Cloudflare R2 model URLs to the same-origin `/r2-proxy/*`
 * rewrite (see `apps/web/next.config.ts`).
 *
 * deck.gl / loaders.gl fetch GLBs via XHR; R2 public-dev hosts often lack CORS
 * headers, so a same-origin proxy is required for ScenegraphLayer loads.
 * Non-R2 URLs (e.g. Khronos lab samples) are returned unchanged.
 */
export const resolveModelAssetUrl = (modelUrl: string): string => {
  const base =
    process.env['NEXT_PUBLIC_R2_PUBLIC_URL']?.trim() || process.env['R2_PUBLIC_URL']?.trim();
  if (!base) {
    return modelUrl;
  }

  const normalizedBase = base.replace(/\/$/, '');
  if (modelUrl !== normalizedBase && !modelUrl.startsWith(`${normalizedBase}/`)) {
    return modelUrl;
  }

  const path = modelUrl.slice(normalizedBase.length);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${GEO_MAP_R2_PROXY_PATH_PREFIX}${normalizedPath}`;
};
