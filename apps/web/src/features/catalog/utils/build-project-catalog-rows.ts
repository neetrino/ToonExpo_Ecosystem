import type { ProjectCatalogDetails } from '@/features/catalog/utils/project-catalog-details';
import { hasProjectCatalogDetails } from '@/features/catalog/utils/project-catalog-details';

export type ProjectCatalogCriterionId =
  | 'propertyType'
  | 'country'
  | 'city'
  | 'address'
  | 'brandName'
  | 'permitNumber'
  | 'constructionStart'
  | 'constructionEnd'
  | 'constructionStatus'
  | 'partnerBank'
  | 'pricePerSqm'
  | 'areaRange'
  | 'unitPriceRange'
  | 'managementFee'
  | 'parkingAvailable'
  | 'storageAvailable'
  | 'elevator'
  | 'constructionType'
  | 'facadeMaterials'
  | 'seismicStandard'
  | 'buildingsCount'
  | 'apartmentsCount'
  | 'parkingSpaces'
  | 'ceilingHeight'
  | 'floorsCount'
  | 'heating'
  | 'hotWater'
  | 'gas'
  | 'schoolDistance'
  | 'kindergartenDistance'
  | 'commercialAreaSqm'
  | 'distanceExtra'
  | 'economicZone'
  | 'finishingStatus'
  | 'services'
  | 'paymentTypes'
  | 'installmentTerms'
  | 'mortgageTerms'
  | 'specialTerms'
  | 'handoverDescription';

export type ProjectCatalogRow = {
  id: ProjectCatalogCriterionId;
  label: string;
  value: string;
  wide?: boolean;
};

type DetailLabels = Record<ProjectCatalogCriterionId, string>;

type BuildProjectCatalogRowsOptions = {
  details: ProjectCatalogDetails;
  labels: DetailLabels;
  formatCeilingHeight: (height: string) => string;
  formatDistanceMeters: (distance: string) => string;
  formatRange: (min: string | null, max: string | null) => string | null;
};

const pushCard = (
  rows: ProjectCatalogRow[],
  id: ProjectCatalogCriterionId,
  label: string,
  value: string | null,
): void => {
  if (value == null) {
    return;
  }
  rows.push({ id, label, value });
};

const pushWide = (
  rows: ProjectCatalogRow[],
  id: ProjectCatalogCriterionId,
  label: string,
  value: string | null,
): void => {
  if (value == null) {
    return;
  }
  rows.push({ id, label, value, wide: true });
};

/**
 * Builds catalog fact rows from parsed project details. Skips empty fields.
 */
export const buildProjectCatalogRows = (
  options: BuildProjectCatalogRowsOptions,
): ProjectCatalogRow[] => {
  const { details, labels } = options;
  if (!hasProjectCatalogDetails(details)) {
    return [];
  }

  const rows: ProjectCatalogRow[] = [];
  const pricePerSqm = options.formatRange(details.pricePerSqmMin, details.pricePerSqmMax);
  const areaRange = options.formatRange(details.areaMinSqm, details.areaMaxSqm);
  const unitPrice = options.formatRange(details.unitPriceMin, details.unitPriceMax);
  const ceiling =
    details.ceilingHeightM != null ? options.formatCeilingHeight(details.ceilingHeightM) : null;
  const schoolDistance =
    details.schoolDistance != null ? options.formatDistanceMeters(details.schoolDistance) : null;
  const kindergartenDistance =
    details.kindergartenDistance != null
      ? options.formatDistanceMeters(details.kindergartenDistance)
      : null;
  const distanceExtra =
    details.distanceExtra != null ? options.formatDistanceMeters(details.distanceExtra) : null;

  pushCard(rows, 'propertyType', labels.propertyType, details.propertyType);
  pushCard(rows, 'country', labels.country, details.country);
  pushCard(rows, 'city', labels.city, details.city);
  pushCard(rows, 'address', labels.address, details.address);
  pushCard(rows, 'constructionStart', labels.constructionStart, details.constructionStart);
  pushCard(rows, 'constructionEnd', labels.constructionEnd, details.constructionEnd);
  pushCard(rows, 'constructionStatus', labels.constructionStatus, details.constructionStatus);
  pushCard(rows, 'brandName', labels.brandName, details.brandName);
  pushCard(rows, 'permitNumber', labels.permitNumber, details.permitNumber);
  pushCard(rows, 'partnerBank', labels.partnerBank, details.partnerBank);
  pushCard(rows, 'pricePerSqm', labels.pricePerSqm, pricePerSqm);
  pushCard(rows, 'areaRange', labels.areaRange, areaRange);
  pushCard(rows, 'unitPriceRange', labels.unitPriceRange, unitPrice);
  pushCard(rows, 'managementFee', labels.managementFee, details.managementFee);
  pushCard(rows, 'parkingAvailable', labels.parkingAvailable, details.parkingAvailable);
  pushCard(rows, 'storageAvailable', labels.storageAvailable, details.storageAvailable);
  pushCard(rows, 'elevator', labels.elevator, details.elevator);
  pushCard(rows, 'constructionType', labels.constructionType, details.constructionType);
  pushCard(rows, 'facadeMaterials', labels.facadeMaterials, details.facadeMaterials);
  pushCard(rows, 'seismicStandard', labels.seismicStandard, details.seismicStandard);
  pushCard(rows, 'buildingsCount', labels.buildingsCount, details.buildingsCount);
  pushCard(rows, 'apartmentsCount', labels.apartmentsCount, details.apartmentsCount);
  pushCard(rows, 'parkingSpaces', labels.parkingSpaces, details.parkingSpaces);
  pushCard(rows, 'ceilingHeight', labels.ceilingHeight, ceiling);
  pushCard(rows, 'floorsCount', labels.floorsCount, details.floorsCount);
  pushCard(rows, 'heating', labels.heating, details.heating);
  pushCard(rows, 'hotWater', labels.hotWater, details.hotWater);
  pushCard(rows, 'gas', labels.gas, details.gas);
  pushCard(rows, 'schoolDistance', labels.schoolDistance, schoolDistance);
  pushCard(rows, 'kindergartenDistance', labels.kindergartenDistance, kindergartenDistance);
  pushCard(rows, 'commercialAreaSqm', labels.commercialAreaSqm, details.commercialAreaSqm);
  pushCard(rows, 'distanceExtra', labels.distanceExtra, distanceExtra);
  pushCard(rows, 'economicZone', labels.economicZone, details.economicZone);
  pushCard(rows, 'finishingStatus', labels.finishingStatus, details.finishingStatus);

  pushWide(rows, 'services', labels.services, details.services);
  pushWide(rows, 'paymentTypes', labels.paymentTypes, details.paymentTypes);
  pushWide(rows, 'installmentTerms', labels.installmentTerms, details.installmentTerms);
  pushWide(rows, 'mortgageTerms', labels.mortgageTerms, details.mortgageTerms);
  pushWide(rows, 'specialTerms', labels.specialTerms, details.specialTerms);
  pushWide(rows, 'handoverDescription', labels.handoverDescription, details.handoverDescription);

  return rows;
};
