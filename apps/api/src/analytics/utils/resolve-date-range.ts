import { BadRequestException } from "@nestjs/common";

import { ANALYTICS_DEFAULT_RANGE_DAYS } from "../analytics.constants.js";
import type { ResolvedAnalyticsDateRange } from "../analytics.types.js";

const DAY_MS = 24 * 60 * 60 * 1000;

const parseIsoDate = (value: string, field: "from" | "to"): Date => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException(`${field} must be a valid ISO date`);
  }
  return parsed;
};

/** Resolves optional ISO date query params with a default lookback window. */
export const resolveAnalyticsDateRange = (input: {
  from?: string;
  to?: string;
}): ResolvedAnalyticsDateRange => {
  const to = input.to ? parseIsoDate(input.to, "to") : new Date();
  const from = input.from
    ? parseIsoDate(input.from, "from")
    : new Date(to.getTime() - ANALYTICS_DEFAULT_RANGE_DAYS * DAY_MS);

  if (from.getTime() > to.getTime()) {
    throw new BadRequestException("from must be before or equal to to");
  }

  return {
    from,
    to,
    fromIso: from.toISOString(),
    toIso: to.toISOString(),
  };
};

/** Prisma filter for rows created within an inclusive date range. */
export const createdAtInRange = (
  range: ResolvedAnalyticsDateRange,
): { gte: Date; lte: Date } => ({
  gte: range.from,
  lte: range.to,
});
