const HTTP_URL_PATTERN = /^https?:\/\//i;

/**
 * Resolves a venue map media reference for display.
 * v1: only absolute http(s) URLs are renderable; opaque asset ids need media CDN wiring.
 */
export const resolveMediaUrl = (mediaAssetId: string): string | null => {
  const trimmed = mediaAssetId.trim();
  if (!trimmed) {
    return null;
  }
  if (HTTP_URL_PATTERN.test(trimmed)) {
    return trimmed;
  }
  return null;
};
