'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/shared/ui/button';

type GeoMapStatusOverlaysProps = {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  onRetry: () => void;
};

export const GeoMapStatusOverlays = ({
  isLoading,
  isError,
  isEmpty,
  onRetry,
}: GeoMapStatusOverlaysProps) => {
  const t = useTranslations('GeoMap');

  return (
    <>
      {isLoading ? (
        <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
          <p className="rounded-pill bg-surface-elevated/95 px-4 py-2 text-sm text-ink-secondary shadow-md ring-1 ring-header-border">
            {t('loading')}
          </p>
        </div>
      ) : null}

      {isError ? (
        <div className="absolute inset-x-4 top-4 flex flex-col items-center gap-2 sm:inset-x-auto sm:left-1/2 sm:w-[min(24rem,calc(100%-2rem))] sm:-translate-x-1/2">
          <p
            role="alert"
            className="w-full rounded-[20px] bg-surface-elevated px-4 py-3 text-center text-sm text-danger shadow-md ring-1 ring-header-border"
          >
            {t('error')}
          </p>
          <Button type="button" size="sm" variant="secondary" onClick={onRetry}>
            {t('retry')}
          </Button>
        </div>
      ) : null}

      {isEmpty ? (
        <div className="pointer-events-none absolute inset-x-4 bottom-6 flex justify-center sm:inset-x-auto sm:left-1/2 sm:w-[min(28rem,calc(100%-2rem))] sm:-translate-x-1/2">
          <p className="rounded-[20px] bg-surface-elevated/95 px-5 py-4 text-center text-sm text-header-muted shadow-md ring-1 ring-header-border">
            {t('empty')}
          </p>
        </div>
      ) : null}
    </>
  );
};
