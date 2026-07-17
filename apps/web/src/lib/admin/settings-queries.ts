import type { PlatformSettingKey } from '@toonexpo/contracts';

import { adminApiRequest } from './admin-api';

export type PlatformSettingRow = {
  key: PlatformSettingKey;
  value: string | null;
  updatedAt: Date | null;
};

export async function loadAllPlatformSettings(): Promise<PlatformSettingRow[]> {
  return adminApiRequest<PlatformSettingRow[]>('/settings');
}
