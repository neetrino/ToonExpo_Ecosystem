import { projectPublicationInputSchema } from '@toonexpo/contracts';

import { assertAdminSession } from '@/lib/admin/assert-admin-session';
import type { AdminMutationErrorKey, AdminMutationResult } from '@/lib/admin/mutation-result';
import { setProjectPublicationAsAdmin } from '@/lib/admin/project-mutations';
import { resolveAdminCatalogPaths } from '@/lib/shared/resolve-catalog-paths';
import { revalidateAdminCatalogPaths } from '@/lib/shared/revalidate-catalog-paths';

export type AdminProjectActionResult<T extends Record<string, unknown> = Record<string, never>> =
  AdminMutationResult<T>;

type AdminProjectActionFailure = { ok: false; errorKey: AdminMutationErrorKey };

function unauthorized(): AdminProjectActionFailure {
  return { ok: false, errorKey: 'unauthorized' };
}

function invalidInput(): AdminProjectActionFailure {
  return { ok: false, errorKey: 'invalidInput' };
}

export async function setProjectPublicationAsAdminAction(
  _locale: string,
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

  const result = await setProjectPublicationAsAdmin(parsed.data, {
    userId: session.user.id,
    role: session.user.role,
  });
  if (result.ok) {
    const paths = await resolveAdminCatalogPaths(result.projectId);
    revalidateAdminCatalogPaths(paths ?? {});
  }
  return result;
}
