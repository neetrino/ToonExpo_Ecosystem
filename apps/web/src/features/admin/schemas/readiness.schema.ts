import { z } from "zod";

import {
  READINESS_CATEGORY_NAME_MAX_LENGTH,
  READINESS_DESCRIPTION_MAX_LENGTH,
  READINESS_NOTE_BODY_MAX_LENGTH,
  READINESS_RECOMMENDATION_SUMMARY_MAX_LENGTH,
  READINESS_REQUIRED_ACTION_STATUSES,
  READINESS_SCORE_MAX,
  READINESS_SCORE_MIN,
  READINESS_SCORE_STATUSES,
  READINESS_TARGET_TYPES,
  READINESS_TITLE_MAX_LENGTH,
  READINESS_VISIBILITY_OPTIONS,
} from "@/features/readiness/constants";

export const readinessCategorySchema = z.object({
  name: z.string().trim().min(1).max(READINESS_CATEGORY_NAME_MAX_LENGTH),
  description: z.string().max(READINESS_DESCRIPTION_MAX_LENGTH),
  weight: z.string(),
  sortOrder: z.number().int().min(0),
  active: z.boolean(),
});

export type ReadinessCategoryFormValues = z.infer<
  typeof readinessCategorySchema
>;

export const createReadinessAssessmentSchema = z
  .object({
    targetType: z.enum(READINESS_TARGET_TYPES),
    builderCompanyId: z.string().trim().min(1),
    projectId: z.string().trim(),
  })
  .superRefine((values, ctx) => {
    if (values.targetType === "project" && values.projectId.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["projectId"],
        message: "projectId",
      });
    }
  });

export type CreateReadinessAssessmentFormValues = z.infer<
  typeof createReadinessAssessmentSchema
>;

export const upsertReadinessScoreSchema = z.object({
  score: z
    .union([z.literal(""), z.coerce.number().int()])
    .transform((value) => (value === "" ? undefined : value))
    .refine(
      (value) =>
        value === undefined ||
        (value >= READINESS_SCORE_MIN && value <= READINESS_SCORE_MAX),
      { message: "score" },
    ),
  status: z.enum(READINESS_SCORE_STATUSES),
  recommendationSummary: z
    .string()
    .max(READINESS_RECOMMENDATION_SUMMARY_MAX_LENGTH),
});

export type UpsertReadinessScoreFormValues = z.infer<
  typeof upsertReadinessScoreSchema
>;

export const readinessRecommendationSchema = z.object({
  title: z.string().trim().min(1).max(READINESS_TITLE_MAX_LENGTH),
  description: z.string().trim().min(1).max(READINESS_DESCRIPTION_MAX_LENGTH),
  visibility: z.enum(READINESS_VISIBILITY_OPTIONS),
  sortOrder: z.coerce.number().int().min(0),
});

export type ReadinessRecommendationFormValues = z.infer<
  typeof readinessRecommendationSchema
>;

export const readinessRequiredActionSchema = z.object({
  title: z.string().trim().min(1).max(READINESS_TITLE_MAX_LENGTH),
  description: z.string().max(READINESS_DESCRIPTION_MAX_LENGTH),
  status: z.enum(READINESS_REQUIRED_ACTION_STATUSES),
  visibility: z.enum(READINESS_VISIBILITY_OPTIONS),
});

export type ReadinessRequiredActionFormValues = z.infer<
  typeof readinessRequiredActionSchema
>;

export const readinessInternalNoteSchema = z.object({
  body: z.string().trim().min(1).max(READINESS_NOTE_BODY_MAX_LENGTH),
});

export type ReadinessInternalNoteFormValues = z.infer<
  typeof readinessInternalNoteSchema
>;

export const overrideOverallScoreSchema = z.object({
  overallScore: z
    .union([z.literal(""), z.coerce.number().int(), z.null()])
    .transform((value) => (value === "" ? null : value))
    .refine(
      (value) =>
        value === null ||
        (value >= READINESS_SCORE_MIN && value <= READINESS_SCORE_MAX),
      { message: "overallScore" },
    ),
});

export type OverrideOverallScoreFormValues = z.infer<
  typeof overrideOverallScoreSchema
>;
