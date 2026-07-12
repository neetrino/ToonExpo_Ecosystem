'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import type { AppShellNavVisibility } from '@/lib/auth/nav-visibility';

type AppShellNavProps = {
  navVisibility: AppShellNavVisibility;
  mortgagePageEnabled: boolean;
  exhibitionMapEnabled: boolean;
};

export function AppShellNav({
  navVisibility,
  mortgagePageEnabled,
  exhibitionMapEnabled,
}: AppShellNavProps) {
  const t = useTranslations();

  return (
    <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-[var(--te-muted)]">
      <Link className="transition-colors hover:text-[var(--te-fg)]" href="/projects">
        {t('nav.projects')}
      </Link>
      <Link className="transition-colors hover:text-[var(--te-fg)]" href="/builders">
        {t('nav.builders')}
      </Link>
      <Link className="transition-colors hover:text-[var(--te-fg)]" href="/partners">
        {t('nav.partners')}
      </Link>
      {exhibitionMapEnabled ? (
        <Link className="transition-colors hover:text-[var(--te-fg)]" href="/exhibition">
          {t('nav.exhibition')}
        </Link>
      ) : null}
      {mortgagePageEnabled ? (
        <Link className="transition-colors hover:text-[var(--te-fg)]" href="/mortgage">
          {t('nav.mortgage')}
        </Link>
      ) : null}
      <Link className="transition-colors hover:text-[var(--te-fg)]" href="/account">
        {t('nav.buyer')}
      </Link>
      {navVisibility.portal ? (
        <Link className="transition-colors hover:text-[var(--te-accent)]" href="/portal">
          {t('nav.builder')}
        </Link>
      ) : null}
      {navVisibility.checkin ? (
        <Link className="transition-colors hover:text-[var(--te-fg)]" href="/checkin">
          {t('nav.entrance')}
        </Link>
      ) : null}
      {navVisibility.admin ? (
        <Link className="transition-colors hover:text-[var(--te-accent)]" href="/admin">
          {t('nav.admin')}
        </Link>
      ) : null}
    </nav>
  );
}
