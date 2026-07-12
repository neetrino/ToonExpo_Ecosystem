import { prisma } from '@toonexpo/db';

export type PlatformContactSettings = {
  email: string | null;
  phone: string | null;
};

const CONTACT_SETTING_KEYS = ['CONTACT_EMAIL', 'CONTACT_PHONE'] as const;

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
  const rows = await prisma.platformSetting.findMany({
    where: { key: { in: [...CONTACT_SETTING_KEYS] } },
    select: { key: true, value: true },
  });

  const byKey = new Map(rows.map((row) => [row.key, row.value]));

  return {
    email: byKey.get('CONTACT_EMAIL') ?? null,
    phone: byKey.get('CONTACT_PHONE') ?? null,
  };
}
