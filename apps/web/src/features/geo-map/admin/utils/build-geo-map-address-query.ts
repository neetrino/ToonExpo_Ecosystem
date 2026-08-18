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
 * Builds a geocoder query from project location fields (street first, then area).
 */
export const buildGeoMapAddressQuery = (parts: GeoMapAddressParts): string => {
  const core = uniqueNonEmpty([parts.address, parts.district, parts.city]);
  const withFallback = core.length > 0 ? core : uniqueNonEmpty([parts.locationText]);
  if (withFallback.length === 0) {
    return '';
  }
  const joined = withFallback.join(', ');
  if (joined.toLocaleLowerCase().includes(ARMENIA_SUFFIX.toLocaleLowerCase())) {
    return joined;
  }
  return `${joined}, ${ARMENIA_SUFFIX}`;
};
