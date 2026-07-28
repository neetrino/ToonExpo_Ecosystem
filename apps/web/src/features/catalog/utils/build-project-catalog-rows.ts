import type { ProjectCatalogDetails } from '@/features/catalog/utils/project-catalog-details';
import { hasProjectCatalogDetails } from '@/features/catalog/utils/project-catalog-details';

export type ProjectCatalogCriterionId =
  | 'propertyType'
  | 'country'
  | 'city'
  | 'address'
  | 'zipCode'
  | 'brandName'
  | 'designer'
  | 'contractor'
  | 'permitNumber'
  | 'constructionStart'
  | 'constructionEnd'
  | 'constructionStatus'
  | 'partnerBank'
  | 'bedroomsCount'
  | 'pricePerSqm'
  | 'areaRange'
  | 'unitPriceRange'
  | 'parkingPrice'
  | 'managementFee'
  | 'parkingAvailable'
  | 'storageAvailable'
  | 'elevator'
  | 'elevatorsCount'
  | 'constructionType'
  | 'facadeMaterials'
  | 'thermalSoundInsulation'
  | 'seismicStandard'
  | 'totalLandArea'
  | 'totalResidentialArea'
  | 'buildingsCount'
  | 'apartmentsCount'
  | 'availableApartmentsCount'
  | 'parkingSpaces'
  | 'openParkingSpaces'
  | 'closedParkingSpaces'
  | 'parkingStandardSizes'
  | 'ceilingHeight'
  | 'floorsCount'
  | 'heating'
  | 'cooling'
  | 'hotWater'
  | 'gas'
  | 'schoolDistance'
  | 'kindergartenDistance'
  | 'commercialAreaSqm'
  | 'distanceExtra'
  | 'economicZone'
  | 'subsidizedPrograms'
  | 'finishingStatus'
  | 'services'
  | 'paymentTypes'
  | 'installmentTerms'
  | 'mortgageTerms'
  | 'specialTermsAvailable'
  | 'specialTerms'
  | 'incomeTaxRefund'
  | 'handoverDescription';

export type ProjectCatalogRow = {
  id: ProjectCatalogCriterionId;
  label: string;
  value: string;
  wide?: boolean;
};

/** Banks, prices, fees, payment / mortgage / installment terms. */
export const PROJECT_CATALOG_FINANCE_CRITERION_IDS = [
  'partnerBank',
  'pricePerSqm',
  'unitPriceRange',
  'parkingPrice',
  'managementFee',
  'paymentTypes',
  'installmentTerms',
  'mortgageTerms',
  'specialTerms',
  'specialTermsAvailable',
  'incomeTaxRefund',
  'subsidizedPrograms',
] as const satisfies readonly ProjectCatalogCriterionId[];

export type ProjectCatalogFinanceCriterionId =
  (typeof PROJECT_CATALOG_FINANCE_CRITERION_IDS)[number];

export const isProjectCatalogFinanceCriterion = (
  id: ProjectCatalogCriterionId,
): id is ProjectCatalogFinanceCriterionId => {
  return (PROJECT_CATALOG_FINANCE_CRITERION_IDS as readonly string[]).includes(id);
};

