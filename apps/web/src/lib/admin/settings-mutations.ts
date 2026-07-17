import type { PlatformSettingUpdateInput } from '@toonexpo/contracts';

import type { AuditActor } from '@/lib/audit/record-audit';

import { adminApiRequest } from './admin-api';
import type { AdminMutationResult } from './mutation-result';

export function upsertSetting(
  input: PlatformSettingUpdateInput,
  _actor: AuditActor,
): Promise<AdminMutationResult<{ settingId: string; key: PlatformSettingUpdateInput['key'] }>> {
  return adminApiRequest('/commands/upsert-setting', { method: 'POST', body: input });
}
