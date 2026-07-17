import { platformSettingUpdateInputSchema } from '@toonexpo/contracts';
import { assertAdminSession } from '@/lib/admin/assert-admin-session';
import { upsertSetting } from '@/lib/admin/settings-mutations';
import type { AdminMutationErrorKey, AdminMutationResult } from '@/lib/admin/mutation-result';

export type SettingActionResult<T extends Record<string, unknown> = Record<string, never>> =
  AdminMutationResult<T>;

type SettingActionFailure = { ok: false; errorKey: AdminMutationErrorKey };

function unauthorized(): SettingActionFailure {
  return { ok: false, errorKey: 'unauthorized' };
}

function invalidInput(): SettingActionFailure {
  return { ok: false, errorKey: 'invalidInput' };
}

function revalidateSettingPaths(..._args: unknown[]): void {
  void _args;
}

export async function upsertSettingAction(
  locale: string,
  raw: unknown,
): Promise<SettingActionResult<{ settingId: string; key: string }>> {
  const session = await assertAdminSession();
  if (!session?.user) {
    return unauthorized();
  }

  const parsed = platformSettingUpdateInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }

  const result = await upsertSetting(parsed.data, {
    userId: session.user.id,
    role: session.user.role,
  });

  if (result.ok) {
    revalidateSettingPaths(locale);
  }

  return result;
}
