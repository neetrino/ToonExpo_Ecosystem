'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { useSession } from '@/components/auth/session-provider';

type AuthRedirectIfAuthenticatedProps = {
  redirectTo: string;
  children: ReactNode;
};

/** Redirects authenticated users away from login/register. */
export function AuthRedirectIfAuthenticated({
  redirectTo,
  children,
}: AuthRedirectIfAuthenticatedProps) {
  const { status, user } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && user) {
      router.replace(redirectTo);
    }
  }, [redirectTo, router, status, user]);

  if (status === 'loading' || (status === 'authenticated' && user)) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-sm text-[var(--te-muted)]" role="status">
        Loading…
      </div>
    );
  }

  return children;
}
