import type { MediaAssetItem } from "@toonexpo/contracts";

type MediaAssetRow = {
  id: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  title: string | null;
  altText: string | null;
  width: number | null;
  height: number | null;
  createdAt: Date;
};

export const toMediaAssetItem = (asset: MediaAssetRow): MediaAssetItem => ({
  id: asset.id,
  fileUrl: asset.fileUrl,
  thumbnailUrl: asset.thumbnailUrl,
  title: asset.title,
  width: asset.width,
  height: asset.height,
  createdAt: asset.createdAt.toISOString(),
});

export const toPortalMediaSummary = (
  asset: Pick<
    MediaAssetRow,
    "id" | "fileUrl" | "thumbnailUrl" | "altText" | "title" | "width" | "height"
  >,
) => ({
  id: asset.id,
  fileUrl: asset.fileUrl,
  thumbnailUrl: asset.thumbnailUrl,
  altText: asset.altText,
  title: asset.title,
  width: asset.width,
  height: asset.height,
});
