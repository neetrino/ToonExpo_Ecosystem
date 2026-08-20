'use client';

import type { PortalBuildingSummary } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { useIsCompanyAdmin } from '@/features/builder/hooks/use-company-profile';
import { useUpdateBuildingPriceOnRequestMutation } from '@/features/builder/hooks/use-portal-inventory';
import { Switch } from '@/shared/ui/switch';
import { useSuccessToast } from '@/shared/ui/use-success-toast';

type BuildingPriceOnRequestToggleProps = {
  projectId: string;
  building: PortalBuildingSummary;
};

/**
 * Builder-only status: hide public prices for this building and show a request CTA.
 */
export const BuildingPriceOnRequestToggle = ({
  projectId,
  building,
}: BuildingPriceOnRequestToggleProps) => {
  const t = useTranslations('Builder.inventory');
  const scope = useCatalogScope();
  const isCompanyAdmin = useIsCompanyAdmin();
  const mutation = useUpdateBuildingPriceOnRequestMutation(projectId, building.id);
  const { showSuccess, successToast } = useSuccessToast();

  if (scope.mode !== 'portal' || !isCompanyAdmin) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm bg-surface px-3 py-2">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{t('priceOnRequest')}</p>
        <p className="text-xs text-ink-muted">{t('priceOnRequestHint')}</p>
      </div>
      <Switch
        size="sm"
        checked={building.priceOnRequestEnabled}
        disabled={mutation.isPending}
        aria-label={t('priceOnRequest')}
        onCheckedChange={(enabled) => {
          mutation.mutate(enabled, {
            onSuccess: () => {
              showSuccess(t('priceOnRequestSaved'));
            },
          });
        }}
      />
      {successToast}
    </div>
  );
};
