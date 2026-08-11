'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import {
  ReadinessManagementModal,
  type ReadinessManagementTarget,
} from '@/features/admin/components/readiness-management-modal';
import { ADMIN_COMPANIES_MAX_PAGE_SIZE } from '@/features/admin/constants';
import { useAdminBuilderCompaniesQuery } from '@/features/admin/hooks/use-admin-companies';
import { useAdminReadinessAssessmentQuery } from '@/features/admin/hooks/use-admin-readiness';
import { useRouter } from '@/i18n/navigation';

type ReadinessAssessmentDetailPageProps = {
  assessmentId: string;
};

/**
 * Legacy detail route — opens Readiness Management modal, then returns to list.
 */
export const ReadinessAssessmentDetailPage = ({
  assessmentId,
}: ReadinessAssessmentDetailPageProps) => {
  const t = useTranslations('Admin.readiness.detail');
  const router = useRouter();
  const query = useAdminReadinessAssessmentQuery(assessmentId);
  const companiesQuery = useAdminBuilderCompaniesQuery(ADMIN_COMPANIES_MAX_PAGE_SIZE);
  const [target, setTarget] = useState<ReadinessManagementTarget | null>(null);

  const companyName = useMemo(() => {
    const company = companiesQuery.data?.data.find(
      (item) => item.id === query.data?.builderCompanyId,
    );
    return company?.name ?? query.data?.builderCompanyId ?? '';
  }, [companiesQuery.data, query.data]);

  useEffect(() => {
    if (!query.data) {
      return;
    }
    setTarget({
      kind: 'assessment',
      assessmentId: query.data.id,
      subtitle: `${companyName} · ${t(`targetTypes.${query.data.targetType}`)}`,
    });
  }, [companyName, query.data, t]);

  if (query.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (query.isError || !query.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('notFound')}
      </p>
    );
  }

  return (
    <ReadinessManagementModal
      target={target}
      onClose={() => {
        setTarget(null);
        router.push('/admin/readiness');
      }}
    />
  );
};
