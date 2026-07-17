import { serverApiRequest } from '@/lib/api/server';

export type PortalCompanyOption = {
  id: string;
  name: string;
};

/** Companies a builder may switch into (memberships, earliest first). */
export async function loadBuilderCompanyOptions(userId: string): Promise<PortalCompanyOption[]> {
  void userId;
  return serverApiRequest<PortalCompanyOption[]>('/builder/company/options');
}

/** All companies for admin portal switcher (name ascending). */
export async function loadAdminCompanyOptions(): Promise<PortalCompanyOption[]> {
  return serverApiRequest<PortalCompanyOption[]>('/builder/company/options');
}
