'use client';

import { useTranslations } from 'next-intl';

type LogoutButtonProps = {
  action: () => Promise<void>;
};

export function LogoutButton({ action }: LogoutButtonProps) {
  const t = useTranslations('auth');

  return (
    <form action={action}>
      <button
        type="submit"
        className="text-sm font-medium text-[var(--te-muted)] transition-colors hover:text-[var(--te-fg)]"
      >
        {t('logout.submit')}
      </button>
    </form>
  );
}
