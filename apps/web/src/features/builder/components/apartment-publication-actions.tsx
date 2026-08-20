'use client';

import type { PortalApartmentDetail } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { useIsCompanyAdmin } from '@/features/builder/hooks/use-company-profile';
import {
  useUpdateApartmentMutation,
  useUpdateApartmentPublicationMutation,
} from '@/features/builder/hooks/use-portal-inventory';
import { Button } from '@/shared/ui/button';
import { Switch } from '@/shared/ui/switch';
import { useSuccessToast } from '@/shared/ui/use-success-toast';

type ApartmentPublicationActionsProps = {
  apartment: PortalApartmentDetail;
};

type PublicationToolbarProps = {
  publicationStatus: PortalApartmentDetail['publicationStatus'];
  verified: boolean;
  busy: boolean;
  onChangeStatus: (status: 'published' | 'draft') => void;
  onChangeVerified: (verified: boolean) => void;
};

const APARTMENT_VERIFIED_SWITCH_ID = 'apartment-verified';

const ApartmentPublicationToolbar = ({
  publicationStatus,
  verified,
  busy,
  onChangeStatus,
  onChangeVerified,
}: PublicationToolbarProps) => {
  const t = useTranslations('Builder.apartments');
  const tVerified = useTranslations('Builder.verified');
  const isPublished = publicationStatus === 'published';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-ink-secondary">{t(`publication.${publicationStatus}`)}</span>
      <Button
        type="button"
        size="sm"
        variant={isPublished ? 'ghost' : 'secondary'}
        disabled={busy}
        onClick={() => {
          onChangeStatus(isPublished ? 'draft' : 'published');
        }}
      >
        {isPublished ? t('detail.unpublish') : t('detail.publish')}
      </Button>
      <label
        htmlFor={APARTMENT_VERIFIED_SWITCH_ID}
        className="ml-1 flex items-center gap-2 text-sm text-ink"
      >
        <span>{tVerified('label')}</span>
        <Switch
          id={APARTMENT_VERIFIED_SWITCH_ID}
          checked={verified}
          disabled={busy}
          aria-label={tVerified('label')}
          onCheckedChange={onChangeVerified}
        />
      </label>
    </div>
  );
};

/**
 * Publish / unpublish and verified controls for catalog apartments.
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
      <ApartmentPublicationToolbar
        publicationStatus={apartment.publicationStatus}
        verified={apartment.verified}
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
