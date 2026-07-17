import { getTranslations } from 'next-intl/server';

import { auth } from '@/auth';
import { LogoutButton } from '@/components/auth/logout-button';
import { Link } from '@/i18n/navigation';

type AuthNavProps = {
  locale: string;
};

export async function AuthNav({ locale }: AuthNavProps) {
  const session = await auth();
  const t = await getTranslations('auth');

  if (!session?.user) {
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
