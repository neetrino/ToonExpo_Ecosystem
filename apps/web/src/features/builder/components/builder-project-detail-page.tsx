'use client';

import { ProjectDetailPage } from '@/features/builder/components/project-detail-page';
import { useCompanyProfileQuery } from '@/features/builder/hooks/use-company-profile';
import { resolvePublicAssetUrl } from '@/shared/lib/static-asset-url';

type BuilderProjectDetailPageProps = {
  projectSlug: string;
};

/**
 * Builder project detail: company logo before the title (same as admin).
 */
export const BuilderProjectDetailPage = ({ projectSlug }: BuilderProjectDetailPageProps) => {
  const companyQuery = useCompanyProfileQuery();
  const company = companyQuery.data;

  return (
    <ProjectDetailPage
      projectId={projectSlug}
      titleLogo={
        company
          ? { name: company.name, logoUrl: resolvePublicAssetUrl(company.logoUrl) }
          : undefined
      }
    />
  );
};
