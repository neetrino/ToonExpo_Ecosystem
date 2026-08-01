import type { AdminGeoMapModelItem, PublicGeoMapModelItem } from '@toonexpo/contracts';

import type { GeoMapObject } from '@/features/geo-map/types';

type GeoMapDecimalFields = Pick<
  AdminGeoMapModelItem,
  | 'longitude'
  | 'latitude'
  | 'altitudeM'
  | 'headingDeg'
  | 'pitchDeg'
  | 'rollDeg'
  | 'scale'
  | 'minZoom'
>;

const toNumericTransform = (item: GeoMapDecimalFields) => ({
  longitude: Number(item.longitude),
  latitude: Number(item.latitude),
  altitudeM: Number(item.altitudeM),
  headingDeg: Number(item.headingDeg),
  pitchDeg: Number(item.pitchDeg),
  rollDeg: Number(item.rollDeg),
  scale: Number(item.scale),
  minZoom: Number(item.minZoom),
});

/** Maps an admin API item (`GET /admin/geo-map/models`) to the canvas view-model. */
export const mapAdminGeoMapItemToObject = (item: AdminGeoMapModelItem): GeoMapObject => ({
  id: item.id,
  projectId: item.projectId,
  label: item.projectName,
  logoUrl: null,
  modelUrl: item.modelUrl,
  ...toNumericTransform(item),
});

/** Maps a batch of admin API items to canvas view-models. */
export const mapAdminGeoMapItemsToObjects = (items: AdminGeoMapModelItem[]): GeoMapObject[] =>
  items.map(mapAdminGeoMapItemToObject);

/**
 * Maps a public API item (`GET /public/geo-map/models`) to the canvas view-model.
 * Public payloads carry one model per project (v1), so `projectId` doubles as the object id.
 */
export const mapPublicGeoMapItemToObject = (item: PublicGeoMapModelItem): GeoMapObject => ({
  id: item.projectId,
  projectId: item.projectId,
  label: item.projectName,
  logoUrl: item.logoUrl,
  modelUrl: item.modelUrl,
  ...toNumericTransform(item),
});

/** Maps a batch of public API items to canvas view-models. */
export const mapPublicGeoMapItemsToObjects = (items: PublicGeoMapModelItem[]): GeoMapObject[] =>
  items.map(mapPublicGeoMapItemToObject);
