import type { PlatformRole } from '@toonexpo/domain';

import type { ProtectedArea } from '@/lib/auth/access';
import { canAccessArea } from '@/lib/auth/access';

export type AppShellNavVisibility = {
  portal: boolean;
  admin: boolean;
  checkin: boolean;
  partner: boolean;
};

/** Computes which protected nav links the current role may see. */
export function buildAppShellNavVisibility(role: PlatformRole | undefined): AppShellNavVisibility {
  if (!role) {
    return { portal: false, admin: false, checkin: false, partner: false };
  }

  const area = (name: Exclude<ProtectedArea, 'buyer'>) => canAccessArea(name, role);

  return {
    portal: area('builder'),
    admin: area('admin'),
    checkin: area('entrance'),
    partner: area('partner'),
  };
}
