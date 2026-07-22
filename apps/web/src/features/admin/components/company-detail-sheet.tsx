'use client';

import { useTranslations } from 'next-intl';

import { EditCompanyForm } from '@/features/admin/components/edit-company-form';
import { ResendInviteButton } from '@/features/admin/components/resend-invite-button';
import { useAdminCompanyQuery } from '@/features/admin/hooks/use-admin-companies';
import { Link } from '@/i18n/navigation';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { cn } from '@/shared/ui/cn';

type CompanyDetailSheetProps = {
  companyId: string | null;
  open: boolean;
  onClose: () => void;
};

/**
 * Right-side sheet with company edit form, invite resend, and catalog entry.
 */
export const CompanyDetailSheet = ({ companyId, open, onClose }: CompanyDetailSheetProps) => {
  const t = useTranslations('Admin.companies');
  const query = useAdminCompanyQuery(companyId ?? '');

  const company = query.data;
  const title = company?.name ?? t('detail.sheetTitle');

  return (
    <AdminCreateSheet
      open={open}
      onClose={onClose}
      title={title}
      description={
        company ? `${t(`statuses.${company.status}`)} · ${t(`types.${company.type}`)}` : undefined
      }
      headerActions={company ? <ResendInviteButton companyId={company.id} /> : undefined}
      size="comfortable"
    >
      {!companyId || query.isLoading ? (
        <p className="text-sm text-ink-secondary">{t('loading')}</p>
      ) : null}

      {companyId && (query.isError || (!query.isLoading && !company)) ? (
        <p role="alert" className="text-sm text-danger">
          {t('detail.notFound')}
        </p>
      ) : null}

      {company ? (
        <div className="flex flex-col gap-6">
          <EditCompanyForm key={company.id} company={company} />

          {company.type === 'builder' ? (
            <div className="flex flex-col gap-2 border-t border-border pt-5">
              <h2 className="text-base font-semibold text-ink">{t('catalog.title')}</h2>
              <p className="text-sm text-ink-secondary">{t('catalog.description')}</p>
              <Link
                href={`/admin/companies/${company.id}/catalog/projects`}
                className={cn(
                  'inline-flex h-9 w-fit items-center justify-center rounded-sm px-4 text-sm font-medium',
                  'bg-brand text-on-brand shadow-xs transition-colors hover:bg-brand-hover hover:shadow-sm',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2',
                )}
              >
                {t('catalog.open')}
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
    </AdminCreateSheet>
  );
};
