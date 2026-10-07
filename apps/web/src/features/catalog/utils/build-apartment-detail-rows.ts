import type { ApartmentDetail, ApartmentSalesStatus } from '@toonexpo/contracts';

import {
  parseApartmentFeatureExtras,
  resolveLocalizedFeatureText,
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
  locale: string;
  formatCeilingHeight: (height: number) => string;
  formatStatus: (status: ApartmentDetail['salesStatus']) => string;
  /** Project-level handover text used when the apartment has none. */
  projectHandoverDescription?: string | null;
};

/**
 * Builds property-details rows from admin-filled values only.
 */
export const buildApartmentDetailRows = (
  options: BuildApartmentDetailRowsOptions,
): ApartmentDetailRow[] => {
  const { apartment, district, labels, locale } = options;
  const extras = parseApartmentFeatureExtras(apartment.features);
  const handoverDescription =
    resolveLocalizedFeatureText(extras.handoverDescription, locale)?.trim() ||
    options.projectHandoverDescription?.trim() ||
    null;
  const rows: Array<ApartmentDetailRow | null> = [
    filledRow('neighborhood', labels.neighborhood, district?.trim() || null),
    filledRow('building', labels.building, apartment.building.name.trim() || null),
    filledRow(
      'floor',
      labels.floor,
      apartment.floor.number != null ? String(apartment.floor.number) : null,
    ),
    filledRow('unitNumber', labels.unitNumber, apartment.number.trim() || null),
    {
      id: 'status',
      label: labels.status,
      value: options.formatStatus(apartment.salesStatus),
      salesStatus: apartment.salesStatus,
    },
    filledRow('windows', labels.windows, formatOptionalCount(extras.windowsCount)),
    filledRow('balconies', labels.balconies, formatOptionalCount(extras.balconiesCount)),
    filledRow(
      'ceilingHeight',
      labels.ceilingHeight,
      formatCeiling(extras, options.formatCeilingHeight),
    ),
    filledRow(
      'finishingStatus',
      labels.finishingStatus,
      resolveLocalizedFeatureText(extras.finishingStatus, locale),
    ),
    filledRow(
      'generalDescription',
      labels.generalDescription,
      apartment.description?.trim() || null,
      true,
    ),
    handoverDescription
      ? {
          id: 'handoverDescription',
          label: labels.handoverDescription,
          value: handoverDescription,
          wide: true,
        }
      : null,
  ];

  return rows.filter((row): row is ApartmentDetailRow => row != null);
};

const filledRow = (
  id: ApartmentDetailCriterionId,
  label: string,
  value: string | null,
  wide = false,
): ApartmentDetailRow | null => {
  const text = value?.trim() ?? '';
  if (text.length === 0) {
    return null;
  }
  return wide ? { id, label, value: text, wide: true } : { id, label, value: text };
};

const formatOptionalCount = (value: number | null): string | null =>
  value != null ? String(value) : null;

const formatCeiling = (
  extras: ApartmentFeatureExtras,
  formatCeilingHeight: (height: number) => string,
): string | null =>
  extras.ceilingHeightM != null ? formatCeilingHeight(extras.ceilingHeightM) : null;
