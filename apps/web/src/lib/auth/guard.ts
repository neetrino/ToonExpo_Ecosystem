import { auth } from '@/auth';
import { redirect } from '@/i18n/navigation';

import { canAccessArea, type ProtectedArea } from './access';
import { LOGIN_PATH } from './constants';

const HOME_PATH = '/';

/**
 * Server-side defense-in-depth guard for protected route groups. Unauthenticated
 * users are sent to the localized login page; authenticated users lacking the
 * required role are sent to the localized home page.
 */
export async function requireAreaAccess(area: ProtectedArea, locale: string): Promise<void> {
  const session = await auth();

  if (!session?.user) {
    return redirect({ href: LOGIN_PATH, locale });
  }

  if (!canAccessArea(area, session.user.role)) {
    return redirect({ href: HOME_PATH, locale });
  }
}
