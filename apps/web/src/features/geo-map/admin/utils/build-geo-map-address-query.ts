const ARMENIA_SUFFIX = 'Armenia';

const uniqueNonEmpty = (values: readonly (string | null | undefined)[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const trimmed = value?.trim() ?? '';
    if (!trimmed || seen.has(trimmed.toLocaleLowerCase())) {
      continue;
    }
    seen.add(trimmed.toLocaleLowerCase());
    result.push(trimmed);
  }
  return result;
};

export type GeoMapAddressParts = {
  address: string | null;
  district: string | null;
  city: string | null;
  locationText: string | null;
};

/**
 * Project address as filled in Projects (no geocoder suffix, no rewriting).
 */
export const formatGeoMapSiteAddress = (parts: GeoMapAddressParts): string => {
  const core = uniqueNonEmpty([parts.address, parts.district, parts.city]);
  if (core.length > 0) {
    return core.join(', ');
  }
  return uniqueNonEmpty([parts.locationText]).join(', ');
};

/**
 * Builds a geocoder query from project location fields (street first, then area).
 * Internal lookup only — never shown as the project address.
 */
export const buildGeoMapAddressQuery = (parts: GeoMapAddressParts): string => {
  const site = formatGeoMapSiteAddress(parts);
  if (!site) {
    return '';
  }
  if (site.toLocaleLowerCase().includes(ARMENIA_SUFFIX.toLocaleLowerCase())) {
    return site;
  }
  return `${site}, ${ARMENIA_SUFFIX}`;
};
