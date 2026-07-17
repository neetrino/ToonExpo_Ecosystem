'use client';

import {
  BOOTH_CODE_MAX_LENGTH,
  BOOTH_COORD_MAX,
  BOOTH_COORD_MIN,
  BOOTH_LABEL_MAX_LENGTH,
  BOOTH_NOTE_MAX_LENGTH,
} from '@toonexpo/contracts';
import { SideSheet } from '@toonexpo/ui';
import { useTranslations } from 'next-intl';
import { useMemo, useState, useTransition } from 'react';

import { useDataRefresh } from '@/components/portal-forms/data-refresh-context';
import { PortalFormError } from '@/components/portal-forms/form-error';
import {
  PortalFormField,
  PortalSelect,
  PortalTextInput,
} from '@/components/portal-forms/form-fields';
import { useRouter } from '@/i18n/navigation';
import type {
  AdminAssignmentOption,
  AdminProjectOption,
  AdminVenueBoothRow,
} from '@/lib/exhibition/admin-venue-queries';
import type { AdminMutationErrorKey } from '@/lib/admin/mutation-result';

import { deleteBoothAction, upsertBoothAction } from './actions';

type BoothCoords = { xPercent: number; yPercent: number };

type BoothFormSheetProps = {
  locale: string;
  eventId: string;
  venueMapId: string;
  companies: AdminAssignmentOption[];
  partners: AdminAssignmentOption[];
  projects: AdminProjectOption[];
  mode: 'create' | 'edit';
  open: boolean;
  onClose: () => void;
  coords: BoothCoords;
  booth?: AdminVenueBoothRow;
};

export function BoothFormSheet({
  locale,
  eventId,
  venueMapId,
  companies,
  partners,
  projects,
  mode,
  open,
  onClose,
  coords,
  booth,
}: BoothFormSheetProps) {
  const t = useTranslations('admin.exhibition.venue.boothForm');
  const router = useRouter();
  const refreshData = useDataRefresh();
  const [pending, startTransition] = useTransition();
  const [errorKey, setErrorKey] = useState<AdminMutationErrorKey | undefined>();
  const [companyId, setCompanyId] = useState(booth?.companyId ?? '');
  const [projectId, setProjectId] = useState(booth?.projectId ?? '');

  const filteredProjects = useMemo(() => {
    if (!companyId) {
      return projects;
    }
    return projects.filter((project) => project.companyId === companyId);
  }, [companyId, projects]);

  function handleCompanyChange(value: string): void {
    setCompanyId(value);
    if (!value) {
      return;
    }
    const selected = projects.find((project) => project.id === projectId);
    if (selected && selected.companyId !== value) {
      setProjectId('');
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setErrorKey(undefined);
    const formData = new FormData(event.currentTarget);
    const payload = {
      boothId: booth?.id,
      venueMapId,
      code: String(formData.get('code') ?? ''),
      label: String(formData.get('label') ?? ''),
      xPercent: Number(formData.get('xPercent')),
      yPercent: Number(formData.get('yPercent')),
      companyId,
      partnerId: String(formData.get('partnerId') ?? ''),
      projectId,
      note: String(formData.get('note') ?? ''),
    };

    startTransition(async () => {
      const result = await upsertBoothAction(locale, eventId, payload);
      if (!result.ok) {
        setErrorKey(result.errorKey);
        return;
      }
      onClose();
      void refreshData?.();
      router.refresh();
    });
  }

  function handleDelete(): void {
    if (!booth || !window.confirm(t('deleteConfirm'))) {
      return;
    }
    setErrorKey(undefined);
    startTransition(async () => {
      const result = await deleteBoothAction(locale, eventId, { boothId: booth.id });
      if (!result.ok) {
        setErrorKey(result.errorKey);
        return;
      }
      onClose();
      void refreshData?.();
      router.refresh();
    });
  }

  return (
    <SideSheet title={t(mode)} open={open} onClose={onClose}>
      <form className="portal-form" onSubmit={handleSubmit}>
        <PortalFormField label={t('fields.code')} name="code">
          <PortalTextInput
            name="code"
            defaultValue={booth?.code}
            required
            maxLength={BOOTH_CODE_MAX_LENGTH}
          />
        </PortalFormField>
        <PortalFormField label={t('fields.label')} name="label">
          <PortalTextInput
            name="label"
            defaultValue={booth?.label}
            required
            maxLength={BOOTH_LABEL_MAX_LENGTH}
          />
        </PortalFormField>
        <PortalFormField label={t('fields.xPercent')} name="xPercent">
          <PortalTextInput
            name="xPercent"
            type="number"
            min={BOOTH_COORD_MIN}
            max={BOOTH_COORD_MAX}
            defaultValue={String(coords.xPercent)}
            required
          />
        </PortalFormField>
        <PortalFormField label={t('fields.yPercent')} name="yPercent">
          <PortalTextInput
            name="yPercent"
            type="number"
            min={BOOTH_COORD_MIN}
            max={BOOTH_COORD_MAX}
            defaultValue={String(coords.yPercent)}
            required
          />
        </PortalFormField>
        <PortalFormField label={t('fields.company')} name="companyId">
          <PortalSelect
            name="companyId"
            value={companyId}
            onChange={(event) => handleCompanyChange(event.target.value)}
          >
            <option value="">{t('none')}</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </PortalSelect>
        </PortalFormField>
        <PortalFormField label={t('fields.partner')} name="partnerId">
          <PortalSelect name="partnerId" defaultValue={booth?.partnerId ?? ''}>
            <option value="">{t('none')}</option>
            {partners.map((partner) => (
              <option key={partner.id} value={partner.id}>
                {partner.name}
              </option>
            ))}
          </PortalSelect>
        </PortalFormField>
        <PortalFormField label={t('fields.project')} name="projectId">
          <PortalSelect
            name="projectId"
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
          >
            <option value="">{t('none')}</option>
            {filteredProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </PortalSelect>
        </PortalFormField>
        <PortalFormField label={t('fields.note')} name="note">
          <PortalTextInput
            name="note"
            defaultValue={booth?.note ?? ''}
            maxLength={BOOTH_NOTE_MAX_LENGTH}
          />
        </PortalFormField>
        <PortalFormError errorKey={errorKey} />
        <div className="portal-form__actions">
          <button type="submit" className="portal-btn" disabled={pending}>
            {t('submit')}
          </button>
          {mode === 'edit' ? (
            <button
              type="button"
              className="portal-btn portal-btn--ghost"
              disabled={pending}
              onClick={handleDelete}
            >
              {t('delete')}
            </button>
          ) : null}
        </div>
      </form>
    </SideSheet>
  );
}
