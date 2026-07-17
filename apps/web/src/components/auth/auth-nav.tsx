'use client';

import { useTranslations } from 'next-intl';

import { LogoutButton } from '@/components/auth/logout-button';
import { useSession } from '@/components/auth/session-provider';
import { Link } from '@/i18n/navigation';

type AuthNavProps = {
  locale: string;
};

export function AuthNav({ locale }: AuthNavProps) {
  const { status, user } = useSession();
  const t = useTranslations('auth');

  if (status === 'loading') {
    return <span className="text-sm text-[var(--te-muted)]" aria-hidden="true" />;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-[var(--te-radius)] bg-[var(--te-accent)] px-3 py-1.5 text-sm font-semibold text-white"
      >
        {t('signInNav')}
      </Link>
    );
  }

  return <LogoutButton locale={locale} />;
}
