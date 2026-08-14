import type { ProjectCatalogDetails } from '@/features/catalog/utils/project-catalog-details';
import type { ProjectCatalogCriterionId } from '@/features/catalog/utils/build-project-catalog-rows';
import type { ProjectCatalogLinkId } from '@/features/catalog/utils/project-catalog-links';
import {
  isProjectCatalogSocialLink,
  PROJECT_CATALOG_LINK_IDS,
} from '@/features/catalog/utils/project-catalog-links';

/** Long-form catalog fields — rendered as textareas in Admin. */
export const PROJECT_CATALOG_TEXTAREA_KEYS = [
  'slogan',
  'services',
  'paymentTypes',
  'installmentTerms',
  'mortgageTerms',
  'specialTerms',
  'specialTermsAvailable',
  'incomeTaxRefund',
  'subsidizedPrograms',
  'handoverDescription',
  'greenZones',
  'territorialAdvantages',
  'views',
] as const satisfies ReadonlyArray<keyof ProjectCatalogDetails>;

export type ProjectCatalogTextareaKey = (typeof PROJECT_CATALOG_TEXTAREA_KEYS)[number];

export const isProjectCatalogTextareaKey = (
  key: keyof ProjectCatalogDetails,
): key is ProjectCatalogTextareaKey =>
  (PROJECT_CATALOG_TEXTAREA_KEYS as readonly string[]).includes(key);

export const PROJECT_CATALOG_DATE_KEYS = [
  'constructionStart',
  'constructionEnd',
] as const satisfies ReadonlyArray<keyof ProjectCatalogDetails>;

export const isProjectCatalogDateKey = (key: keyof ProjectCatalogDetails): boolean =>
  (PROJECT_CATALOG_DATE_KEYS as readonly string[]).includes(key);

/**
 * Overview card on the public page (compact stats).
 * Kept explicit so Admin mirrors Home layout.
 */
export const PROJECT_CATALOG_OVERVIEW_KEYS = [
  'propertyType',
  'city',
  'address',
  'constructionStatus',
  'bedroomsCount',
] as const satisfies ReadonlyArray<keyof ProjectCatalogDetails>;

/** Floor so empty overview columns still keep a usable tap target. */
export const OVERVIEW_COL_MIN_WEIGHT = 6;

export const overviewColumnWeight = (value: string): number =>
  Math.max(OVERVIEW_COL_MIN_WEIGHT, value.trim().length);

export const overviewGridTemplateColumns = (weights: readonly number[]): string =>
  weights.map((weight) => `minmax(0,${weight}fr)`).join(' ');

/** Remaining non-finance fields → Details card. */
export const PROJECT_CATALOG_DETAILS_KEYS = [
  'slogan',
  'country',
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
  'greenZones',
  'territorialAdvantages',
  'views',
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

/** Non-social media / resource URLs — public “Links” card. */
export const PROJECT_CATALOG_MEDIA_LINK_EDITOR_IDS: readonly ProjectCatalogLinkId[] =
  PROJECT_CATALOG_LINK_IDS.filter((id) => !isProjectCatalogSocialLink(id));

/** Website + social profiles — public “Socials” card. */
export const PROJECT_CATALOG_SOCIAL_LINK_EDITOR_IDS: readonly ProjectCatalogLinkId[] =
  PROJECT_CATALOG_LINK_IDS.filter(isProjectCatalogSocialLink);

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
