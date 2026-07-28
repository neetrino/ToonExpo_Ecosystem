'use client';

import { useTranslations } from 'next-intl';

import { ScannerWorkspace } from '@/features/builder/components/scanner-workspace';

/**
 * Mobile-first builder QR scanner with camera + manual token fallback.
 */
export const ScannerPage = () => {
  const t = useTranslations('Builder.scanner');

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-page-title text-ink">{t('title')}</h1>
        <p className="text-sm text-ink-secondary">{t('subtitle')}</p>
      </div>
      <ScannerWorkspace />
    </div>
  );
};
