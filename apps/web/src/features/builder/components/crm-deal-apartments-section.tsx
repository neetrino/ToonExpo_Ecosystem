'use client';

import type { CrmDealDetail } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import { listPortalApartments } from '@/features/builder/api/portal-apartments-api';
import { PORTAL_MAX_PAGE_SIZE } from '@/features/builder/constants';
import {
  useAttachDealApartmentMutation,
  useDetachDealApartmentMutation,
} from '@/features/builder/hooks/use-portal-crm';
import {
  usePortalProjectQuery,
  usePortalProjectsQuery,
} from '@/features/builder/hooks/use-portal-projects';
import { Button } from '@/shared/ui/button';
import { ConfirmDeleteModal } from '@/shared/ui/confirm-delete-modal';
import { FormField } from '@/shared/ui/form-field';
import { Select } from '@/shared/ui/select';
import { useSuccessToast } from '@/shared/ui/use-success-toast';

type CrmDealApartmentsSectionProps = {
  deal: CrmDealDetail;
};

type ApartmentOption = { id: string; label: string };

/**
 * Linked apartments with attach/detach via dedicated deal apartment endpoints.
 */
export const CrmDealApartmentsSection = ({ deal }: CrmDealApartmentsSectionProps) => {
  const t = useTranslations('Builder.crm.detail');
  const projectsQuery = usePortalProjectsQuery(1, PORTAL_MAX_PAGE_SIZE);
  const attachMutation = useAttachDealApartmentMutation(deal.id);
  const detachMutation = useDetachDealApartmentMutation(deal.id);
  const [projectId, setProjectId] = useState(deal.projectId ?? '');
  const [apartmentId, setApartmentId] = useState('');
  const [apartments, setApartments] = useState<ApartmentOption[]>([]);
  const [loadingApartments, setLoadingApartments] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingUnlink, setPendingUnlink] = useState<{ id: string; label: string } | null>(null);
  const { showSuccess, successToast } = useSuccessToast();

  const projectQuery = usePortalProjectQuery(projectId);
  const floorIdsKey = useMemo(() => {
    const project = projectQuery.data;
    if (!project) {
      return '';
    }
    return project.buildings
      .flatMap((building) => building.floors.map((floor) => floor.id))
      .join(',');
  }, [projectQuery.data]);

  useEffect(() => {
    if (!projectId || !floorIdsKey) {
      setApartments([]);
      return;
    }
    const floorIds = floorIdsKey.split(',');
    let cancelled = false;
    setLoadingApartments(true);
    void (async () => {
      try {
        const lists = await Promise.all(floorIds.map((floorId) => listPortalApartments(floorId)));
        if (cancelled) {
          return;
        }
        setApartments(
          lists.flat().map((apartment) => ({
            id: apartment.id,
            label: apartment.number,
          })),
        );
      } catch {
        if (!cancelled) {
          setApartments([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingApartments(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId, floorIdsKey]);

  const onLink = async () => {
    setError(null);
    if (!apartmentId) {
      setError(t('selectApartment'));
      return;
    }
    try {
      await attachMutation.mutateAsync({ apartmentId });
      showSuccess(t('linkSuccess'));
      setApartmentId('');
    } catch {
      setError(t('errors.generic'));
    }
  };

  const onUnlink = async (linkedApartmentId: string) => {
    setError(null);
    try {
      await detachMutation.mutateAsync(linkedApartmentId);
      showSuccess(t('unlinkSuccess'));
      setPendingUnlink(null);
    } catch {
      setError(t('errors.unlinkBlocked'));
    }
  };

  const busy = attachMutation.isPending || detachMutation.isPending;

  return (
    <section className="flex flex-col gap-3 rounded-sm border border-border p-4">
      <h2 className="text-sm font-semibold text-ink">{t('apartmentsTitle')}</h2>

      {deal.apartments.length === 0 ? (
        <p className="text-sm text-ink-muted">{t('apartmentsEmpty')}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {deal.apartments.map((link) => {
            const label = link.apartmentNumber ?? link.apartmentId;
            return (
              <li
                key={link.id}
                className="flex items-center justify-between gap-3 rounded-sm bg-surface px-3 py-2 text-sm"
              >
                <span className="font-medium text-ink">
                  {label}
                  <span className="ml-2 text-xs font-normal text-ink-muted">
                    {t(`linkTypes.${link.linkType}`)}
                    {link.isPrimary ? ` · ${t('primary')}` : null}
                  </span>
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => {
                    setPendingUnlink({ id: link.apartmentId, label });
                  }}
                >
                  {t('unlinkApartment')}
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <FormField id="link-project" label={t('linkProject')}>
        <Select
          id="link-project"
          value={projectId}
          aria-label={t('linkProject')}
          onChange={(event) => {
            setProjectId(event.target.value);
            setApartmentId('');
          }}
        >
          <option value="">{t('selectProject')}</option>
          {(projectsQuery.data?.data ?? []).map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField id="link-apartment" label={t('linkApartment')}>
        <Select
          id="link-apartment"
          value={apartmentId}
          disabled={!projectId || loadingApartments}
          aria-label={t('linkApartment')}
          onChange={(event) => {
            setApartmentId(event.target.value);
          }}
        >
          <option value="">
            {loadingApartments ? t('loadingApartments') : t('selectApartment')}
          </option>
          {apartments.map((apartment) => (
            <option key={apartment.id} value={apartment.id}>
              {apartment.label}
            </option>
          ))}
        </Select>
      </FormField>

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      {successToast}

      <Button
        type="button"
        size="sm"
        disabled={busy || !apartmentId}
        onClick={() => {
          void onLink();
        }}
      >
        {attachMutation.isPending ? t('saving') : t('linkApartmentAction')}
      </Button>
      <ConfirmDeleteModal
        open={pendingUnlink != null}
        message={
          pendingUnlink ? t('unlinkConfirm', { apartment: pendingUnlink.label }) : undefined
        }
        confirming={detachMutation.isPending}
        confirmLabel={t('unlinkApartment')}
        onCancel={() => {
          if (!detachMutation.isPending) {
            setPendingUnlink(null);
          }
        }}
        onConfirm={() => {
          if (!pendingUnlink || detachMutation.isPending) {
            return;
          }
          void onUnlink(pendingUnlink.id);
        }}
      />
    </section>
  );
};
