'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { ErrorState } from '@/shared/ui/error-state';

import { API_UNAVAILABLE_AUTO_RETRY_MS } from './api-unavailable-panel.constants';

/**
 * Full-page recovery when Nest is down. Auto-refreshes so a watch reboot heals.
 */
export const ApiUnavailablePanel = () => {
  const t = useTranslations('Common');
  const router = useRouter();

  useEffect(() => {
    const timerId = window.setInterval(() => {
      router.refresh();
    }, API_UNAVAILABLE_AUTO_RETRY_MS);

    return () => {
      window.clearInterval(timerId);
    };
  }, [router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <ErrorState
        title={t('apiUnavailableTitle')}
        description={t('apiUnavailableDescription')}
        retryLabel={t('retry')}
        onRetry={() => {
          router.refresh();
        }}
      />
    </div>
  );
};
