import type { ProjectCatalogDetails } from '@/features/catalog/utils/project-catalog-details';
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
 * Admin editor sections aligned with the public Project details cards.
 */
export const PROJECT_CATALOG_EDITOR_SECTIONS = [
  {
    id: 'overview',
    keys: [
      'propertyType',
      'country',
      'city',
      'address',
      'zipCode',
      'constructionStatus',
      'bedroomsCount',
      'brandName',
      'designer',
      'contractor',
      'permitNumber',
      'constructionStart',
      'constructionEnd',
    ],
  },
  {
    id: 'details',
    keys: [
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
    ],
  },
  {
    id: 'finance',
    keys: [
      'partnerBank',
      'parkingPrice',
      'paymentTypes',
      'installmentTerms',
      'mortgageTerms',
      'specialTerms',
      'specialTermsAvailable',
      'incomeTaxRefund',
      'subsidizedPrograms',
    ],
  },
] as const;

export type ProjectCatalogEditorSectionId =
  (typeof PROJECT_CATALOG_EDITOR_SECTIONS)[number]['id'];

export const PROJECT_CATALOG_LINK_EDITOR_IDS: readonly ProjectCatalogLinkId[] =
  PROJECT_CATALOG_LINK_IDS;

/** Max length for a single catalog detail / list line. */
export const PROJECT_CATALOG_FIELD_MAX_LENGTH = 2_000;

/** Max lines for Features / Nearby lists per locale. */
export const PROJECT_CATALOG_LIST_MAX_ITEMS = 40;
