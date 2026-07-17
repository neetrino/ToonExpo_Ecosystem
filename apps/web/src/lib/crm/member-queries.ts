import { serverApiRequest } from '@/lib/api/server';

export type CompanyMemberOption = {
  userId: string;
  name: string;
};

/** Company members for CRM assignee selects. */
export async function loadCompanyMembers(companyId: string): Promise<CompanyMemberOption[]> {
  void companyId;
  return serverApiRequest<CompanyMemberOption[]>('/crm/members');
}
