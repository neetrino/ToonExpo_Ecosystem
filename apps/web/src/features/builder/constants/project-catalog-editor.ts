import type { ProjectCatalogDetails } from '@/features/catalog/utils/project-catalog-details';
import type { ProjectCatalogCriterionId } from '@/features/catalog/utils/build-project-catalog-rows';
import type { ProjectCatalogLinkId } from '@/features/catalog/utils/project-catalog-links';
import { PROJECT_CATALOG_LINK_IDS } from '@/features/catalog/utils/project-catalog-links';

/** Long-form catalog fields — rendered as textareas in Admin. */
export const PROJECT_CATALOG_TEXTAREA_KEYS = [
  'services',
  'paymentTypes',
  'installmentTerms',
  'mortgageTerms',
  'specialTerms',
  'specialTermsAvailable',
  'incomeTaxRefund',
  'subsidizedPrograms',
  'handoverDescription',
] as const satisfies ReadonlyArray<keyof ProjectCatalogDetails>;

export type ProjectCatalogTextareaKey = (typeof PROJECT_CATALOG_TEXTAREA_KEYS)[number];

export const isProjectCatalogTextareaKey = (
  key: keyof ProjectCatalogDetails,
): key is ProjectCatalogTextareaKey =>
  (PROJECT_CATALOG_TEXTAREA_KEYS as readonly string[]).includes(key);

/**
 * Overview card on the public page (first six compact stats).
 * Kept explicit so Admin mirrors Home layout.
 */
export const PROJECT_CATALOG_OVERVIEW_KEYS = [
  'propertyType',
  'country',
  'city',
  'address',
  'constructionStatus',
  'bedroomsCount',
] as const satisfies ReadonlyArray<keyof ProjectCatalogDetails>;

/** Remaining non-finance fields → Details card. */
export const PROJECT_CATALOG_DETAILS_KEYS = [
  'zipCode',
  'brandName',
  'designer',
  'contractor',
  'permitNumber',
  'constructionStart',
  'constructionEnd',
  'parkingAvailable',
  'storageAvailable',
  'elevator',
  'elevatorsCount',
  'constructionType',
  'facadeMaterials',
  'thermalSoundInsulation',
  'seismicStandard',
  'totalLandArea',
  'totalResidentialArea',
  'buildingsCount',
  'floorsCount',
  'apartmentsCount',
  'availableApartmentsCount',
  'ceilingHeightM',
  'heating',
  'cooling',
  'hotWater',
  'gas',
  'commercialAreaSqm',
  'parkingSpaces',
  'openParkingSpaces',
  'closedParkingSpaces',
  'parkingStandardSizes',
  'schoolDistance',
  'kindergartenDistance',
  'distanceExtra',
  'economicZone',
  'finishingStatus',
  'services',
  'handoverDescription',
  'areaMinSqm',
  'areaMaxSqm',
  'pricePerSqmMin',
  'pricePerSqmMax',
  'unitPriceMin',
  'unitPriceMax',
  'managementFee',
] as const satisfies ReadonlyArray<keyof ProjectCatalogDetails>;

export const PROJECT_CATALOG_FINANCE_KEYS = [
  'partnerBank',
  'parkingPrice',
  'paymentTypes',
  'installmentTerms',
  'mortgageTerms',
  'specialTerms',
  'specialTermsAvailable',
  'incomeTaxRefund',
  'subsidizedPrograms',
] as const satisfies ReadonlyArray<keyof ProjectCatalogDetails>;

/** @deprecated Prefer OVERVIEW / DETAILS / FINANCE key lists. */
export const PROJECT_CATALOG_EDITOR_SECTIONS = [
  { id: 'overview', keys: PROJECT_CATALOG_OVERVIEW_KEYS },
  { id: 'details', keys: PROJECT_CATALOG_DETAILS_KEYS },
  { id: 'finance', keys: PROJECT_CATALOG_FINANCE_KEYS },
] as const;

export type ProjectCatalogEditorSectionId =
  (typeof PROJECT_CATALOG_EDITOR_SECTIONS)[number]['id'];

export const PROJECT_CATALOG_LINK_EDITOR_IDS: readonly ProjectCatalogLinkId[] =
  PROJECT_CATALOG_LINK_IDS;

/** Max length for a single catalog detail / list line. */
export const PROJECT_CATALOG_FIELD_MAX_LENGTH = 2_000;

/** Max lines for Features / Nearby lists per locale. */
export const PROJECT_CATALOG_LIST_MAX_ITEMS = 40;

const EXTRA_TO_CRITERION: Partial<
  Record<keyof ProjectCatalogDetails, ProjectCatalogCriterionId>
> = {
  ceilingHeightM: 'ceilingHeight',
  pricePerSqmMin: 'pricePerSqm',
  pricePerSqmMax: 'pricePerSqm',
  areaMinSqm: 'areaRange',
  areaMaxSqm: 'areaRange',
  unitPriceMin: 'unitPriceRange',
  unitPriceMax: 'unitPriceRange',
};

/**
 * Maps a detail JSON key to the public-page criterion icon id.
 */
export const catalogDetailKeyToCriterionId = (
  key: keyof ProjectCatalogDetails,
): ProjectCatalogCriterionId => {
  const mapped = EXTRA_TO_CRITERION[key];
  if (mapped) {
    return mapped;
  }
  return key as ProjectCatalogCriterionId;
};
