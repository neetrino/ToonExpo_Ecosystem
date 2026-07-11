'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { LocaleSwitcher } from '@/components/locale-switcher';
import { Link } from '@/i18n/navigation';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
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
          <Link href="/account">{t('nav.buyer')}</Link>
          <Link href="/portal">{t('nav.builder')}</Link>
          <Link href="/admin">{t('nav.admin')}</Link>
          <LocaleSwitcher currentLocale={locale} />
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
