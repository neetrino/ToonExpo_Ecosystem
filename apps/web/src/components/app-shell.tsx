'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

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
    <div className="min-h-screen">
      <header className="flex items-center justify-between gap-4 px-6 py-4 border-b border-white/10">
        <Link href="/" className="text-lg font-semibold tracking-wide">
          {t('brand')}
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-[var(--te-muted)]">
          <Link href="/">{t('nav.public')}</Link>
          <Link href="/projects">{t('nav.projects')}</Link>
          <Link href="/builders">{t('nav.builders')}</Link>
          <Link href="/partners">{t('nav.partners')}</Link>
          {exhibitionMapEnabled ? <Link href="/exhibition">{t('nav.exhibition')}</Link> : null}
          {mortgagePageEnabled ? <Link href="/mortgage">{t('nav.mortgage')}</Link> : null}
          <Link href="/account">{t('nav.buyer')}</Link>
          {navVisibility.portal ? <Link href="/portal">{t('nav.builder')}</Link> : null}
          {navVisibility.checkin ? <Link href="/checkin">{t('nav.entrance')}</Link> : null}
          {navVisibility.admin ? <Link href="/admin">{t('nav.admin')}</Link> : null}
          <LocaleSwitcher currentLocale={locale} />
          {authSlot}
        </nav>
      </header>
      <main>{children}</main>
      <footer className="border-t border-white/10 px-6 py-4 text-sm text-[var(--te-muted)]">
        <p className="flex flex-wrap gap-x-4 gap-y-1">
          <span>
            {t('footer.contact.emailLabel')}:{' '}
            <a href={`mailto:${contactEmail}`} className="underline underline-offset-2">
              {contactEmail}
            </a>
          </span>
          <span>
            {t('footer.contact.phoneLabel')}:{' '}
            <a href={`tel:${contactPhone}`} className="underline underline-offset-2">
              {contactPhone}
            </a>
          </span>
        </p>
      </footer>
    </div>
  );
}
