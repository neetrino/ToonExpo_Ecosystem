import type {
  CreatePortalVisualHotspotRequest,
  MappingHotspotGeometry,
  PortalVisualHotspotItem,
  UpdatePortalVisualHotspotRequest,
  VisualHotspotInteractionType,
  VisualHotspotShapeType,
} from '@toonexpo/contracts';

import { MARKER_TO_PERCENT } from '../constants';
import { DEFAULT_MARKER_POINT } from './mapping-math';

export type MappingGeometryInput = {
  markerX: number | null;
  markerY: number | null;
  svgPath: string | null;
};

/**
 * Maps Defense canvas coords (0–1) + optional path to Nest hotspot geometry.
 */
export const toHotspotGeometry = (input: MappingGeometryInput): MappingHotspotGeometry => {
  const hasMarker = input.markerX != null && input.markerY != null;
  const hasPath = Boolean(input.svgPath);

  const shapeType: VisualHotspotShapeType = hasPath ? 'polygon' : 'point';
  let interactionType: VisualHotspotInteractionType = 'marker';
  if (hasMarker && hasPath) {
    interactionType = 'both';
  } else if (hasPath) {
    interactionType = 'polygon';
  }

  return {
    shapeType,
    interactionType,
    xPercent: (input.markerX ?? DEFAULT_MARKER_POINT.x) * MARKER_TO_PERCENT,
    yPercent: (input.markerY ?? DEFAULT_MARKER_POINT.y) * MARKER_TO_PERCENT,
    svgPath: input.svgPath,
  };
};

export const hotspotToMappingCoords = (
  hotspot: PortalVisualHotspotItem,
): Pick<MappingGeometryInput, 'markerX' | 'markerY' | 'svgPath'> => {
  const showMarker =
    hotspot.interactionType === 'marker' || hotspot.interactionType === 'both';
  return {
    markerX: showMarker ? Number(hotspot.xPercent) / MARKER_TO_PERCENT : null,
    markerY: showMarker ? Number(hotspot.yPercent) / MARKER_TO_PERCENT : null,
    svgPath: hotspot.svgPath,
  };
};

export const toCreateHotspotBody = (params: {
  targetType: CreatePortalVisualHotspotRequest['targetType'];
  targetId: string;
  label: string;
  geometry: MappingGeometryInput;
}): CreatePortalVisualHotspotRequest => {
  const geometry = toHotspotGeometry(params.geometry);
  return {
    targetType: params.targetType,
    targetId: params.targetId,
    label: params.label,
    xPercent: geometry.xPercent,
    yPercent: geometry.yPercent,
    shapeType: geometry.shapeType,
    interactionType: geometry.interactionType,
    svgPath: geometry.svgPath ?? null,
    /** Interactive Mapping draws for the public site — persist as published. */
    publicationStatus: 'published',
  };
};

export const toUpdateHotspotBody = (
  geometry: MappingGeometryInput,
  label?: string,
): UpdatePortalVisualHotspotRequest => {
  const mapped = toHotspotGeometry(geometry);
  const body: UpdatePortalVisualHotspotRequest = {
    xPercent: mapped.xPercent,
    yPercent: mapped.yPercent,
    shapeType: mapped.shapeType,
    interactionType: mapped.interactionType,
    svgPath: mapped.svgPath ?? null,
    publicationStatus: 'published',
  };
  if (label !== undefined) {
    body.label = label;
  }
  return body;
};
