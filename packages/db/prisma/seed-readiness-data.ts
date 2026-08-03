/**
 * Builder Readiness KPI catalog: Product / Packaging / Team + nested criteria.
 */
import { ReadinessScoreStatus } from '../src/index.js';
import { SEED_ID_PREFIX } from './seed-data.js';

export const SEED_READINESS_CATEGORY_IDS = {
  product: `${SEED_ID_PREFIX}readiness_cat_product`,
  packaging: `${SEED_ID_PREFIX}readiness_cat_packaging`,
  team: `${SEED_ID_PREFIX}readiness_cat_team`,
} as const;

export const SEED_READINESS_COMPANY_ASSESSMENT_ID = `${SEED_ID_PREFIX}readiness_asm_glendale_company`;
export const SEED_READINESS_PROJECT_ASSESSMENT_ID = `${SEED_ID_PREFIX}readiness_asm_northern_avenue`;

export type ReadinessCategorySeed = {
  id: string;
  code: string;
  name: string;
  description: string;
  weight: number;
  sortOrder: number;
};

export type ReadinessCriterionSeed = {
  id: string;
  code: string;
  categoryId: string;
  parentCode: string | null;
  maxPoints: number | null;
  sortOrder: number;
};

export type ReadinessCriterionScoreSeed = {
  criterionCode: string;
  value: number | null;
  checked: boolean;
};

export type ReadinessScoreSeed = {
  categoryId: string;
  score: number;
  status: ReadinessScoreStatus;
  recommendationSummary: string;
};

const cid = (suffix: string): string => `${SEED_ID_PREFIX}readiness_crit_${suffix}`;

export const SEED_READINESS_CATEGORIES: ReadinessCategorySeed[] = [
  {
    id: SEED_READINESS_CATEGORY_IDS.product,
    code: 'product',
    name: 'Product',
    description: 'Pricing, offers, and payment options.',
    weight: 40,
    sortOrder: 10,
  },
  {
    id: SEED_READINESS_CATEGORY_IDS.packaging,
    code: 'packaging',
    name: 'Packaging',
    description: 'Media materials and exhibition presentation.',
    weight: 30,
    sortOrder: 20,
  },
  {
    id: SEED_READINESS_CATEGORY_IDS.team,
    code: 'team',
    name: 'Team',
    description: 'Sales, marketing, and legal readiness.',
    weight: 30,
    sortOrder: 30,
  },
];

