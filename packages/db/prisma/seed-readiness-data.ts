/**
 * Static Builder Readiness seed payloads (categories + per-assessment scores).
 */
import { ReadinessScoreStatus } from '../src/index.js';
import { SEED_ID_PREFIX } from './seed-data.js';

export const SEED_READINESS_CATEGORY_IDS = {
  companyProfile: `${SEED_ID_PREFIX}readiness_cat_company_profile`,
  projectInformation: `${SEED_ID_PREFIX}readiness_cat_project_information`,
  mediaMaterials: `${SEED_ID_PREFIX}readiness_cat_media_materials`,
  apartmentInventory: `${SEED_ID_PREFIX}readiness_cat_apartment_inventory`,
  visualMap: `${SEED_ID_PREFIX}readiness_cat_visual_map`,
  pricingClarity: `${SEED_ID_PREFIX}readiness_cat_pricing_clarity`,
  crmReadiness: `${SEED_ID_PREFIX}readiness_cat_crm_readiness`,
  eventPresentation: `${SEED_ID_PREFIX}readiness_cat_event_presentation`,
} as const;

export const SEED_READINESS_COMPANY_ASSESSMENT_ID = `${SEED_ID_PREFIX}readiness_asm_glendale_company`;
export const SEED_READINESS_PROJECT_ASSESSMENT_ID = `${SEED_ID_PREFIX}readiness_asm_northern_avenue`;

export type ReadinessCategorySeed = {
  id: string;
  name: string;
  description: string;
  weight: number;
  sortOrder: number;
};

export type ReadinessScoreSeed = {
  categoryId: string;
  score: number;
  status: ReadinessScoreStatus;
  recommendationSummary: string;
};

export const SEED_READINESS_CATEGORIES: ReadinessCategorySeed[] = [
  {
    id: SEED_READINESS_CATEGORY_IDS.companyProfile,
    name: 'Company profile',
    description: 'Builder company profile completeness and public presentation.',
    weight: 1,
    sortOrder: 10,
  },
  {
    id: SEED_READINESS_CATEGORY_IDS.projectInformation,
    name: 'Project information',
    description: 'Project description, location, and key facts for buyers.',
    weight: 1,
    sortOrder: 20,
  },
  {
    id: SEED_READINESS_CATEGORY_IDS.mediaMaterials,
    name: 'Media materials',
    description: 'Covers, renders, galleries, and marketing visuals.',
    weight: 1,
    sortOrder: 30,
  },
  {
    id: SEED_READINESS_CATEGORY_IDS.apartmentInventory,
    name: 'Apartment inventory',
    description: 'Apartment list completeness, plans, and sales statuses.',
    weight: 1,
    sortOrder: 40,
  },
  {
    id: SEED_READINESS_CATEGORY_IDS.visualMap,
    name: 'Visual map readiness',
    description: 'Interactive floor plans and hotspot coverage.',
    weight: 1,
    sortOrder: 50,
  },
  {
    id: SEED_READINESS_CATEGORY_IDS.pricingClarity,
    name: 'Pricing / status clarity',
    description: 'Clear prices and availability for buyers.',
    weight: 1,
    sortOrder: 60,
  },
  {
    id: SEED_READINESS_CATEGORY_IDS.crmReadiness,
    name: 'CRM / request readiness',
    description: 'Ability to receive and handle buyer requests.',
    weight: 1,
    sortOrder: 70,
  },
  {
    id: SEED_READINESS_CATEGORY_IDS.eventPresentation,
    name: 'Event presentation readiness',
    description: 'Booth / exhibition materials and team readiness.',
    weight: 1,
    sortOrder: 80,
  },
];

