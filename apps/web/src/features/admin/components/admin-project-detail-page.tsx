'use client';

import { useAdminCompanyQuery } from '@/features/admin/hooks/use-admin-companies';
import { useAdminProjectRoute } from '@/features/admin/context/admin-project-route-context';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { ProjectDetailPage } from '@/features/builder/components/project-detail-page';
import { resolvePublicAssetUrl } from '@/shared/lib/static-asset-url';

/**
 * Admin project detail: company logo before the title, inventory stays on Buildings.
 */
export const AdminProjectDetailPage = () => {
  const { projectId } = useAdminProjectRoute();
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
