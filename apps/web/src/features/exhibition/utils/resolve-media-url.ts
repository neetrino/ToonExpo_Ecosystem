const HTTP_URL_PATTERN = /^https?:\/\//i;

/**
 * Resolves a media reference for display.
 * Prefers an explicit CDN URL; falls back to legacy absolute URLs stored in id fields.
 */
export const resolveMediaUrl = (
  mediaAssetId: string,
  mediaFileUrl?: string | null,
): string | null => {
  const resolvedUrl = mediaFileUrl?.trim();
  if (resolvedUrl) {
    return resolvedUrl;
  }

  const trimmed = mediaAssetId.trim();
  if (!trimmed) {
    return null;
  }
  if (HTTP_URL_PATTERN.test(trimmed)) {
    return trimmed;
  }
  return null;
};
