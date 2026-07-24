'use client';

import { useTranslations } from 'next-intl';

import { EditCompanyForm } from '@/features/admin/components/edit-company-form';
import { ResendInviteButton } from '@/features/admin/components/resend-invite-button';
import { useAdminCompanyQuery } from '@/features/admin/hooks/use-admin-companies';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';

type CompanyDetailSheetProps = {
  companyId: string | null;
  open: boolean;
  onClose: () => void;
};

/**
 * Right-side sheet with company edit form and invite resend.
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

      {company ? <EditCompanyForm key={company.id} company={company} /> : null}
    </AdminCreateSheet>
  );
};
