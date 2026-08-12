'use client';

import type { PortalApartmentDetail } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { useIsCompanyAdmin } from '@/features/builder/hooks/use-company-profile';
import { useUpdateApartmentPublicationMutation } from '@/features/builder/hooks/use-portal-inventory';
import { Button } from '@/shared/ui/button';
import { useSuccessToast } from '@/shared/ui/use-success-toast';

type ApartmentPublicationActionsProps = {
  apartment: PortalApartmentDetail;
};

/**
 * Publish / unpublish controls so Admin inventory can appear on the public Buy page.
 */
export const ApartmentPublicationActions = ({ apartment }: ApartmentPublicationActionsProps) => {
  const scope = useCatalogScope();
  const t = useTranslations('Builder.apartments');
  const isCompanyAdmin = useIsCompanyAdmin();
  const canManage = scope.mode === 'admin' || isCompanyAdmin;
  const publicationMutation = useUpdateApartmentPublicationMutation(apartment.id);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, successToast } = useSuccessToast();

  if (!canManage) {
    return null;
  }

  const busy = publicationMutation.isPending;

  const changeStatus = async (publicationStatus: 'published' | 'draft') => {
    setError(null);
    try {
      await publicationMutation.mutateAsync({ publicationStatus });
      showSuccess(t('detail.publicationSuccess'));
    } catch {
      setError(t('errors.generic'));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-ink-secondary">
          {t(`publication.${apartment.publicationStatus}`)}
        </span>
        {apartment.publicationStatus !== 'published' ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() => {
              void changeStatus('published');
            }}
          >
            {t('detail.publish')}
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => {
              void changeStatus('draft');
            }}
          >
            {t('detail.unpublish')}
          </Button>
        )}
      </div>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      {successToast}
    </div>
  );
};
