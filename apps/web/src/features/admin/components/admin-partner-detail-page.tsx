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
import { Link } from '@/i18n/navigation';

type AdminPartnerDetailPageProps = {
  partnerId: string;
};

/**
 * Admin partner detail page shell: load state + shared edit form.
 */
export const AdminPartnerDetailPage = ({ partnerId }: AdminPartnerDetailPageProps) => {
  const t = useTranslations('Admin.partners.detail');
  const query = useAdminPartnerQuery(partnerId);

  if (query.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (query.isError || !query.data) {
    return (
      <div className="flex flex-col gap-3">
        <p role="alert" className="text-sm text-danger">
          {t('notFound')}
        </p>
        <Link href="/admin/partners" className="text-sm font-medium text-brand hover:underline">
          {t('back')}
        </Link>
      </div>
    );
  }

  const partner = query.data;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Link href="/admin/partners" className="text-sm text-ink-secondary hover:text-ink">
          {t('back')}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-page-title text-ink">{partner.name}</h1>
          <PartnerTypeLabel type={partner.type} className="text-sm text-ink-secondary" />
          <PartnerStatusBadge status={partner.status} />
          <PublicationStatusBadge status={partner.publicationStatus} />
          <FeaturedBadge featured={partner.featured} />
        </div>
      </div>

      <AdminPartnerDetailForm key={partner.id} partnerId={partnerId} partner={partner} />
    </div>
  );
};
