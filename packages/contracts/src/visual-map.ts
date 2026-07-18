/**
 * Visual map / hotspot contracts (builder portal editor + public navigation).
 */

import type { MediaAssetSummary, PublicationStatus } from "./catalog.js";

export type VisualMapContextType = "project" | "building" | "floor";

export type VisualHotspotTargetType = "building" | "floor" | "apartment";

export type VisualHotspotTargetStatus = "ok" | "unpublished" | "missing";

export type PortalVisualCanvasListItem = {
  id: string;
  projectId: string;
  contextType: VisualMapContextType;
  contextId: string;
  mediaAssetId: string;
  title: string | null;
  description: string | null;
  publicationStatus: PublicationStatus;
  isPrimary: boolean;
  sortOrder: number;
  hotspotCount: number;
  createdAt: string;
  updatedAt: string;
};

export type PortalVisualCanvasListResponse = {
  data: PortalVisualCanvasListItem[];
};

export type CreatePortalVisualCanvasRequest = {
  contextType: VisualMapContextType;
  contextId: string;
  mediaAssetId: string;
  title?: string;
  description?: string;
  isPrimary?: boolean;
  sortOrder?: number;
};

export type UpdatePortalVisualCanvasRequest = {
  title?: string;
  description?: string;
  mediaAssetId?: string;
  isPrimary?: boolean;
  sortOrder?: number;
  publicationStatus?: PublicationStatus;
};

export type PortalVisualHotspotItem = {
  id: string;
  canvasId: string;
  targetType: VisualHotspotTargetType;
  targetId: string;
  label: string;
  xPercent: string;
  yPercent: string;
  markerStyle: string | null;
  publicationStatus: PublicationStatus;
  sortOrder: number | null;
  targetStatus: VisualHotspotTargetStatus;
  createdAt: string;
  updatedAt: string;
};

export type PortalVisualCanvasDetail = {
  id: string;
  ownerCompanyId: string;
  projectId: string;
  contextType: VisualMapContextType;
  contextId: string;
  mediaAssetId: string;
  title: string | null;
  description: string | null;
  publicationStatus: PublicationStatus;
  isPrimary: boolean;
  sortOrder: number;
  hotspots: PortalVisualHotspotItem[];
  createdAt: string;
  updatedAt: string;
};

export type CreatePortalVisualHotspotRequest = {
  targetType: VisualHotspotTargetType;
  targetId: string;
  label: string;
  xPercent: number;
  yPercent: number;
  markerStyle?: string;
  publicationStatus?: PublicationStatus;
  sortOrder?: number;
};

export type UpdatePortalVisualHotspotRequest = {
  targetType?: VisualHotspotTargetType;
  targetId?: string;
  label?: string;
  xPercent?: number;
  yPercent?: number;
  markerStyle?: string;
  publicationStatus?: PublicationStatus;
  sortOrder?: number;
};

export type PublicVisualMapMedia = MediaAssetSummary & {
  title: string | null;
};

export type PublicVisualHotspotItem = {
  id: string;
  label: string;
  xPercent: string;
  yPercent: string;
  markerStyle: string | null;
  sortOrder: number | null;
  target: {
    type: VisualHotspotTargetType;
    id: string;
    displayName: string;
  };
};

export type PublicVisualCanvasItem = {
  id: string;
  contextType: VisualMapContextType;
  contextId: string;
  title: string | null;
  description: string | null;
  media: PublicVisualMapMedia;
  hotspots: PublicVisualHotspotItem[];
};

export type PublicVisualCanvasListResponse = {
  data: PublicVisualCanvasItem[];
};
