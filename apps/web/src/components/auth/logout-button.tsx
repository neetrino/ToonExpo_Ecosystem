'use client';

import { useTranslations } from 'next-intl';

type LogoutButtonProps = {
  action: () => Promise<void>;
};

export function LogoutButton({ action }: LogoutButtonProps) {
  const t = useTranslations('auth');

  return (
    <form action={action}>
      <button type="submit" className="text-[var(--te-muted)] hover:text-white">
        {t('logout.submit')}
      </button>
    </form>
  );
}
