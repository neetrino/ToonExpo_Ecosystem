import { z } from 'zod';

import { assertAdminSession } from '@/lib/admin/assert-admin-session';
import { getApiErrorKey } from '@/lib/api/errors';
import { apiRequest } from '@/lib/api/client';
import { getSession } from '@/lib/auth/get-session';

const companyIdSchema = z.string().trim().min(1).max(64);

export type ActiveCompanyActionResult =
  | { ok: true; redirectTo: string }
  | { ok: false; errorKey: 'unauthorized' | 'invalidInput' | 'notFound' };

export async function startActingOnBehalfAction(
  locale: string,
  companyIdRaw: unknown,
): Promise<ActiveCompanyActionResult> {
  const session = await assertAdminSession();
  if (!session?.user) return failure('unauthorized');
  const companyId = parseCompanyId(companyIdRaw);
  if (!companyId) return failure('invalidInput');
  const result = await selectCompany(companyId, true);
  if (!result.ok) return result;
  return { ok: true, redirectTo: `/${locale}/portal` };
}

export async function stopActingOnBehalfAction(locale: string): Promise<ActiveCompanyActionResult> {
  const session = await assertAdminSession();
  if (!session?.user) return failure('unauthorized');
  await apiRequest('/builder/company/stop-acting', { method: 'POST' });
  return { ok: true, redirectTo: `/${locale}/admin/companies` };
}

export async function switchActiveCompanyAction(
  locale: string,
  companyIdRaw: unknown,
): Promise<ActiveCompanyActionResult> {
  const session = await getSession();
  if (!session?.user) return failure('unauthorized');
  const companyId = parseCompanyId(companyIdRaw);
  if (!companyId) return failure('invalidInput');
  const result = await selectCompany(companyId, false);
  if (!result.ok) return result;
  return { ok: true, redirectTo: `/${locale}/portal` };
}

async function selectCompany(
  companyId: string,
  auditStart: boolean,
): Promise<ActiveCompanyActionResult | { ok: true }> {
  try {
    await apiRequest('/builder/company/select', {
      method: 'POST',
      body: { companyId, auditStart },
    });
    return { ok: true };
  } catch (error) {
    const key = getApiErrorKey(error);
    return failure(key === 'notFound' ? 'notFound' : 'unauthorized');
  }
}

function parseCompanyId(raw: unknown): string | null {
  const parsed = companyIdSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

function failure(errorKey: 'unauthorized' | 'invalidInput' | 'notFound') {
  return { ok: false as const, errorKey };
}
