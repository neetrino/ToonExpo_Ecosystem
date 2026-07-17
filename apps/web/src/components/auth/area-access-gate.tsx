'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { useSession } from '@/components/auth/session-provider';
import { canAccessArea, type ProtectedArea } from '@/lib/auth/access';
import { LOGIN_PATH } from '@/lib/auth/constants';

const HOME_PATH = '/';

type AreaAccessGateProps = {
  area: ProtectedArea;
  children: ReactNode;
};

/**
 * Client-side defense-in-depth for protected route groups.
 * Nest session cookies live on the API origin and are not visible to Next.js RSC.
 */
export function AreaAccessGate({ area, children }: AreaAccessGateProps) {
  const { status, user } = useSession();
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') {
      return;
    }
    if (status === 'unauthenticated' || !user) {
      router.replace(`/${locale}${LOGIN_PATH}`);
      return;
    }
    if (!canAccessArea(area, user.role)) {
      router.replace(`/${locale}${HOME_PATH}`);
    }
  }, [area, locale, router, status, user]);

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 text-sm text-[var(--te-muted)]" role="status">
        Loading…
      </div>
    );
  }

  if (status === 'unauthenticated' || !user || !canAccessArea(area, user.role)) {
    return null;
  }

  return children;
}
