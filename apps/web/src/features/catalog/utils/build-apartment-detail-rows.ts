import type { ApartmentDetail, PriceVisibility } from '@toonexpo/contracts';

import {
  parseApartmentFeatureExtras,
  type ApartmentFeatureExtras,
} from '@/features/catalog/utils/apartment-features';
import { formatCatalogPrice } from '@/features/catalog/utils/format-price';

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
  area: string;
  bedrooms: string;
  pricePerArea: string;
  totalPrice: string;
  status: string;
  windows: string;
  bathrooms: string;
  handoverDescription: string;
  balconies: string;
  generalDescription: string;
  ceilingHeight: string;
  finishingStatus: string;
};

type BuildApartmentDetailRowsOptions = {
  apartment: ApartmentDetail;
  district: string | null;
  locale: string;
  labels: DetailLabels;
  formatArea: (area: string) => string;
  formatCeilingHeight: (height: number) => string;
  formatStatus: (status: ApartmentDetail['salesStatus']) => string;
  onRequestLabel: string;
  signInLabel: string;
};

const EMPTY_VALUE = '—';

/**
 * Builds the public apartment criteria rows for the property details grid.
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
  const priceOptions = {
    amount: apartment.price,
    currency: apartment.priceCurrency,
    locale: options.locale,
    priceVisibility: apartment.priceVisibility,
    onRequestLabel: options.onRequestLabel,
    signInLabel: options.signInLabel,
  };

  return [
    { label: labels.neighborhood, value: neighborhoodLabel },
    { label: labels.building, value: apartment.building.name || EMPTY_VALUE },
    { label: labels.floor, value: floorLabel },
    { label: labels.unitNumber, value: apartment.number || EMPTY_VALUE },
    {
      label: labels.area,
      value: apartment.areaTotal != null ? options.formatArea(apartment.areaTotal) : EMPTY_VALUE,
    },
    {
      label: labels.bedrooms,
      value: apartment.bedrooms != null ? String(apartment.bedrooms) : EMPTY_VALUE,
    },
    {
      label: labels.pricePerArea,
      value: formatPricePerArea({
        ...priceOptions,
        areaTotal: apartment.areaTotal,
      }),
    },
    { label: labels.totalPrice, value: formatCatalogPrice(priceOptions) },
    {
      label: labels.status,
      value: options.formatStatus(apartment.salesStatus),
    },
    {
      label: labels.windows,
      value: formatOptionalCount(extras.windowsCount),
    },
    {
      label: labels.bathrooms,
      value: apartment.bathrooms != null ? String(apartment.bathrooms) : EMPTY_VALUE,
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

const formatPricePerArea = (options: {
  amount: string | null;
  currency: string;
  areaTotal: string | null;
  locale: string;
  priceVisibility: PriceVisibility;
  onRequestLabel: string;
  signInLabel: string;
}): string => {
  const area = options.areaTotal != null ? Number(options.areaTotal) : null;
  if (options.amount == null || area == null || !Number.isFinite(area) || area <= 0) {
    return formatCatalogPrice(options);
  }

  const total = Number(options.amount);
  if (!Number.isFinite(total)) {
    return EMPTY_VALUE;
  }

  return formatCatalogPrice({
    ...options,
    amount: Math.round(total / area),
  });
};
