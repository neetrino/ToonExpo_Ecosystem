import type { CompanyProfileUpdateInput } from '@toonexpo/contracts';

import { serverApiRequest } from '@/lib/api/server';

import type { BuilderMutationResult } from './mutation-result';

export function updateCompanyProfile(
  companyId: string,
  input: CompanyProfileUpdateInput,
): Promise<BuilderMutationResult<{ companyId: string; companySlug: string }>> {
  void companyId;
  return serverApiRequest('/builder/company/profile', { method: 'PATCH', body: input });
}
