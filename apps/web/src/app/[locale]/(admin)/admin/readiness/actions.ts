import {
  assessmentUpsertInputSchema,
  readinessCategoryUpsertInputSchema,
} from '@toonexpo/contracts';
import { assertAdminSession } from '@/lib/admin/assert-admin-session';
import type { AdminMutationErrorKey, AdminMutationResult } from '@/lib/admin/mutation-result';
import { upsertReadinessCategory } from '@/lib/admin/readiness-category-mutations';
import { upsertAssessment } from '@/lib/admin/readiness-mutations';

export type ReadinessActionResult<T extends Record<string, unknown> = Record<string, never>> =
  AdminMutationResult<T>;

function unauthorized(): { ok: false; errorKey: AdminMutationErrorKey } {
  return { ok: false, errorKey: 'unauthorized' };
}

function invalidInput(): { ok: false; errorKey: AdminMutationErrorKey } {
  return { ok: false, errorKey: 'invalidInput' };
}

function revalidateReadinessPaths(..._args: unknown[]): void {
  void _args;
}

export async function upsertAssessmentAction(
  locale: string,
  raw: unknown,
): Promise<ReadinessActionResult<{ assessmentId: string }>> {
  const session = await assertAdminSession();
  if (!session?.user?.id || !session.user.role) {
    return unauthorized();
  }

  const parsed = assessmentUpsertInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }

  const result = await upsertAssessment(parsed.data, {
    userId: session.user.id,
    role: session.user.role,
  });
  if (result.ok) {
    revalidateReadinessPaths(locale);
  }
  return result;
}

export async function upsertReadinessCategoryAction(
  locale: string,
  raw: unknown,
): Promise<ReadinessActionResult<{ categoryId: string }>> {
  const session = await assertAdminSession();
  if (!session?.user?.id) {
    return unauthorized();
  }

  const parsed = readinessCategoryUpsertInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }

  const result = await upsertReadinessCategory(parsed.data);
  if (result.ok) {
    revalidateReadinessPaths(locale);
  }
  return result;
}
