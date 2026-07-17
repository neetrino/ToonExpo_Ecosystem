import { companyProfileUpdateInputSchema, companyUpsertInputSchema } from '@toonexpo/contracts';
import { assertAdminSession } from '@/lib/admin/assert-admin-session';
import { createCompany, updateCompany } from '@/lib/admin/company-mutations';
import type { AdminMutationErrorKey, AdminMutationResult } from '@/lib/admin/mutation-result';

export type CompanyActionResult<T extends Record<string, unknown> = Record<string, never>> =
  AdminMutationResult<T>;

type CompanyActionFailure = { ok: false; errorKey: AdminMutationErrorKey };

function revalidateCompanyPaths(..._args: unknown[]): void {
  void _args;
}

function unauthorized(): CompanyActionFailure {
  return { ok: false, errorKey: 'unauthorized' };
}

function invalidInput(): CompanyActionFailure {
  return { ok: false, errorKey: 'invalidInput' };
}

export async function createCompanyAction(
  locale: string,
  raw: unknown,
): Promise<CompanyActionResult<{ companyId: string }>> {
  const session = await assertAdminSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = companyUpsertInputSchema.safeParse(raw);
  if (!parsed.success || parsed.data.companyId) {
    return invalidInput();
  }

  const result = await createCompany(parsed.data);
  if (result.ok) {
    revalidateCompanyPaths(locale);
  }
  return result;
}

export async function updateCompanyAction(
  locale: string,
  raw: unknown,
): Promise<CompanyActionResult<{ companyId: string }>> {
  const session = await assertAdminSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = companyProfileUpdateInputSchema.safeParse(raw);
  if (!parsed.success || !parsed.data.companyId) {
    return invalidInput();
  }

  const result = await updateCompany({
    ...parsed.data,
    companyId: parsed.data.companyId,
  });
  if (result.ok) {
    revalidateCompanyPaths(locale);
  }
  return result;
}
