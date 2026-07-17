import { z } from 'zod';

import { apiRequest } from '@/lib/api';

export type PlatformContactSettings = {
  email: string | null;
  phone: string | null;
};

const publicPlatformSettingsSchema = z.object({
  contact: z.object({
    email: z.string().nullable(),
    phone: z.string().nullable(),
  }),
  mortgagePageEnabled: z.boolean(),
});

async function loadPublicPlatformSettings() {
  const raw = await apiRequest<unknown>('/catalog/platform-settings');
  return publicPlatformSettingsSchema.parse(raw);
}

export function resolveContactWithDefaults(
  settings: PlatformContactSettings,
  defaults: { email: string; phone: string },
): { email: string; phone: string } {
  return {
    email: settings.email ?? defaults.email,
    phone: settings.phone ?? defaults.phone,
  };
}

export async function loadPlatformContactSettings(): Promise<PlatformContactSettings> {
  try {
    return (await loadPublicPlatformSettings()).contact;
  } catch {
    return { email: null, phone: null };
  }
}

/** Default/unset MORTGAGE_PAGE_ENABLED is treated as enabled. */
export async function isMortgagePageEnabled(): Promise<boolean> {
  try {
    return (await loadPublicPlatformSettings()).mortgagePageEnabled;
  } catch {
    return true;
  }
}
