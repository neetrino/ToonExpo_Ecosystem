import { apiRequest } from '@/lib/api/client';

export type CompanyMemberOption = {
  userId: string;
  name: string;
};

/** Company members for CRM assignee selects. */
export async function loadCompanyMembers(companyId: string): Promise<CompanyMemberOption[]> {
  void companyId;
  return apiRequest<CompanyMemberOption[]>('/crm/members');
}
