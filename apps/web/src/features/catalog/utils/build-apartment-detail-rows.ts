import type { ApartmentDetail } from '@toonexpo/contracts';

import {
  parseApartmentFeatureExtras,
  type ApartmentFeatureExtras,
} from '@/features/catalog/utils/apartment-features';

export type ApartmentDetailRow = {
  label: string;
  value: string;
  wide?: boolean;
};

type DetailLabels = {
  neighborhood: string;
  building: string;
  floor: string;
  unitNumber: string;
  status: string;
  windows: string;
  handoverDescription: string;
  balconies: string;
  generalDescription: string;
  ceilingHeight: string;
  finishingStatus: string;
};

type BuildApartmentDetailRowsOptions = {
  apartment: ApartmentDetail;
  district: string | null;
  labels: DetailLabels;
  formatCeilingHeight: (height: number) => string;
  formatStatus: (status: ApartmentDetail['salesStatus']) => string;
};

const EMPTY_VALUE = '—';

/**
 * Builds the public apartment criteria rows for the property details grid.
 * Price, beds, baths, area, and price/m² live in the hero stats strip — omit them here.
 */
export const buildApartmentDetailRows = (
  options: BuildApartmentDetailRowsOptions,
): ApartmentDetailRow[] => {
  const { apartment, district, labels } = options;
  const extras = parseApartmentFeatureExtras(apartment.features);
  const floorLabel =
    apartment.floor.displayLabel?.trim() ||
    (apartment.floor.number != null ? String(apartment.floor.number) : EMPTY_VALUE);
  const neighborhoodLabel = district?.trim() || apartment.project.name.trim() || EMPTY_VALUE;

  return [
    { label: labels.neighborhood, value: neighborhoodLabel },
    { label: labels.building, value: apartment.building.name || EMPTY_VALUE },
    { label: labels.floor, value: floorLabel },
    { label: labels.unitNumber, value: apartment.number || EMPTY_VALUE },
    {
      label: labels.status,
      value: options.formatStatus(apartment.salesStatus),
    },
    {
      label: labels.windows,
      value: formatOptionalCount(extras.windowsCount),
    },
    {
      label: labels.handoverDescription,
      value: extras.handoverDescription ?? EMPTY_VALUE,
      wide: true,
    },
    {
      label: labels.balconies,
      value: formatOptionalCount(extras.balconiesCount),
    },
    {
      label: labels.generalDescription,
      value: apartment.description?.trim() || EMPTY_VALUE,
      wide: true,
    },
    {
      label: labels.ceilingHeight,
      value: formatCeiling(extras, options.formatCeilingHeight),
    },
    {
      label: labels.finishingStatus,
      value: extras.finishingStatus ?? EMPTY_VALUE,
    },
  ];
};

const formatOptionalCount = (value: number | null): string =>
  value != null ? String(value) : EMPTY_VALUE;

const formatCeiling = (
  extras: ApartmentFeatureExtras,
  formatCeilingHeight: (height: number) => string,
): string =>
  extras.ceilingHeightM != null ? formatCeilingHeight(extras.ceilingHeightM) : EMPTY_VALUE;
