import type { UserResponse } from '@toonexpo/contracts';

import { isPartnerCompatibleCompany } from '@/features/partners/utils/is-partner-compatible-company';
import { sanitizeReturnUrl } from '@/features/auth/utils/sanitize-return-url';

/**
 * Default landing path after login when no safe return URL is provided.
 */
export const resolvePostLoginPath = (user: UserResponse, returnUrl?: string | null): string => {
  if (returnUrl) {
    return sanitizeReturnUrl(returnUrl);
  }

  switch (user.accountType) {
    case 'entrance_staff':
      return '/checkin';
    case 'platform_admin':
      return '/admin/companies';
    case 'company_member':
      if (user.companyType != null && isPartnerCompatibleCompany(user.companyType)) {
        return '/partner';
      }
      return '/builder';
    default:
      return '/settings';
  }
};
