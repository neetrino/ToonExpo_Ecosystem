'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { AppShellNav } from '@/components/app-shell-nav';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { Link } from '@/i18n/navigation';
import type { AppShellNavVisibility } from '@/lib/auth/nav-visibility';

export type { AppShellNavVisibility };

type AppShellProps = {
  children: ReactNode;
  authSlot?: ReactNode;
  navVisibility: AppShellNavVisibility;
  contactEmail: string;
  contactPhone: string;
  mortgagePageEnabled?: boolean;
  exhibitionMapEnabled?: boolean;
};

export function AppShell({
  children,
  authSlot,
  navVisibility,
  contactEmail,
  contactPhone,
  mortgagePageEnabled = true,
  exhibitionMapEnabled = false,
}: AppShellProps) {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--te-bg)] text-[var(--te-fg)]">
      <header className="sticky top-0 z-40 border-b border-[var(--te-border)] bg-[var(--te-card)]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link
            href="/"
            className="text-xl font-extrabold uppercase tracking-[0.14em] text-[var(--te-fg)]"
          >
            {t('brand')}
          </Link>
          <AppShellNav
            navVisibility={navVisibility}
            mortgagePageEnabled={mortgagePageEnabled}
            exhibitionMapEnabled={exhibitionMapEnabled}
          />
          <div className="flex items-center gap-3 text-sm font-medium text-[var(--te-fg)]">
            <LocaleSwitcher currentLocale={locale} />
            {authSlot}
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-[var(--te-border)] bg-[var(--te-bg-soft)] px-6 py-6 text-sm text-[var(--te-muted)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold uppercase tracking-[0.12em] text-[var(--te-fg)]">
            {t('brand')}
          </p>
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <span>
              {t('footer.contact.emailLabel')}:{' '}
              <a
                href={`mailto:${contactEmail}`}
                className="text-[var(--te-fg)] underline underline-offset-2"
              >
                {contactEmail}
              </a>
            </span>
            <span>
              {t('footer.contact.phoneLabel')}:{' '}
              <a
                href={`tel:${contactPhone}`}
                className="text-[var(--te-fg)] underline underline-offset-2"
              >
                {contactPhone}
              </a>
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}
