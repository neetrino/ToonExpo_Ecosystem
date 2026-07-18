import { z } from "zod";

/**
 * Optional https URL form field: empty string maps to null at the API boundary.
 */
export const optionalHttpsUrlField = z
  .string()
  .trim()
  .superRefine((value, ctx) => {
    if (value.length === 0) {
      return;
    }
    try {
      const url = new URL(value);
      if (url.protocol !== "https:") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "httpsRequired" });
      }
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "invalidUrl" });
    }
  });

export const optionalMediaIdField = z.string().trim();

export const toNullableMediaId = (value: string): string | null =>
  value.length > 0 ? value : null;

export const toOptionalMediaId = (value: string): string | undefined =>
  value.length > 0 ? value : undefined;

export const toNullableHttpsUrl = (value: string): string | null =>
  value.length > 0 ? value : null;
