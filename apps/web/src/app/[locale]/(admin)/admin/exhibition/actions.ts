import { assertAdminSession } from '@/lib/admin/assert-admin-session';
import { upsertExhibitionEvent } from '@/lib/admin/exhibition-mutations';
import type { AdminMutationErrorKey, AdminMutationResult } from '@/lib/admin/mutation-result';

export type ExhibitionActionResult<T extends Record<string, unknown> = Record<string, never>> =
  AdminMutationResult<T>;

function unauthorized(): { ok: false; errorKey: AdminMutationErrorKey } {
  return { ok: false, errorKey: 'unauthorized' };
}

function revalidateExhibitionPaths(..._args: unknown[]): void {
  void _args;
}

export async function upsertExhibitionEventAction(
  locale: string,
  raw: unknown,
): Promise<ExhibitionActionResult<{ eventId: string }>> {
  const session = await assertAdminSession();
  if (!session) {
    return unauthorized();
  }

  const result = await upsertExhibitionEvent(raw, {
    userId: session.user.id,
    role: session.user.role,
  });
  if (result.ok) {
    revalidateExhibitionPaths(locale);
  }
  return result;
}
