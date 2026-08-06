/** Separator used by public address lines (matches the builder hero line). */
const ADDRESS_SEGMENT_SEPARATOR = ' · ';

export type GeoMapAddressParts = {
  address: string | null;
  district: string | null;
  city: string | null;
};

const clean = (value: string | null): string | null => value?.trim() || null;

/**
 * Single-line address for the map hover card, built from the project record the
 * admin fills in: street address first, then the widest available area label.
 * Returns `null` when the project has no location data at all.
 */
export const formatGeoMapAddressLine = (parts: GeoMapAddressParts): string | null => {
  const address = clean(parts.address);
  const district = clean(parts.district);
  const city = clean(parts.city);
  const area = city ?? district;

  if (address && area) {
    return `${address}${ADDRESS_SEGMENT_SEPARATOR}${area}`;
  }
  if (address) {
    return address;
  }
  if (district && city) {
    return `${district}${ADDRESS_SEGMENT_SEPARATOR}${city}`;
  }
  return area;
};
