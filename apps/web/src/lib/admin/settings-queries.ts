import { PLATFORM_SETTING_KEYS, type PlatformSettingKey } from '@toonexpo/contracts';
import { prisma } from '@toonexpo/db';

export type PlatformSettingRow = {
  key: PlatformSettingKey;
  value: string | null;
  updatedAt: Date | null;
};

export async function loadAllPlatformSettings(): Promise<PlatformSettingRow[]> {
  const rows = await prisma.platformSetting.findMany({
    select: { key: true, value: true, updatedAt: true },
  });

  const byKey = new Map(rows.map((row) => [row.key, row]));

  return PLATFORM_SETTING_KEYS.map((key) => {
    const row = byKey.get(key);
    return {
      key,
      value: row?.value ?? null,
      updatedAt: row?.updatedAt ?? null,
    };
  });
}
