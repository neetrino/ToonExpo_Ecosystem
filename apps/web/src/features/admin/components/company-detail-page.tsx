'use client';

import { useTranslations } from 'next-intl';

import { EditCompanyForm } from '@/features/admin/components/edit-company-form';
import { ResendInviteButton } from '@/features/admin/components/resend-invite-button';
import { useAdminCompanyQuery } from '@/features/admin/hooks/use-admin-companies';
import { Link } from '@/i18n/navigation';
import { Card } from '@/shared/ui/card';

type CompanyDetailPageProps = {
  companyId: string;
};

/**
 * Company detail shell: load state, edit form, resend invite.
 */
export const CompanyDetailPage = ({ companyId }: CompanyDetailPageProps) => {
  const t = useTranslations('Admin.companies');
  const query = useAdminCompanyQuery(companyId);

  if (query.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (query.isError || !query.data) {
    return (
      <div className="flex flex-col gap-3">
        <p role="alert" className="text-sm text-danger">
          {t('detail.notFound')}
        </p>
        <Link href="/admin/companies" className="text-sm font-medium text-brand hover:underline">
          {t('detail.back')}
        </Link>
      </div>
    );
  }

  const company = query.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Link href="/admin/companies" className="text-sm text-ink-secondary hover:text-ink">
            {t('detail.back')}
          </Link>
          <h1 className="text-xl font-semibold text-ink">{company.name}</h1>
          <p className="text-sm text-ink-secondary">
            {t(`statuses.${company.status}`)} · {t(`types.${company.type}`)}
          </p>
        </div>
        <ResendInviteButton companyId={company.id} />
      </div>

      <Card className="max-w-xl">
        <EditCompanyForm company={company} />
      </Card>

      {company.type === 'builder' ? (
        <Card className="max-w-xl">
          <div className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-ink">{t('catalog.title')}</h2>
            <p className="text-sm text-ink-secondary">{t('catalog.description')}</p>
            <Link
              href={`/admin/companies/${company.id}/catalog/projects`}
              className="inline-flex h-9 w-fit items-center justify-center rounded-pill bg-cta-dark px-4 text-sm font-medium text-on-dark hover:bg-cta-dark/90"
            >
              {t('catalog.open')}
            </Link>
          </div>
        </Card>
      ) : null}
    </div>
  );
};
