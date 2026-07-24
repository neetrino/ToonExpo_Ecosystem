'use client';

import { useTranslations } from 'next-intl';

import {
  useCreatePortalPartnerOfferMutation,
  useDeletePortalPartnerOfferMutation,
  usePortalPartnerQuery,
  useUpdatePortalPartnerOfferMutation,
} from '@/features/partner/hooks/use-portal-partner';
import { PartnerOffersSection } from '@/features/partners/components/partner-offers-section';

/**
 * Partner portal offers management page.
 */
export const PartnerOffersPage = () => {
  const t = useTranslations('Partner.offers');
  const query = usePortalPartnerQuery();
  const createMutation = useCreatePortalPartnerOfferMutation();
  const updateMutation = useUpdatePortalPartnerOfferMutation();
  const deleteMutation = useDeletePortalPartnerOfferMutation();

  if (query.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (query.isError || !query.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  const busy = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-page-title text-ink">{t('pageTitle')}</h1>
        <p className="text-sm text-ink-secondary">{t('subtitle')}</p>
      </div>

      <PartnerOffersSection
        offers={query.data.offers}
        isBusy={busy}
        onCreate={async (body) => {
          await createMutation.mutateAsync(body);
        }}
        onUpdate={async (offerId, body) => {
          await updateMutation.mutateAsync({ offerId, body });
        }}
        onDelete={async (offerId) => {
          await deleteMutation.mutateAsync(offerId);
        }}
      />
    </div>
  );
};
