/** Public project detail route — slug in URL (same convention as admin/builder portals). */
export const buildProjectPublicHref = (projectSlug: string): `/projects/${string}` =>
  `/projects/${encodeURIComponent(projectSlug)}`;

export const buildProjectBuildingPublicHref = (
  projectSlug: string,
  buildingId: string,
): `/projects/${string}/buildings/${string}` =>
  `/projects/${encodeURIComponent(projectSlug)}/buildings/${encodeURIComponent(buildingId)}`;

export const buildProjectDistrictPublicHref = (
  projectSlug: string,
  districtId: string,
): `/projects/${string}/districts/${string}` =>
  `/projects/${encodeURIComponent(projectSlug)}/districts/${encodeURIComponent(districtId)}`;

export const buildProjectFloorPublicHref = (
  projectSlug: string,
  buildingId: string,
  floorId: string,
): `/projects/${string}/buildings/${string}/floors/${string}` =>
  `/projects/${encodeURIComponent(projectSlug)}/buildings/${encodeURIComponent(buildingId)}/floors/${encodeURIComponent(floorId)}`;

export const buildProjectInterestPublicHref = (
  projectSlug: string,
): `/projects/${string}/interest` =>
  `/projects/${encodeURIComponent(projectSlug)}/interest`;

export const buildApartmentPublicHref = (apartmentId: string): `/apartments/${string}` =>
  `/apartments/${encodeURIComponent(apartmentId)}`;
