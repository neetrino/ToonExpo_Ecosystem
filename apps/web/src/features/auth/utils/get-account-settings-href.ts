import type { UserResponse } from '@toonexpo/contracts';

import { isPartnerCompatibleCompany } from '@/features/partners/utils/is-partner-compatible-company';

export type AccountSettingsHref =
  '/settings' | '/admin/settings' | '/builder/settings' | '/partner/settings';

/**
 * Role-aware settings destination for signed-in users.
 */
export const getAccountSettingsHref = (user: UserResponse): AccountSettingsHref => {
  if (user.accountType === 'platform_admin') {
    return '/admin/settings';
  }

  if (user.accountType === 'company_member') {
    if (user.companyType === 'builder') {
      return '/builder/settings';
    }
    if (user.companyType && isPartnerCompatibleCompany(user.companyType)) {
      return '/partner/settings';
    }
  }

  return '/settings';
};
