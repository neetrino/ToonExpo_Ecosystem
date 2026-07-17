import type { CompanyProfileUpdateInput } from '@toonexpo/contracts';

import { apiRequest } from '@/lib/api/client';

import type { BuilderMutationResult } from './mutation-result';

export function updateCompanyProfile(
  companyId: string,
  input: CompanyProfileUpdateInput,
): Promise<BuilderMutationResult<{ companyId: string; companySlug: string }>> {
  void companyId;
  return apiRequest('/builder/company/profile', { method: 'PATCH', body: input });
}
