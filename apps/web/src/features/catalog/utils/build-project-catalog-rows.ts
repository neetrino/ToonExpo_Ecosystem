import type { ProjectCatalogDetails } from '@/features/catalog/utils/project-catalog-details';
import { hasProjectCatalogDetails } from '@/features/catalog/utils/project-catalog-details';

export type ProjectCatalogCriterionId =
  | 'slogan'
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
  | 'handoverDescription'
  | 'greenZones'
  | 'territorialAdvantages'
  | 'views';

export type ProjectCatalogRow = {
  id: ProjectCatalogCriterionId;
  label: string;
  value: string;
  wide?: boolean;
};

/** Area and unit price ranges → Finance card. */
export const PROJECT_CATALOG_FINANCE_CRITERION_IDS = [
  'areaRange',
  'pricePerSqm',
  'unitPriceRange',
] as const satisfies readonly ProjectCatalogCriterionId[];

/** Mortgage / payment terms → Bank partner card. */
export const PROJECT_CATALOG_BANK_PARTNER_CRITERION_IDS = [
  'partnerBank',
  'parkingPrice',
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

export type ProjectCatalogBankPartnerCriterionId =
  (typeof PROJECT_CATALOG_BANK_PARTNER_CRITERION_IDS)[number];

export const isProjectCatalogFinanceCriterion = (
  id: ProjectCatalogCriterionId,
): id is ProjectCatalogFinanceCriterionId => {
  return (PROJECT_CATALOG_FINANCE_CRITERION_IDS as readonly string[]).includes(id);
};

export const isProjectCatalogBankPartnerCriterion = (
  id: ProjectCatalogCriterionId,
): id is ProjectCatalogBankPartnerCriterionId => {
  return (PROJECT_CATALOG_BANK_PARTNER_CRITERION_IDS as readonly string[]).includes(id);
};

export const splitProjectCatalogRowsBySection = (
  rows: readonly ProjectCatalogRow[],
): {
  general: ProjectCatalogRow[];
  finance: ProjectCatalogRow[];
  bankPartner: ProjectCatalogRow[];
} => {
  const general: ProjectCatalogRow[] = [];
  const finance: ProjectCatalogRow[] = [];
  const bankPartner: ProjectCatalogRow[] = [];
  for (const row of rows) {
    if (isProjectCatalogFinanceCriterion(row.id)) {
      finance.push(row);
    } else if (isProjectCatalogBankPartnerCriterion(row.id)) {
      bankPartner.push(row);
    } else {
      general.push(row);
    }
  }
  return { general, finance, bankPartner };
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
  pushCard(rows, 'city', labels.city, details.city);
  pushCard(rows, 'address', labels.address, details.address);
  pushCard(rows, 'zipCode', labels.zipCode, details.zipCode);
  pushCard(rows, 'country', labels.country, details.country);
  pushCard(rows, 'constructionStart', labels.constructionStart, details.constructionStart);
  pushCard(rows, 'constructionEnd', labels.constructionEnd, details.constructionEnd);
  pushCard(rows, 'constructionStatus', labels.constructionStatus, details.constructionStatus);
  pushCard(rows, 'bedroomsCount', labels.bedroomsCount, details.bedroomsCount);
  pushCard(rows, 'partnerBank', labels.partnerBank, details.partnerBank);
  pushCard(rows, 'pricePerSqm', labels.pricePerSqm, pricePerSqm);
  pushCard(rows, 'areaRange', labels.areaRange, areaRange);
  pushCard(rows, 'unitPriceRange', labels.unitPriceRange, unitPrice);
  pushCard(rows, 'parkingPrice', labels.parkingPrice, details.parkingPrice);
  pushCard(rows, 'parkingAvailable', labels.parkingAvailable, details.parkingAvailable);
  pushCard(rows, 'storageAvailable', labels.storageAvailable, details.storageAvailable);
  pushCard(rows, 'elevator', labels.elevator, details.elevator);
  pushCard(rows, 'elevatorsCount', labels.elevatorsCount, details.elevatorsCount);
  pushCard(rows, 'permitNumber', labels.permitNumber, details.permitNumber);
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

  pushWide(rows, 'slogan', labels.slogan, details.slogan);
  pushWide(rows, 'greenZones', labels.greenZones, details.greenZones);
  pushWide(
    rows,
    'territorialAdvantages',
    labels.territorialAdvantages,
    details.territorialAdvantages,
  );
  pushWide(rows, 'views', labels.views, details.views);
  pushWide(rows, 'services', labels.services, details.services);
  pushCard(rows, 'paymentTypes', labels.paymentTypes, details.paymentTypes);
  pushCard(rows, 'installmentTerms', labels.installmentTerms, details.installmentTerms);
  pushCard(rows, 'mortgageTerms', labels.mortgageTerms, details.mortgageTerms);
  pushCard(
    rows,
    'specialTermsAvailable',
    labels.specialTermsAvailable,
    details.specialTermsAvailable,
  );
  pushCard(rows, 'incomeTaxRefund', labels.incomeTaxRefund, details.incomeTaxRefund);
  pushCard(rows, 'subsidizedPrograms', labels.subsidizedPrograms, details.subsidizedPrograms);
  pushWide(rows, 'specialTerms', labels.specialTerms, details.specialTerms);
  pushWide(rows, 'handoverDescription', labels.handoverDescription, details.handoverDescription);

  return rows;
};
