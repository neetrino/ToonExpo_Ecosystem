'use client';

import { useAdminCompanyQuery } from '@/features/admin/hooks/use-admin-companies';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { ProjectDetailPage } from '@/features/builder/components/project-detail-page';
import { resolvePublicAssetUrl } from '@/shared/lib/static-asset-url';

type AdminProjectDetailPageProps = {
  projectId: string;
};

/**
 * Admin project detail: company logo before the title, inventory stays on Buildings.
 */
export const AdminProjectDetailPage = ({ projectId }: AdminProjectDetailPageProps) => {
  const scope = useCatalogScope();
  const companyId = scope.mode === 'admin' ? scope.companyId : '';
  const companyQuery = useAdminCompanyQuery(companyId);
  const company = companyQuery.data;

  return (
    <ProjectDetailPage
      projectId={projectId}
      showInventory={false}
      titleLogo={
        company
          ? { name: company.name, logoUrl: resolvePublicAssetUrl(company.logoUrl) }
          : undefined
      }
    />
  );
};
