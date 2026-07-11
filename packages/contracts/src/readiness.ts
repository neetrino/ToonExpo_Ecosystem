import { READINESS_STATUSES, READINESS_TARGET_TYPES } from '@toonexpo/domain';
import { z } from 'zod';

export const READINESS_SCORE_MIN = 0;
export const READINESS_SCORE_MAX = 100;
export const READINESS_TEXT_MAX_LENGTH = 4000;
export const READINESS_CONTACT_MAX_LENGTH = 160;
export const READINESS_CATEGORY_NAME_MAX_LENGTH = 120;

/** Docs: 03-Categories-Scoring — 0–39 → needs_improvement. */
export const READINESS_NEEDS_IMPROVEMENT_MAX_SCORE = 39;
/** Docs: 03-Categories-Scoring — 40–69 → in_progress. */
export const READINESS_IN_PROGRESS_MAX_SCORE = 69;

const emptyToUndefined = (value: unknown): unknown => {
  if (value === '' || value === null) {
    return undefined;
  }
  return value;
};

const optionalTrimmedString = (maxLength: number) =>
  z.preprocess((value) => {
    if (typeof value !== 'string') {
      return value;
    }
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }, z.string().max(maxLength).optional());

const optionalCoercedScore = z.preprocess(
  emptyToUndefined,
  z.coerce.number().int().min(READINESS_SCORE_MIN).max(READINESS_SCORE_MAX).optional(),
);

export const categoryScoreInputSchema = z.object({
  categoryId: z.string().trim().min(1),
  score: optionalCoercedScore,
  status: z.enum(READINESS_STATUSES),
  recommendation: optionalTrimmedString(READINESS_TEXT_MAX_LENGTH),
  requiredActions: optionalTrimmedString(READINESS_TEXT_MAX_LENGTH),
  internalNote: optionalTrimmedString(READINESS_TEXT_MAX_LENGTH),
});

export type CategoryScoreInput = z.infer<typeof categoryScoreInputSchema>;

export const assessmentUpsertInputSchema = z
  .object({
    assessmentId: z.string().trim().min(1).optional(),
    targetType: z.enum(READINESS_TARGET_TYPES),
    companyId: z.string().trim().min(1).optional(),
    projectId: z.string().trim().min(1).optional(),
    status: z.enum(READINESS_STATUSES),
    responsibleContact: optionalTrimmedString(READINESS_CONTACT_MAX_LENGTH),
    recommendation: optionalTrimmedString(READINESS_TEXT_MAX_LENGTH),
    requiredActions: optionalTrimmedString(READINESS_TEXT_MAX_LENGTH),
    internalNotes: optionalTrimmedString(READINESS_TEXT_MAX_LENGTH),
    categoryScores: z.array(categoryScoreInputSchema).min(1),
  })
  .superRefine((value, ctx) => {
    if (value.targetType === 'BUILDER_COMPANY') {
      if (!value.companyId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'companyIdRequired',
          path: ['companyId'],
        });
      }
      if (value.projectId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'projectIdForbidden',
          path: ['projectId'],
        });
      }
      return;
    }
    if (!value.projectId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'projectIdRequired',
        path: ['projectId'],
      });
    }
  });

export type AssessmentUpsertInput = z.infer<typeof assessmentUpsertInputSchema>;

/** Builder-facing category score — no admin-only fields. */
export const builderCategoryScoreSchema = z.object({
  categoryId: z.string(),
  categoryKey: z.string(),
  categoryName: z.string(),
  serviceCategoryKey: z.string().nullable(),
  score: z.number().int().nullable(),
  status: z.enum(READINESS_STATUSES),
  recommendation: z.string().nullable(),
  requiredActions: z.string().nullable(),
});

export type BuilderCategoryScore = z.infer<typeof builderCategoryScoreSchema>;

/** Builder-facing assessment DTO — deliberately omits internalNotes / internalNote. */
export const builderReadinessAssessmentSchema = z.object({
  id: z.string(),
  targetType: z.enum(READINESS_TARGET_TYPES),
  companyId: z.string(),
  projectId: z.string().nullable(),
  projectName: z.string().nullable(),
  status: z.enum(READINESS_STATUSES),
  overallScore: z.number().int().nullable(),
  recommendation: z.string().nullable(),
  requiredActions: z.string().nullable(),
  responsibleContact: z.string().nullable(),
  lastEvaluatedAt: z.coerce.date().nullable(),
  updatedAt: z.coerce.date(),
  categoryScores: z.array(builderCategoryScoreSchema),
});

export type BuilderReadinessAssessment = z.infer<typeof builderReadinessAssessmentSchema>;

export const adminCategoryScoreSchema = builderCategoryScoreSchema.extend({
  internalNote: z.string().nullable(),
});

export type AdminCategoryScore = z.infer<typeof adminCategoryScoreSchema>;

export const adminReadinessAssessmentSchema = builderReadinessAssessmentSchema.extend({
  internalNotes: z.string().nullable(),
  evaluatedByUserId: z.string().nullable(),
  evaluatorEmail: z.string().nullable(),
  companyName: z.string(),
  categoryScores: z.array(adminCategoryScoreSchema),
});

export type AdminReadinessAssessment = z.infer<typeof adminReadinessAssessmentSchema>;
