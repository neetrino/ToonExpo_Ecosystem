'use client';

import {
  CANVAS_IMAGE_ALT_MAX_LENGTH,
  CANVAS_IMAGE_URL_MAX_LENGTH,
  CANVAS_TITLE_MAX_LENGTH,
} from '@toonexpo/contracts';
import { SideSheet } from '@toonexpo/ui';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useState, useTransition } from 'react';

import { useDataRefresh } from '@/components/portal-forms/data-refresh-context';
import {
  PortalFormField,
  PortalSelect,
  PortalTextInput,
} from '@/components/portal-forms/form-fields';
import { ImageUploadField } from '@/components/portal-forms/image-upload-field';
import { VisualMapFormError } from '@/components/visual-map/visual-map-form-error';

import type { BuilderProjectDetail } from '@/lib/builder/queries';
import type { VisualMapMutationErrorKey } from '@/lib/visual-map/mutation-result';

import { createCanvasAction } from '../../visual-map-actions';

type CanvasFormSheetProps = {
  locale: string;
  project: BuilderProjectDetail;
  open: boolean;
  onClose: () => void;
};

type ContextKind = 'project' | 'building' | 'floor';

export function CanvasFormSheet({ locale, project, open, onClose }: CanvasFormSheetProps) {
  const t = useTranslations('portal.visualMap.canvasForm');
  const router = useRouter();
  const refreshData = useDataRefresh();
  const [pending, startTransition] = useTransition();
  const [errorKey, setErrorKey] = useState<VisualMapMutationErrorKey | undefined>();
  const [contextKind, setContextKind] = useState<ContextKind>('project');
  const [buildingId, setBuildingId] = useState(project.buildings[0]?.id ?? '');
  const [floorId, setFloorId] = useState(project.buildings[0]?.floors[0]?.id ?? '');

  const floorsForBuilding =
    project.buildings.find((building) => building.id === buildingId)?.floors ?? [];

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setErrorKey(undefined);

    const formData = new FormData(event.currentTarget);
    const payload = buildCreatePayload(contextKind, buildingId, floorId, formData, project.id);

    startTransition(async () => {
      const result = await createCanvasAction(locale, payload);
      if (!result.ok) {
        setErrorKey(result.errorKey);
        return;
      }
      onClose();
      router.push(`/portal/projects/${project.id}/visual-maps/${result.canvasId}`);
      void refreshData?.();
      router.refresh();
    });
  }

  return (
    <SideSheet title={t('title')} open={open} onClose={onClose}>
      <form className="portal-form" onSubmit={handleSubmit}>
        <PortalFormField label={t('fields.context')} name="contextKind">
          <PortalSelect
            name="contextKind"
            defaultValue={contextKind}
            required
            onChange={(event) => setContextKind(event.target.value as ContextKind)}
          >
            <option value="project">{t('context.project')}</option>
            <option value="building">{t('context.building')}</option>
            <option value="floor">{t('context.floor')}</option>
          </PortalSelect>
        </PortalFormField>

        {contextKind === 'building' ? (
          <PortalFormField label={t('fields.building')} name="buildingId">
            <PortalSelect
              name="buildingId"
              defaultValue={buildingId}
              required
              onChange={(event) => setBuildingId(event.target.value)}
            >
              {project.buildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </PortalSelect>
          </PortalFormField>
        ) : null}

        {contextKind === 'floor' ? (
          <>
            <PortalFormField label={t('fields.building')} name="floorBuildingId">
              <PortalSelect
                name="floorBuildingId"
                defaultValue={buildingId}
                required
                onChange={(event) => {
                  setBuildingId(event.target.value);
                  const nextFloors =
                    project.buildings.find((building) => building.id === event.target.value)
                      ?.floors ?? [];
                  setFloorId(nextFloors[0]?.id ?? '');
                }}
              >
                {project.buildings.map((building) => (
                  <option key={building.id} value={building.id}>
                    {building.name}
                  </option>
                ))}
              </PortalSelect>
            </PortalFormField>
            <PortalFormField label={t('fields.floor')} name="floorId">
              <PortalSelect
                name="floorId"
                value={floorId}
                required
                onChange={(event) => setFloorId(event.target.value)}
              >
                {floorsForBuilding.map((floor) => (
                  <option key={floor.id} value={floor.id}>
                    {floor.name} ({floor.level})
                  </option>
                ))}
              </PortalSelect>
            </PortalFormField>
          </>
        ) : null}

        <PortalFormField label={t('fields.title')} name="title">
          <PortalTextInput name="title" maxLength={CANVAS_TITLE_MAX_LENGTH} />
        </PortalFormField>

        <p className="portal-form__hint">{t('fields.imageUrlHint')}</p>
        <ImageUploadField
          name="imageUrl"
          purpose="CANVAS_IMAGE"
          initialUrl=""
          required
          maxLength={CANVAS_IMAGE_URL_MAX_LENGTH}
        />

        <PortalFormField label={t('fields.imageAlt')} name="imageAlt">
          <PortalTextInput name="imageAlt" maxLength={CANVAS_IMAGE_ALT_MAX_LENGTH} />
        </PortalFormField>

        <VisualMapFormError errorKey={errorKey} />

        <button type="submit" className="portal-btn portal-btn--primary" disabled={pending}>
          {t('submit')}
        </button>
      </form>
    </SideSheet>
  );
}

function buildCreatePayload(
  contextKind: ContextKind,
  buildingId: string,
  floorId: string,
  formData: FormData,
  projectId: string,
): Record<string, string> {
  const title = String(formData.get('title') ?? '').trim();
  const imageUrl = String(formData.get('imageUrl') ?? '').trim();
  const imageAlt = String(formData.get('imageAlt') ?? '').trim();

  const payload: Record<string, string> = { imageUrl };
  if (title) {
    payload.title = title;
  }
  if (imageAlt) {
    payload.imageAlt = imageAlt;
  }

  if (contextKind === 'project') {
    payload.projectId = projectId;
  } else if (contextKind === 'building') {
    payload.buildingId = buildingId;
  } else {
    payload.floorId = floorId;
  }

  return payload;
}