export const splitProjectCatalogRowsByFinance = (
  rows: readonly ProjectCatalogRow[],
): { general: ProjectCatalogRow[]; finance: ProjectCatalogRow[] } => {
  const general: ProjectCatalogRow[] = [];
  const finance: ProjectCatalogRow[] = [];
  for (const row of rows) {
    if (isProjectCatalogFinanceCriterion(row.id)) {
      finance.push(row);
    } else {
      general.push(row);
    }
  }
  return { general, finance };
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
  pushCard(rows, 'zipCode', labels.zipCode, details.zipCode);
  pushCard(rows, 'constructionStart', labels.constructionStart, details.constructionStart);
  pushCard(rows, 'constructionEnd', labels.constructionEnd, details.constructionEnd);
  pushCard(rows, 'constructionStatus', labels.constructionStatus, details.constructionStatus);
  pushCard(rows, 'brandName', labels.brandName, details.brandName);
  pushCard(rows, 'designer', labels.designer, details.designer);
  pushCard(rows, 'contractor', labels.contractor, details.contractor);
  pushCard(rows, 'permitNumber', labels.permitNumber, details.permitNumber);
  pushCard(rows, 'bedroomsCount', labels.bedroomsCount, details.bedroomsCount);
  pushCard(rows, 'partnerBank', labels.partnerBank, details.partnerBank);
  pushCard(rows, 'pricePerSqm', labels.pricePerSqm, pricePerSqm);
  pushCard(rows, 'areaRange', labels.areaRange, areaRange);
  pushCard(rows, 'unitPriceRange', labels.unitPriceRange, unitPrice);
  pushCard(rows, 'parkingPrice', labels.parkingPrice, details.parkingPrice);
  pushCard(rows, 'managementFee', labels.managementFee, details.managementFee);
  pushCard(rows, 'parkingAvailable', labels.parkingAvailable, details.parkingAvailable);
  pushCard(rows, 'storageAvailable', labels.storageAvailable, details.storageAvailable);
  pushCard(rows, 'elevator', labels.elevator, details.elevator);
  pushCard(rows, 'elevatorsCount', labels.elevatorsCount, details.elevatorsCount);
  pushCard(rows, 'constructionType', labels.constructionType, details.constructionType);
  pushCard(rows, 'facadeMaterials', labels.facadeMaterials, details.facadeMaterials);
  pushCard(
    rows,
    'thermalSoundInsulation',
    labels.thermalSoundInsulation,
    details.thermalSoundInsulation,
  );
  pushCard(rows, 'seismicStandard', labels.seismicStandard, details.seismicStandard);
  pushCard(rows, 'totalLandArea', labels.totalLandArea, details.totalLandArea);
  pushCard(rows, 'totalResidentialArea', labels.totalResidentialArea, details.totalResidentialArea);
  pushCard(rows, 'buildingsCount', labels.buildingsCount, details.buildingsCount);
  pushCard(rows, 'floorsCount', labels.floorsCount, details.floorsCount);
  pushCard(rows, 'apartmentsCount', labels.apartmentsCount, details.apartmentsCount);
  pushCard(
    rows,
    'availableApartmentsCount',
    labels.availableApartmentsCount,
    details.availableApartmentsCount,
  );
  pushCard(rows, 'ceilingHeight', labels.ceilingHeight, ceiling);
  pushCard(rows, 'heating', labels.heating, details.heating);
  pushCard(rows, 'cooling', labels.cooling, details.cooling);
  pushCard(rows, 'hotWater', labels.hotWater, details.hotWater);
  pushCard(rows, 'gas', labels.gas, details.gas);
  pushCard(rows, 'commercialAreaSqm', labels.commercialAreaSqm, details.commercialAreaSqm);
  pushCard(rows, 'openParkingSpaces', labels.openParkingSpaces, details.openParkingSpaces);
  pushCard(rows, 'closedParkingSpaces', labels.closedParkingSpaces, details.closedParkingSpaces);
  pushCard(rows, 'parkingStandardSizes', labels.parkingStandardSizes, details.parkingStandardSizes);
  pushCard(rows, 'parkingSpaces', labels.parkingSpaces, details.parkingSpaces);
  pushCard(rows, 'schoolDistance', labels.schoolDistance, schoolDistance);
  pushCard(rows, 'kindergartenDistance', labels.kindergartenDistance, kindergartenDistance);
  pushCard(rows, 'distanceExtra', labels.distanceExtra, distanceExtra);
  pushCard(rows, 'economicZone', labels.economicZone, details.economicZone);
  pushCard(rows, 'finishingStatus', labels.finishingStatus, details.finishingStatus);

  pushWide(rows, 'services', labels.services, details.services);
  pushWide(rows, 'paymentTypes', labels.paymentTypes, details.paymentTypes);
  pushWide(rows, 'installmentTerms', labels.installmentTerms, details.installmentTerms);
  pushWide(rows, 'mortgageTerms', labels.mortgageTerms, details.mortgageTerms);
  pushWide(rows, 'specialTerms', labels.specialTerms, details.specialTerms);
  pushWide(
    rows,
    'specialTermsAvailable',
    labels.specialTermsAvailable,
    details.specialTermsAvailable,
  );
  pushWide(rows, 'incomeTaxRefund', labels.incomeTaxRefund, details.incomeTaxRefund);
  pushWide(rows, 'subsidizedPrograms', labels.subsidizedPrograms, details.subsidizedPrograms);
  pushWide(rows, 'handoverDescription', labels.handoverDescription, details.handoverDescription);

  return rows;
};
