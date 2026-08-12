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
    windowsCount: asFiniteNumber(
      record['windowsCount'] ?? record['windows'] ?? record['windowCount'],
    ),
    balconiesCount: asFiniteNumber(
      record['balconiesCount'] ?? record['balconies'] ?? record['balconyCount'],
    ),
    ceilingHeightM: asFiniteNumber(
      record['ceilingHeightM'] ?? record['ceilingHeight'] ?? record['ceiling'],
    ),
    finishingStatus: asNonEmptyString(
      record['finishingStatus'] ?? record['finishStatus'] ?? record['finishing'],
    ),
    handoverDescription: asNonEmptyString(
      record['handoverDescription'] ?? record['handover'] ?? record['deliveryDescription'],
    ),
  };
};

/**
 * Merges finishing/handover form values into apartment `features` JSON.
 * Clears known aliases when the field is emptied.
 */
export const mergeApartmentFeatureExtras = (
  existing: unknown,
  extras: {
    finishingStatus: string;
    handoverDescription: string;
  },
): Record<string, unknown> => {
  const base =
    existing != null && typeof existing === 'object' && !Array.isArray(existing)
      ? { ...(existing as Record<string, unknown>) }
      : {};

  const finishingStatus = extras.finishingStatus.trim();
  if (finishingStatus.length > 0) {
    base['finishingStatus'] = finishingStatus;
  } else {
    delete base['finishingStatus'];
    delete base['finishStatus'];
    delete base['finishing'];
  }

  const handoverDescription = extras.handoverDescription.trim();
  if (handoverDescription.length > 0) {
    base['handoverDescription'] = handoverDescription;
  } else {
    delete base['handoverDescription'];
    delete base['handover'];
    delete base['deliveryDescription'];
  }

  return base;
};
