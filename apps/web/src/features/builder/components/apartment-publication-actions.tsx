'use client';

import type { PortalApartmentDetail } from '@toonexpo/contracts';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { CatalogDraftDeleteButton } from '@/features/builder/components/catalog-draft-delete-button';
import { InventoryStatusControls } from '@/features/builder/components/inventory-status-controls';
import { useIsCompanyAdmin } from '@/features/builder/hooks/use-company-profile';
import {
  useDeletePortalApartmentMutation,
  useUpdateApartmentMutation,
  useUpdateApartmentPublicationMutation,
} from '@/features/builder/hooks/use-portal-inventory';
import { toCatalogPublicationStatus } from '@/features/catalog/utils/catalog-publication-status';
import { useRouter } from '@/i18n/navigation';
import { AdminDeleteModal } from '@/shared/ui/admin-delete-modal';
import { useSuccessToast } from '@/shared/ui/use-success-toast';

type ApartmentPublicationActionsProps = {
  apartment: PortalApartmentDetail;
  listHref: string;
};

const APARTMENT_VERIFIED_SWITCH_ID = 'apartment-verified';

/**
 * Publication / verified controls, plus delete for draft apartments.
 */
export const ApartmentPublicationActions = ({
  apartment,
  listHref,
}: ApartmentPublicationActionsProps) => {
  const scope = useCatalogScope();
  const t = useTranslations('Builder.apartments');
  const tVerified = useTranslations('Builder.verified');
  const router = useRouter();
  const isCompanyAdmin = useIsCompanyAdmin();
  const canManage = scope.mode === 'admin' || isCompanyAdmin;
  const publicationMutation = useUpdateApartmentPublicationMutation(apartment.id);
  const verifiedMutation = useUpdateApartmentMutation(apartment.id);
  const deleteMutation = useDeletePortalApartmentMutation();
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { showSuccess, successToast } = useSuccessToast();
  const busy =
    publicationMutation.isPending || verifiedMutation.isPending || deleteMutation.isPending;

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

  const runDelete = (): void => {
    setError(null);
    void deleteMutation
      .mutateAsync({
        id: apartment.id,
        floorId: apartment.floorId,
        projectId: apartment.projectId,
      })
      .then(() => {
        router.push(listHref);
      })
      .catch(() => {
        setError(t('errors.generic'));
      });
  };

  if (!canManage) {
    return null;
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center justify-end gap-3">
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
        {toCatalogPublicationStatus(apartment.publicationStatus) === 'draft' ? (
          <CatalogDraftDeleteButton
            label={t('detail.delete')}
            iconOnly={scope.mode === 'admin'}
            disabled={busy}
            onClick={() => {
              setConfirmDelete(true);
            }}
          />
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      {successToast}
      <AdminDeleteModal
        open={confirmDelete}
        title={t('detail.deleteConfirmTitle')}
        message={t('detail.deleteConfirm')}
        confirmLabel={t('detail.delete')}
        confirmVariant="danger"
        icon={<Trash2 className="size-5" strokeWidth={2} />}
        iconTone="danger"
        confirming={busy}
        onCancel={() => {
          if (!busy) {
            setConfirmDelete(false);
          }
        }}
        onConfirm={runDelete}
      />
    </div>
  );
};
