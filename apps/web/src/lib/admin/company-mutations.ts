import type { CompanyProfileUpdateInput, CompanyUpsertInput } from '@toonexpo/contracts';

import { adminApiRequest } from './admin-api';
import type { AdminMutationResult } from './mutation-result';

export function createCompany(
  input: CompanyUpsertInput,
): Promise<AdminMutationResult<{ companyId: string }>> {
  return adminApiRequest('/commands/create-company', { method: 'POST', body: input });
}

export function updateCompany(
  input: CompanyProfileUpdateInput & { companyId: string },
): Promise<AdminMutationResult<{ companyId: string }>> {
  return adminApiRequest('/commands/update-company', { method: 'POST', body: input });
}
