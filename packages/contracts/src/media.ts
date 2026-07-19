import type { PaginatedResponse } from "./catalog.js";

export type MediaAssetItem = {
  id: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  title: string | null;
  width: number | null;
  height: number | null;
  createdAt: string;
};

export type MediaListResponse = PaginatedResponse<MediaAssetItem>;

export type ListMediaQuery = {
  page?: number;
  pageSize?: number;
};