export const SEED_READINESS_CRITERIA: ReadinessCriterionSeed[] = [
  // Product
  {
    id: cid('price_orientation'),
    code: 'price_orientation',
    categoryId: SEED_READINESS_CATEGORY_IDS.product,
    parentCode: null,
    maxPoints: 25,
    sortOrder: 10,
  },
  {
    id: cid('property_purpose'),
    code: 'property_purpose',
    categoryId: SEED_READINESS_CATEGORY_IDS.product,
    parentCode: null,
    maxPoints: 15,
    sortOrder: 20,
  },
  {
    id: cid('special_offer'),
    code: 'special_offer',
    categoryId: SEED_READINESS_CATEGORY_IDS.product,
    parentCode: null,
    maxPoints: 20,
    sortOrder: 30,
  },
  {
    id: cid('payment_methods'),
    code: 'payment_methods',
    categoryId: SEED_READINESS_CATEGORY_IDS.product,
    parentCode: null,
    maxPoints: null,
    sortOrder: 40,
  },
  {
    id: cid('prepayment'),
    code: 'prepayment',
    categoryId: SEED_READINESS_CATEGORY_IDS.product,
    parentCode: 'payment_methods',
    maxPoints: null,
    sortOrder: 41,
  },
  {
    id: cid('mortgage_option'),
    code: 'mortgage_option',
    categoryId: SEED_READINESS_CATEGORY_IDS.product,
    parentCode: 'payment_methods',
    maxPoints: 15,
    sortOrder: 42,
  },
  {
    id: cid('installment_option'),
    code: 'installment_option',
    categoryId: SEED_READINESS_CATEGORY_IDS.product,
    parentCode: 'payment_methods',
    maxPoints: 25,
    sortOrder: 43,
  },
  {
    id: cid('mortgage_return'),
    code: 'mortgage_return',
    categoryId: SEED_READINESS_CATEGORY_IDS.product,
    parentCode: null,
    maxPoints: 60,
    sortOrder: 50,
  },
  // Packaging → Media materials group
  {
    id: cid('media_materials'),
    code: 'media_materials',
    categoryId: SEED_READINESS_CATEGORY_IDS.packaging,
    parentCode: null,
    maxPoints: null,
    sortOrder: 10,
  },
  {
    id: cid('videos'),
    code: 'videos',
    categoryId: SEED_READINESS_CATEGORY_IDS.packaging,
    parentCode: 'media_materials',
    maxPoints: 20,
    sortOrder: 11,
  },
  {
    id: cid('renders'),
    code: 'renders',
    categoryId: SEED_READINESS_CATEGORY_IDS.packaging,
    parentCode: 'media_materials',
    maxPoints: 20,
    sortOrder: 12,
  },
  {
    id: cid('apartment_interactive'),
    code: 'apartment_interactive',
    categoryId: SEED_READINESS_CATEGORY_IDS.packaging,
    parentCode: 'media_materials',
    maxPoints: 20,
    sortOrder: 13,
  },
  {
    id: cid('building_interactive'),
    code: 'building_interactive',
    categoryId: SEED_READINESS_CATEGORY_IDS.packaging,
    parentCode: 'media_materials',
    maxPoints: 25,
    sortOrder: 14,
  },
  {
    id: cid('floor_plans_2d_3d'),
    code: 'floor_plans_2d_3d',
    categoryId: SEED_READINESS_CATEGORY_IDS.packaging,
    parentCode: 'media_materials',
    maxPoints: 15,
    sortOrder: 15,
  },
  {
    id: cid('digital_presence'),
    code: 'digital_presence',
    categoryId: SEED_READINESS_CATEGORY_IDS.packaging,
    parentCode: 'media_materials',
    maxPoints: 12,
    sortOrder: 16,
  },
  {
    id: cid('sales_office'),
    code: 'sales_office',
    categoryId: SEED_READINESS_CATEGORY_IDS.packaging,
    parentCode: 'media_materials',
    maxPoints: 5,
    sortOrder: 17,
  },
  {
    id: cid('scale_model'),
    code: 'scale_model',
    categoryId: SEED_READINESS_CATEGORY_IDS.packaging,
    parentCode: 'media_materials',
    maxPoints: 7,
    sortOrder: 18,
  },
  {
    id: cid('print_materials'),
    code: 'print_materials',
    categoryId: SEED_READINESS_CATEGORY_IDS.packaging,
    parentCode: 'media_materials',
    maxPoints: 3,
    sortOrder: 19,
  },
  {
    id: cid('outdoor_ads'),
    code: 'outdoor_ads',
    categoryId: SEED_READINESS_CATEGORY_IDS.packaging,
    parentCode: 'media_materials',
    maxPoints: 7,
    sortOrder: 20,
  },
  {
    id: cid('sponsorship'),
    code: 'sponsorship',
    categoryId: SEED_READINESS_CATEGORY_IDS.packaging,
    parentCode: 'media_materials',
    maxPoints: 3,
    sortOrder: 21,
  },
  {
    id: cid('tv_presence'),
    code: 'tv_presence',
    categoryId: SEED_READINESS_CATEGORY_IDS.packaging,
    parentCode: 'media_materials',
    maxPoints: 5,
    sortOrder: 22,
  },
  {
    id: cid('social_presence'),
    code: 'social_presence',
    categoryId: SEED_READINESS_CATEGORY_IDS.packaging,
    parentCode: 'media_materials',
    maxPoints: 10,
    sortOrder: 23,
  },
  {
    id: cid('booth_quality'),
    code: 'booth_quality',
    categoryId: SEED_READINESS_CATEGORY_IDS.packaging,
    parentCode: 'media_materials',
    maxPoints: 15,
    sortOrder: 24,
  },
  {
    id: cid('expo_space'),
    code: 'expo_space',
    categoryId: SEED_READINESS_CATEGORY_IDS.packaging,
    parentCode: 'media_materials',
    maxPoints: 7,
    sortOrder: 25,
  },
  // Team
  {
    id: cid('marketing_team'),
    code: 'marketing_team',
    categoryId: SEED_READINESS_CATEGORY_IDS.team,
    parentCode: null,
    maxPoints: 15,
    sortOrder: 10,
  },
  {
    id: cid('sales_team'),
    code: 'sales_team',
    categoryId: SEED_READINESS_CATEGORY_IDS.team,
    parentCode: null,
    maxPoints: 25,
    sortOrder: 20,
  },
  {
    id: cid('sales_volume'),
    code: 'sales_volume',
    categoryId: SEED_READINESS_CATEGORY_IDS.team,
    parentCode: null,
    maxPoints: 20,
    sortOrder: 30,
  },
  {
    id: cid('building_completion'),
    code: 'building_completion',
    categoryId: SEED_READINESS_CATEGORY_IDS.team,
    parentCode: null,
    maxPoints: 20,
    sortOrder: 40,
  },
  {
    id: cid('completed_projects'),
    code: 'completed_projects',
    categoryId: SEED_READINESS_CATEGORY_IDS.team,
    parentCode: null,
    maxPoints: 10,
    sortOrder: 50,
  },
  {
    id: cid('legal_readiness'),
    code: 'legal_readiness',
    categoryId: SEED_READINESS_CATEGORY_IDS.team,
    parentCode: null,
    maxPoints: 10,
    sortOrder: 60,
  },
];

