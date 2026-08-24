'use client';

import type { PortalBuildingSummary } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { PublicationStatusSwitcher } from '@/features/builder/components/publication-status-switcher';
import { toCatalogPublicationStatus } from '@/features/catalog/utils/catalog-publication-status';
import { useIsCompanyAdmin } from '@/features/builder/hooks/use-company-profile';
import { useUpdateBuildingPublicationMutation } from '@/features/builder/hooks/use-portal-inventory';
import { useSuccessToast } from '@/shared/ui/use-success-toast';

type BuildingPublicationActionsProps = {
  projectId: string;
  building: PortalBuildingSummary;
};

/**
 * Draft / Published switcher for a building in project inventory.
 */
export const BuildingPublicationActions = ({
  projectId,
  building,
}: BuildingPublicationActionsProps) => {
  const scope = useCatalogScope();
  const t = useTranslations('Builder.inventory');
  const isCompanyAdmin = useIsCompanyAdmin();
  const canManage = scope.mode === 'admin' || isCompanyAdmin;
  const mutation = useUpdateBuildingPublicationMutation(projectId, building.id);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, successToast } = useSuccessToast();

  const changeStatus = async (publicationStatus: 'published' | 'draft') => {
    setError(null);
    try {
      await mutation.mutateAsync({ publicationStatus });
      showSuccess(t('publicationSuccess'));
    } catch {
      setError(t('errors.generic'));
    }
  };

  if (!canManage) {
    return (
      <span className="text-xs text-ink-muted">
        {t(`publication.${toCatalogPublicationStatus(building.publicationStatus)}`)}
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <PublicationStatusSwitcher
        value={building.publicationStatus}
        disabled={mutation.isPending}
        onChange={(status) => {
          void changeStatus(status);
        }}
      />
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      {successToast}
    </div>
  );
};
