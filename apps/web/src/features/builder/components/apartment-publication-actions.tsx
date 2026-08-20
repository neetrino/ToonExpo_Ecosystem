'use client';

import type { PortalApartmentDetail } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { InventoryStatusControls } from '@/features/builder/components/inventory-status-controls';
import { useIsCompanyAdmin } from '@/features/builder/hooks/use-company-profile';
import {
  useUpdateApartmentMutation,
  useUpdateApartmentPublicationMutation,
} from '@/features/builder/hooks/use-portal-inventory';
import { useSuccessToast } from '@/shared/ui/use-success-toast';

type ApartmentPublicationActionsProps = {
  apartment: PortalApartmentDetail;
};

const APARTMENT_VERIFIED_SWITCH_ID = 'apartment-verified';

/**
 * Publication switcher and verified toggle for catalog apartments.
 */
export const ApartmentPublicationActions = ({ apartment }: ApartmentPublicationActionsProps) => {
  const scope = useCatalogScope();
  const t = useTranslations('Builder.apartments');
  const tVerified = useTranslations('Builder.verified');
  const isCompanyAdmin = useIsCompanyAdmin();
  const canManage = scope.mode === 'admin' || isCompanyAdmin;
  const publicationMutation = useUpdateApartmentPublicationMutation(apartment.id);
  const verifiedMutation = useUpdateApartmentMutation(apartment.id);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, successToast } = useSuccessToast();
  const busy = publicationMutation.isPending || verifiedMutation.isPending;

  const changeStatus = async (publicationStatus: 'published' | 'draft') => {
    setError(null);
    try {
      await publicationMutation.mutateAsync({ publicationStatus });
      showSuccess(t('detail.publicationSuccess'));
    } catch {
      setError(t('errors.generic'));
    }
  };

  const changeVerified = async (verified: boolean) => {
    setError(null);
    try {
      await verifiedMutation.mutateAsync({ verified });
      showSuccess(tVerified('saved'));
    } catch {
      setError(t('errors.generic'));
    }
  };

  if (!canManage) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <InventoryStatusControls
        publicationStatus={apartment.publicationStatus}
        verified={apartment.verified}
        verifiedSwitchId={APARTMENT_VERIFIED_SWITCH_ID}
        busy={busy}
        onChangeStatus={(status) => {
          void changeStatus(status);
        }}
        onChangeVerified={(verified) => {
          void changeVerified(verified);
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
