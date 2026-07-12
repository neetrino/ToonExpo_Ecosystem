import {
  platformSettingUpdateInputSchema,
  type PlatformSettingUpdateInput,
} from '@toonexpo/contracts';
import { prisma } from '@toonexpo/db';

import { type AuditActor, recordAudit } from '@/lib/audit/record-audit';

import { type AdminMutationResult } from './mutation-result';

function formatSettingTransition(key: string, from: string | null, to: string): string {
  return `${key}: ${from ?? 'null'}→${to}`;
}

export async function upsertSetting(
  input: PlatformSettingUpdateInput,
  actor: AuditActor,
): Promise<AdminMutationResult<{ settingId: string; key: PlatformSettingUpdateInput['key'] }>> {
  const parsed = platformSettingUpdateInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errorKey: 'invalidInput' };
  }

  const { key, value } = parsed.data;

  return prisma.$transaction(async (tx) => {
    const existing = await tx.platformSetting.findUnique({
      where: { key },
      select: { id: true, value: true },
    });

    const setting = existing
      ? await tx.platformSetting.update({
          where: { key },
          data: { value, updatedByUserId: actor.userId },
          select: { id: true },
        })
      : await tx.platformSetting.create({
          data: { key, value, updatedByUserId: actor.userId },
          select: { id: true },
        });

    await recordAudit(tx, {
      actor,
      action: 'SETTINGS_UPDATE',
      entityType: 'PLATFORM_SETTING',
      entityId: setting.id,
      detail: formatSettingTransition(key, existing?.value ?? null, value),
    });

    return { ok: true, settingId: setting.id, key };
  });
}
