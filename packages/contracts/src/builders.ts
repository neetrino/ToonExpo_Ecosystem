import { z } from 'zod';

import { publicProjectSummarySchema } from './catalog';

export const publicBuilderSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  logoUrl: z.string().nullable(),
  city: z.string().nullable(),
  description: z.string().nullable(),
  publishedProjectCount: z.number().int().min(1),
});

export type PublicBuilderSummary = z.infer<typeof publicBuilderSummarySchema>;

export const publicBuilderDetailSchema = publicBuilderSummarySchema.extend({
  phone: z.string().nullable(),
  email: z.string().nullable(),
  website: z.string().nullable(),
  address: z.string().nullable(),
  projects: z.array(publicProjectSummarySchema),
});

export type PublicBuilderDetail = z.infer<typeof publicBuilderDetailSchema>;
