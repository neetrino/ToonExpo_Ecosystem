'use client';

import type { ReactNode } from 'react';

import { AppShell } from '@/components/app-shell';
import { AuthNav } from '@/components/auth/auth-nav';
import { useSession } from '@/components/auth/session-provider';

type AppShellWithSessionProps = {
  children: ReactNode;
  locale: string;
  contactEmail: string;
  contactPhone: string;
  mortgagePageEnabled?: boolean;
  exhibitionMapEnabled?: boolean;
};

/** App shell that derives nav + auth UI from the browser Nest session. */
export function AppShellWithSession({
  children,
  locale,
  contactEmail,
  contactPhone,
  mortgagePageEnabled = true,
  exhibitionMapEnabled = false,
}: AppShellWithSessionProps) {
  const { navVisibility } = useSession();

  return (
    <AppShell
      authSlot={<AuthNav locale={locale} />}
      navVisibility={navVisibility}
      contactEmail={contactEmail}
      contactPhone={contactPhone}
      mortgagePageEnabled={mortgagePageEnabled}
      exhibitionMapEnabled={exhibitionMapEnabled}
    >
      {children}
    </AppShell>
  );
}