export const SEED_READINESS_COMPANY_SCORES: ReadinessScoreSeed[] = [
  {
    categoryId: SEED_READINESS_CATEGORY_IDS.companyProfile,
    score: 85,
    status: ReadinessScoreStatus.ready,
    recommendationSummary: 'Company profile looks solid for public listing.',
  },
  {
    categoryId: SEED_READINESS_CATEGORY_IDS.projectInformation,
    score: 72,
    status: ReadinessScoreStatus.ready,
    recommendationSummary: 'Project facts are mostly complete.',
  },
  {
    categoryId: SEED_READINESS_CATEGORY_IDS.mediaMaterials,
    score: 48,
    status: ReadinessScoreStatus.needs_improvement,
    recommendationSummary: 'Add higher-quality cover and gallery renders.',
  },
  {
    categoryId: SEED_READINESS_CATEGORY_IDS.apartmentInventory,
    score: 62,
    status: ReadinessScoreStatus.in_progress,
    recommendationSummary: 'Fill missing apartment plans on upper floors.',
  },
  {
    categoryId: SEED_READINESS_CATEGORY_IDS.visualMap,
    score: 40,
    status: ReadinessScoreStatus.needs_improvement,
    recommendationSummary: 'Configure hotspots for Building A floors.',
  },
  {
    categoryId: SEED_READINESS_CATEGORY_IDS.pricingClarity,
    score: 78,
    status: ReadinessScoreStatus.ready,
    recommendationSummary: 'Pricing visibility is acceptable.',
  },
  {
    categoryId: SEED_READINESS_CATEGORY_IDS.crmReadiness,
    score: 55,
    status: ReadinessScoreStatus.in_progress,
    recommendationSummary: 'Assign a team member to handle inbound requests.',
  },
  {
    categoryId: SEED_READINESS_CATEGORY_IDS.eventPresentation,
    score: 50,
    status: ReadinessScoreStatus.in_progress,
    recommendationSummary: 'Prepare booth print materials before the event.',
  },
];

export const SEED_READINESS_PROJECT_SCORES: ReadinessScoreSeed[] = [
  {
    categoryId: SEED_READINESS_CATEGORY_IDS.companyProfile,
    score: 90,
    status: ReadinessScoreStatus.ready,
    recommendationSummary: 'Linked company profile is ready.',
  },
  {
    categoryId: SEED_READINESS_CATEGORY_IDS.projectInformation,
    score: 80,
    status: ReadinessScoreStatus.ready,
    recommendationSummary: 'Northern Avenue project page is clear.',
  },
  {
    categoryId: SEED_READINESS_CATEGORY_IDS.mediaMaterials,
    score: 70,
    status: ReadinessScoreStatus.ready,
    recommendationSummary: 'Project media set is strong enough for listing.',
  },
  {
    categoryId: SEED_READINESS_CATEGORY_IDS.apartmentInventory,
    score: 68,
    status: ReadinessScoreStatus.in_progress,
    recommendationSummary: 'Complete remaining floor plan uploads.',
  },
  {
    categoryId: SEED_READINESS_CATEGORY_IDS.visualMap,
    score: 58,
    status: ReadinessScoreStatus.in_progress,
    recommendationSummary: 'Finish hotspots on Building B.',
  },
  {
    categoryId: SEED_READINESS_CATEGORY_IDS.pricingClarity,
    score: 82,
    status: ReadinessScoreStatus.ready,
    recommendationSummary: 'Apartment prices are published.',
  },
  {
    categoryId: SEED_READINESS_CATEGORY_IDS.crmReadiness,
    score: 65,
    status: ReadinessScoreStatus.in_progress,
    recommendationSummary: 'Enable request routing for this project.',
  },
  {
    categoryId: SEED_READINESS_CATEGORY_IDS.eventPresentation,
    score: 45,
    status: ReadinessScoreStatus.needs_improvement,
    recommendationSummary: 'Add project-specific booth visuals.',
  },
];

export const averageReadinessScore = (scores: ReadinessScoreSeed[]): number =>
  Math.round(scores.reduce((sum, item) => sum + item.score, 0) / scores.length);
