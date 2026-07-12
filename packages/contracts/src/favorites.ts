import { FAVORITE_TARGET_TYPES, PRICE_DISPLAY_MODES, APARTMENT_STATUSES } from '@toonexpo/domain';
import { z } from 'zod';

/** Prisma cuid-ish ids used for project/apartment target lookups. */
const TARGET_ID_PATTERN = /^c[a-z0-9]{20,32}$/i;

export const favoriteTargetTypeSchema = z.enum(FAVORITE_TARGET_TYPES);

export const favoriteTargetIdSchema = z.string().regex(TARGET_ID_PATTERN);

/** Add or remove a buyer favorite (project or apartment). */
export const favoriteToggleInputSchema = z.object({
  targetType: favoriteTargetTypeSchema,
  targetId: favoriteTargetIdSchema,
});

export type FavoriteToggleInput = z.infer<typeof favoriteToggleInputSchema>;

/** Account-area list row for a saved project or apartment. */
export const favoriteListItemSchema = z.object({
  id: z.string().min(1),
  targetType: favoriteTargetTypeSchema,
  targetId: z.string().min(1),
  createdAt: z.coerce.date(),
  title: z.string().min(1),
  companyName: z.string().min(1),
  companySlug: z.string().min(1),
  projectName: z.string().min(1),
  projectSlug: z.string().min(1),
  apartmentStatus: z.enum(APARTMENT_STATUSES).nullable(),
  priceDisplay: z.enum(PRICE_DISPLAY_MODES).nullable(),
  priceAmd: z.number().int().nonnegative().nullable(),
});

export type FavoriteListItem = z.infer<typeof favoriteListItemSchema>;
