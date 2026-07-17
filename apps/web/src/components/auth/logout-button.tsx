'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';

import { useSession } from '@/components/auth/session-provider';
import { logoutWithApi } from '@/lib/auth/api-auth';

type LogoutButtonProps = {
  locale: string;
};

export function LogoutButton({ locale }: LogoutButtonProps) {
  const t = useTranslations('auth');
  const router = useRouter();
  const { refresh } = useSession();
  const [pending, startTransition] = useTransition();

  function onLogout(): void {
    startTransition(async () => {
      try {
        await logoutWithApi();
      } finally {
        await refresh();
        router.push(`/${locale}`);
        router.refresh();
      }
    });
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={onLogout}
      className="text-sm font-medium text-[var(--te-muted)] transition-colors hover:text-[var(--te-fg)]"
    >
      {t('logout.submit')}
    </button>
  );
}
