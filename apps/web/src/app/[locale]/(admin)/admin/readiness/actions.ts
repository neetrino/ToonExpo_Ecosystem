'use server';

import { assessmentUpsertInputSchema } from '@toonexpo/contracts';
import { revalidatePath } from 'next/cache';

import { assertAdminSession } from '@/lib/admin/assert-admin-session';
import type { AdminMutationErrorKey, AdminMutationResult } from '@/lib/admin/mutation-result';
import { upsertAssessment } from '@/lib/admin/readiness-mutations';

export type ReadinessActionResult<T extends Record<string, unknown> = Record<string, never>> =
  AdminMutationResult<T>;

function unauthorized(): { ok: false; errorKey: AdminMutationErrorKey } {
  return { ok: false, errorKey: 'unauthorized' };
}

function invalidInput(): { ok: false; errorKey: AdminMutationErrorKey } {
  return { ok: false, errorKey: 'invalidInput' };
}

function revalidateReadinessPaths(locale: string): void {
  revalidatePath(`/${locale}/admin/readiness`);
  revalidatePath(`/${locale}/portal/readiness`);
}

export async function upsertAssessmentAction(
  locale: string,
  raw: unknown,
): Promise<ReadinessActionResult<{ assessmentId: string }>> {
  const session = await assertAdminSession();
  if (!session?.user?.id) {
    return unauthorized();
  }

  const parsed = assessmentUpsertInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }

  const result = await upsertAssessment(parsed.data, session.user.id);
  if (result.ok) {
    revalidateReadinessPaths(locale);
  }
  return result;
}
