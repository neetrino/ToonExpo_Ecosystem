'use client';

import { useEffect, useState } from 'react';

import {
  resolveMediaAsset,
  type MediaUploadContext,
} from '@/features/media/api/media-api';
import { resolvePublicAssetUrl } from '@/shared/lib/static-asset-url';

const previewFromProp = (previewUrl: string | null | undefined): string | null =>
  previewUrl?.trim() || null;

const contextKey = (context: MediaUploadContext): string =>
  typeof context === 'string' ? context : context.companyId;

/**
 * Resolves the thumbnail for a media field: explicit preview, else fetch by asset id.
 */
export const useMediaFieldPreview = (
  context: MediaUploadContext,
  value: string,
  previewUrl: string | null | undefined,
): [string | null, (url: string | null) => void] => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(previewFromProp(previewUrl));
  const scopeKey = contextKey(context);

  useEffect(() => {
    const fromProp = previewFromProp(previewUrl);
    if (fromProp) {
      setThumbnailUrl(fromProp);
      return;
    }

    const mediaId = value.trim();
    if (!mediaId) {
      setThumbnailUrl(null);
      return;
    }

    let cancelled = false;
    void resolveMediaAsset(context, mediaId)
      .then((asset) => {
        if (!cancelled) {
          setThumbnailUrl(
            resolvePublicAssetUrl(asset.thumbnailUrl ?? asset.fileUrl),
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          setThumbnailUrl(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [previewUrl, scopeKey, value]);

  return [thumbnailUrl, setThumbnailUrl];
};