/** Demo values matching Toon Admin sample (~77 / ~81 / 78 → overall ~78.6). */
export const SEED_READINESS_CRITERION_SCORES: ReadinessCriterionScoreSeed[] = [
  { criterionCode: 'price_orientation', value: 15, checked: true },
  { criterionCode: 'property_purpose', value: 10, checked: true },
  { criterionCode: 'special_offer', value: 12, checked: true },
  { criterionCode: 'payment_methods', value: null, checked: false },
  { criterionCode: 'prepayment', value: null, checked: false },
  { criterionCode: 'mortgage_option', value: 15, checked: true },
  { criterionCode: 'installment_option', value: 25, checked: true },
  // Leave unscored so Product stays ~77% (matches legacy Toon sample).
  { criterionCode: 'mortgage_return', value: null, checked: false },
  { criterionCode: 'media_materials', value: null, checked: false },
  { criterionCode: 'videos', value: 16, checked: true },
  { criterionCode: 'renders', value: 18, checked: true },
  { criterionCode: 'apartment_interactive', value: 6, checked: true },
  { criterionCode: 'building_interactive', value: 20, checked: true },
  { criterionCode: 'floor_plans_2d_3d', value: 12, checked: true },
  { criterionCode: 'digital_presence', value: 10, checked: true },
  { criterionCode: 'sales_office', value: 5, checked: true },
  { criterionCode: 'scale_model', value: 7, checked: true },
  { criterionCode: 'print_materials', value: 3, checked: true },
  { criterionCode: 'outdoor_ads', value: 7, checked: true },
  { criterionCode: 'sponsorship', value: 3, checked: true },
  { criterionCode: 'tv_presence', value: 4, checked: true },
  { criterionCode: 'social_presence', value: 8, checked: true },
  { criterionCode: 'booth_quality', value: 15, checked: true },
  { criterionCode: 'expo_space', value: 7, checked: true },
  { criterionCode: 'marketing_team', value: 12, checked: true },
  { criterionCode: 'sales_team', value: 18, checked: true },
  { criterionCode: 'sales_volume', value: 15, checked: true },
  { criterionCode: 'building_completion', value: 15, checked: true },
  { criterionCode: 'completed_projects', value: 8, checked: true },
  { criterionCode: 'legal_readiness', value: 10, checked: true },
];

export const SEED_READINESS_COMPANY_SCORES: ReadinessScoreSeed[] = [
  {
    categoryId: SEED_READINESS_CATEGORY_IDS.product,
    score: 77,
    status: ReadinessScoreStatus.in_progress,
    recommendationSummary: 'Clarify prepayment and mortgage-return options.',
  },
  {
    categoryId: SEED_READINESS_CATEGORY_IDS.packaging,
    score: 81,
    status: ReadinessScoreStatus.ready,
    recommendationSummary: 'Media pack is strong; keep booth visuals current.',
  },
  {
    categoryId: SEED_READINESS_CATEGORY_IDS.team,
    score: 78,
    status: ReadinessScoreStatus.in_progress,
    recommendationSummary: 'Strengthen sales-team coverage before the expo.',
  },
];

export const SEED_READINESS_PROJECT_SCORES: ReadinessScoreSeed[] = SEED_READINESS_COMPANY_SCORES;

export const averageReadinessScore = (scores: ReadinessScoreSeed[]): number => {
  if (scores.length === 0) {
    return 0;
  }
  const weightByCategoryId = new Map(
    SEED_READINESS_CATEGORIES.map((category) => [category.id, category.weight]),
  );
  let weightedSum = 0;
  let totalWeight = 0;
  for (const score of scores) {
    const weight = weightByCategoryId.get(score.categoryId) ?? 1;
    weightedSum += score.score * weight;
    totalWeight += weight;
  }
  return totalWeight === 0 ? 0 : Math.round(weightedSum / totalWeight);
};
