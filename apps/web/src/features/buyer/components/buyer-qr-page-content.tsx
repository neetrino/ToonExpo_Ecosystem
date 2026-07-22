'use client';

import { useTranslations } from 'next-intl';

import { BuyerQrCode } from '@/features/buyer/components/buyer-qr-code';
import { ScanHistoryList } from '@/features/buyer/components/scan-history-list';
import { useBuyerQrQuery, useBuyerQrScansQuery } from '@/features/buyer/hooks/use-buyer';
import { Skeleton } from '@/shared/ui/skeleton';

type BuyerQrPageContentProps = {
  buyerName: string;
};

/**
 * Client shell for My QR: code + scan history.
 */
export const BuyerQrPageContent = ({ buyerName }: BuyerQrPageContentProps) => {
  const t = useTranslations('Profile.qr');
  const qrQuery = useBuyerQrQuery();
  const scansQuery = useBuyerQrScansQuery();

  if (qrQuery.isLoading) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
        <Skeleton className="mx-auto h-80 w-full max-w-md" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (qrQuery.isError || !qrQuery.data) {
    return (
      <p
        role="alert"
        className="rounded-md border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger"
      >
        {t('error')}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <BuyerQrCode payloadUrl={qrQuery.data.payloadUrl} buyerName={buyerName} />
      <section className="flex flex-col gap-4" aria-labelledby="scan-history-heading">
        <h2 id="scan-history-heading" className="text-lg font-semibold text-ink">
          {t('scans.title')}
        </h2>
        {scansQuery.isLoading ? (
          <div className="flex flex-col gap-3" aria-busy="true">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : scansQuery.isError ? (
          <p role="alert" className="text-sm text-danger">
            {t('scans.error')}
          </p>
        ) : (
          <ScanHistoryList items={scansQuery.data?.data ?? []} />
        )}
      </section>
    </div>
  );
};
