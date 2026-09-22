'use client';

import type { PortalProjectDetail } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { useIsCompanyAdmin } from '@/features/builder/hooks/use-company-profile';
import { useUpdateProjectPriceOnRequestMutation } from '@/features/builder/hooks/use-portal-projects';
import { Switch } from '@/shared/ui/switch';
import { useSuccessToast } from '@/shared/ui/use-success-toast';

type ProjectPriceOnRequestToggleProps = {
  project: PortalProjectDetail;
};

const PRICE_ON_REQUEST_SWITCH_ID = 'project-price-on-request';

/**
 * Project-wide price-on-request: hides all apartment prices and cascades to buildings.
 * Same visibility as Draft/Published/Verified (admin catalog or builder company_admin).
 */
export const ProjectPriceOnRequestToggle = ({ project }: ProjectPriceOnRequestToggleProps) => {
  const t = useTranslations('Builder.projects.priceOnRequest');
  const scope = useCatalogScope();
  const isCompanyAdmin = useIsCompanyAdmin();
  const mutation = useUpdateProjectPriceOnRequestMutation(project.id);
  const { showSuccess, successToast } = useSuccessToast();
  const canManage = scope.mode === 'admin' || isCompanyAdmin;

  if (!canManage) {
    return null;
  }

  return (
    <label
      htmlFor={PRICE_ON_REQUEST_SWITCH_ID}
      className="flex items-center gap-2 text-sm text-ink"
    >
      <span>{t('label')}</span>
      <Switch
        id={PRICE_ON_REQUEST_SWITCH_ID}
        size="sm"
        checked={project.priceOnRequestEnabled}
        disabled={mutation.isPending}
        aria-label={t('label')}
        onCheckedChange={(enabled) => {
          mutation.mutate(enabled, {
            onSuccess: () => {
              showSuccess(t('saved'));
            },
          });
        }}
      />
      {successToast}
    </label>
  );
};
