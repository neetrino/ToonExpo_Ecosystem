import type { ApartmentDetail, ApartmentSalesStatus } from '@toonexpo/contracts';

import {
  parseApartmentFeatureExtras,
  type ApartmentFeatureExtras,
} from '@/features/catalog/utils/apartment-features';

export type ApartmentDetailCriterionId =
  | 'neighborhood'
  | 'building'
  | 'floor'
  | 'unitNumber'
  | 'status'
  | 'windows'
  | 'balconies'
  | 'ceilingHeight'
  | 'finishingStatus'
  | 'generalDescription'
  | 'handoverDescription';

export type ApartmentDetailRow = {
  id: ApartmentDetailCriterionId;
  label: string;
  value: string;
  /** Full-width list row under the card grid (descriptions). */
  wide?: boolean;
  /** When set, value renders as a sales-status pill. */
  salesStatus?: ApartmentSalesStatus;
};

type DetailLabels = Record<ApartmentDetailCriterionId, string>;

type BuildApartmentDetailRowsOptions = {
  apartment: ApartmentDetail;
  district: string | null;
  labels: DetailLabels;
  formatCeilingHeight: (height: number) => string;
  formatStatus: (status: ApartmentDetail['salesStatus']) => string;
};

const EMPTY_VALUE = '—';

/**
 * Builds property-details rows: compact cards first (3 per row), descriptions last.
 */
export const buildApartmentDetailRows = (
  options: BuildApartmentDetailRowsOptions,
): ApartmentDetailRow[] => {
  const { apartment, district, labels } = options;
  const extras = parseApartmentFeatureExtras(apartment.features);
  const floorLabel = apartment.floor.number != null ? String(apartment.floor.number) : EMPTY_VALUE;
  const neighborhoodLabel = district?.trim() || apartment.project.name.trim() || EMPTY_VALUE;

  return [
    { id: 'neighborhood', label: labels.neighborhood, value: neighborhoodLabel },
    { id: 'building', label: labels.building, value: apartment.building.name || EMPTY_VALUE },
    { id: 'floor', label: labels.floor, value: floorLabel },
    { id: 'unitNumber', label: labels.unitNumber, value: apartment.number || EMPTY_VALUE },
    {
      id: 'status',
      label: labels.status,
      value: options.formatStatus(apartment.salesStatus),
      salesStatus: apartment.salesStatus,
    },
    {
      id: 'windows',
      label: labels.windows,
      value: formatOptionalCount(extras.windowsCount),
    },
    {
      id: 'balconies',
      label: labels.balconies,
      value: formatOptionalCount(extras.balconiesCount),
    },
    {
      id: 'ceilingHeight',
      label: labels.ceilingHeight,
      value: formatCeiling(extras, options.formatCeilingHeight),
    },
    {
      id: 'finishingStatus',
      label: labels.finishingStatus,
      value: extras.finishingStatus ?? EMPTY_VALUE,
    },
    {
      id: 'generalDescription',
      label: labels.generalDescription,
      value: apartment.description?.trim() || EMPTY_VALUE,
      wide: true,
    },
    {
      id: 'handoverDescription',
      label: labels.handoverDescription,
      value: extras.handoverDescription ?? EMPTY_VALUE,
      wide: true,
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
