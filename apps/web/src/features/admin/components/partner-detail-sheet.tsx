'use client';

import { useTranslations } from 'next-intl';

import { AdminPartnerDetailForm } from '@/features/admin/components/admin-partner-detail-form';
import { useAdminPartnerQuery } from '@/features/admin/hooks/use-admin-partners';
import {
  FeaturedBadge,
  PartnerStatusBadge,
  PublicationStatusBadge,
} from '@/features/partners/components/partner-badges';
import { PartnerTypeLabel } from '@/features/partners/components/partner-type-label';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';

type PartnerDetailSheetProps = {
  partnerId: string | null;
  open: boolean;
  onClose: () => void;
};

/**
 * Right-side sheet with partner edit form and offers management.
 */
export const PartnerDetailSheet = ({ partnerId, open, onClose }: PartnerDetailSheetProps) => {
  const t = useTranslations('Admin.partners.detail');
  const query = useAdminPartnerQuery(partnerId ?? '');

  const partner = query.data;
  const title = partner?.name ?? t('sheetTitle');

  return (
    <AdminCreateSheet
      open={open}
      onClose={onClose}
      title={title}
      headerActions={
        partner ? (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <PartnerTypeLabel type={partner.type} className="text-sm text-ink-secondary" />
            <PartnerStatusBadge status={partner.status} />
            <PublicationStatusBadge status={partner.publicationStatus} />
            <FeaturedBadge featured={partner.featured} />
          </div>
        ) : undefined
      }
      size="default"
    >
      {!partnerId || query.isLoading ? (
        <p className="text-sm text-ink-secondary">{t('loading')}</p>
      ) : null}

      {partnerId && (query.isError || (!query.isLoading && !partner)) ? (
        <p role="alert" className="text-sm text-danger">
          {t('notFound')}
        </p>
      ) : null}

      {partner && partnerId ? (
        <AdminPartnerDetailForm key={partner.id} partnerId={partnerId} partner={partner} />
      ) : null}
    </AdminCreateSheet>
  );
};
