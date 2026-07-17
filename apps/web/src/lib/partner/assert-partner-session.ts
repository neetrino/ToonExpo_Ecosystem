import type { AuthSession } from '@toonexpo/contracts';
import type { PartnerType, PublicationStatus } from '@toonexpo/domain';

import { ApiClientError } from '@/lib/api';
import { apiRequest } from '@/lib/api/client';

export type PartnerSessionPartner = {
  id: string;
  companyId: string;
  name: string;
  slug: string;
  type: PartnerType;
  logoUrl: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  serviceCategories: string[];
  status: PublicationStatus;
};
export type PartnerSessionContext = {
  session: AuthSession;
  partnerId: string;
  companyId: string;
  partner: PartnerSessionPartner;
};

/** Loads the tenant-scoped partner context from Nest. */
export async function assertPartnerSession(): Promise<PartnerSessionContext | null> {
  try {
    return await apiRequest<PartnerSessionContext | null>('/partner/context');
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      return null;
    }
    throw error;
  }
}
