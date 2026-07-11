'use server';

import { projectPublicationInputSchema } from '@toonexpo/contracts';
import { revalidatePath } from 'next/cache';

import { assertAdminSession } from '@/lib/admin/assert-admin-session';
import type { AdminMutationErrorKey, AdminMutationResult } from '@/lib/admin/mutation-result';
import { setProjectPublicationAsAdmin } from '@/lib/admin/project-mutations';

export type AdminProjectActionResult<T extends Record<string, unknown> = Record<string, never>> =
  AdminMutationResult<T>;

type AdminProjectActionFailure = { ok: false; errorKey: AdminMutationErrorKey };

function revalidateAdminProjectPaths(locale: string): void {
  revalidatePath(`/${locale}/admin/projects`);
  revalidatePath(`/${locale}/projects`);
}

function unauthorized(): AdminProjectActionFailure {
  return { ok: false, errorKey: 'unauthorized' };
}

function invalidInput(): AdminProjectActionFailure {
  return { ok: false, errorKey: 'invalidInput' };
}

export async function setProjectPublicationAsAdminAction(
  locale: string,
  raw: unknown,
): Promise<AdminProjectActionResult<{ projectId: string }>> {
  const session = await assertAdminSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = projectPublicationInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }

  const result = await setProjectPublicationAsAdmin(parsed.data);
  if (result.ok) {
    revalidateAdminProjectPaths(locale);
  }
  return result;
}
