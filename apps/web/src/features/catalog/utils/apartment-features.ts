/**
 * Optional apartment extras stored in `Apartment.features` JSON.
 * Used when dedicated columns are not yet on the schema.
 */
export type ApartmentFeatureExtras = {
  windowsCount: number | null;
  balconiesCount: number | null;
  ceilingHeightM: number | null;
  finishingStatus: string | null;
  handoverDescription: string | null;
};

const EMPTY_EXTRAS: ApartmentFeatureExtras = {
  windowsCount: null,
  balconiesCount: null,
  ceilingHeightM: null,
  finishingStatus: null,
  handoverDescription: null,
};

const asFiniteNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const asNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

/**
 * Reads known apartment criteria from the opaque `features` payload.
 */
export const parseApartmentFeatureExtras = (features: unknown): ApartmentFeatureExtras => {
  if (features == null || typeof features !== 'object' || Array.isArray(features)) {
    return EMPTY_EXTRAS;
  }

  const record = features as Record<string, unknown>;

  return {
    windowsCount: asFiniteNumber(record.windowsCount ?? record.windows ?? record.windowCount),
    balconiesCount: asFiniteNumber(
      record.balconiesCount ?? record.balconies ?? record.balconyCount,
    ),
    ceilingHeightM: asFiniteNumber(record.ceilingHeightM ?? record.ceilingHeight ?? record.ceiling),
    finishingStatus: asNonEmptyString(
      record.finishingStatus ?? record.finishStatus ?? record.finishing,
    ),
    handoverDescription: asNonEmptyString(
      record.handoverDescription ?? record.handover ?? record.deliveryDescription,
    ),
  };
};
