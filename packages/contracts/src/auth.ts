import { PLATFORM_ROLES } from '@toonexpo/domain';
import { z } from 'zod';

export const platformRoleSchema = z.enum(PLATFORM_ROLES);

export const buyerRegisterSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(5).max(32),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
});

export type BuyerRegisterInput = z.infer<typeof buyerRegisterSchema>;
