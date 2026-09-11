'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { isNetworkFetchError } from '@/shared/api/errors';
import { ErrorState } from '@/shared/ui/error-state';

type LocaleErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Catches uncaught RSC/client errors for locale routes.
 * Network failures (Nest down on :4000) get a dedicated recovery state.
 */
const LocaleError = ({ error, reset }: LocaleErrorProps) => {
  const t = useTranslations('Common');
  const router = useRouter();
  const network = isNetworkFetchError(error);

  const handleRetry = () => {
    reset();
    router.refresh();
  };

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <ErrorState
        title={network ? t('apiUnavailableTitle') : t('unexpectedErrorTitle')}
        description={network ? t('apiUnavailableDescription') : t('unexpectedErrorDescription')}
        retryLabel={t('retry')}
        onRetry={handleRetry}
      />
    </div>
  );
};

export default LocaleError;
