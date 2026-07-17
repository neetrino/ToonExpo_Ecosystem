'use client';

import {
  HOTSPOT_COORD_MAX,
  HOTSPOT_COORD_MIN,
  HOTSPOT_LABEL_MAX_LENGTH,
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
import { VisualMapFormError } from '@/components/visual-map/visual-map-form-error';

import type { BuilderCanvasDetail } from '@/lib/visual-map/queries';
import {
  hotspotTargetValue,
  listHotspotTargetOptions,
  parseHotspotTargetValue,
  resolveCanvasContextType,
  type HotspotTargetOption,
} from '@/lib/visual-map/editor-helpers';
import type { BuilderProjectDetail } from '@/lib/builder/queries';
import type { VisualMapMutationErrorKey } from '@/lib/visual-map/mutation-result';

import {
  createHotspotAction,
  deleteHotspotAction,
  updateHotspotAction,
} from '../../../../visual-map-actions';

type HotspotDraft = {
  x: number;
  y: number;
};

type HotspotFormSheetProps = {
  locale: string;
  project: BuilderProjectDetail;
  canvas: BuilderCanvasDetail;
  mode: 'create' | 'edit';
  open: boolean;
  onClose: () => void;
  coords: HotspotDraft;
  hotspotId?: string;
  onPickPosition?: () => void;
  pickingPosition?: boolean;
};

export function HotspotFormSheet({
  locale,
  project,
  canvas,
  mode,
  open,
  onClose,
  coords,
  hotspotId,
  onPickPosition,
  pickingPosition,
}: HotspotFormSheetProps) {
  const t = useTranslations('portal.visualMap.hotspotForm');
  const router = useRouter();
  const refreshData = useDataRefresh();
  const [pending, startTransition] = useTransition();
  const [errorKey, setErrorKey] = useState<VisualMapMutationErrorKey | undefined>();

  const contextType = resolveCanvasContextType(canvas);
  const targetOptions = listHotspotTargetOptions(project, contextType, canvas);
  const existingHotspot =
    mode === 'edit' && hotspotId
      ? canvas.hotspots.find((hotspot) => hotspot.id === hotspotId)
      : undefined;

  const initialCoords = coords;
  const initialTarget = existingHotspot
    ? hotspotTargetValue(existingHotspot)
    : targetOptions[0]?.value;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setErrorKey(undefined);

    const formData = new FormData(event.currentTarget);
    const payload = buildHotspotPayload(mode, canvas.id, hotspotId, formData);

    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createHotspotAction(locale, payload)
          : await updateHotspotAction(locale, payload);

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
    if (!hotspotId || !window.confirm(t('deleteConfirm'))) {
      return;
    }

    setErrorKey(undefined);
    startTransition(async () => {
      const result = await deleteHotspotAction(locale, { hotspotId });
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
        <div className="portal-visual-map-coords">
          <PortalFormField label={t('fields.x')} name="x">
            <PortalTextInput
              name="x"
              type="number"
              defaultValue={String(initialCoords.x)}
              required
            />
          </PortalFormField>
          <PortalFormField label={t('fields.y')} name="y">
            <PortalTextInput
              name="y"
              type="number"
              defaultValue={String(initialCoords.y)}
              required
            />
          </PortalFormField>
        </div>

        {mode === 'edit' && onPickPosition ? (
          <button
            type="button"
            className="portal-btn portal-btn--ghost portal-btn--sm"
            onClick={onPickPosition}
          >
            {pickingPosition ? t('pickingActive') : t('pickPosition')}
          </button>
        ) : null}

        <TargetSelect options={targetOptions} initialValue={initialTarget} />

        <PortalFormField label={t('fields.label')} name="label">
          <PortalTextInput
            name="label"
            defaultValue={existingHotspot?.label ?? ''}
            maxLength={HOTSPOT_LABEL_MAX_LENGTH}
          />
        </PortalFormField>

        <VisualMapFormError errorKey={errorKey} />

        <button type="submit" className="portal-btn portal-btn--primary" disabled={pending}>
          {t('submit')}
        </button>

        {mode === 'edit' ? (
          <div className="portal-visual-map-delete">
            <button
              type="button"
              className="portal-btn portal-btn--ghost"
              disabled={pending}
              onClick={handleDelete}
            >
              {t('delete')}
            </button>
          </div>
        ) : null}
      </form>
    </SideSheet>
  );
}

function TargetSelect({
  options,
  initialValue,
}: {
  options: HotspotTargetOption[];
  initialValue?: string;
}) {
  const t = useTranslations('portal.visualMap.hotspotForm');

  return (
    <PortalFormField label={t('fields.target')} name="targetValue">
      <PortalSelect
        name="targetValue"
        defaultValue={initialValue}
        required
        disabled={options.length === 0}
      >
        {options.length === 0 ? (
          <option value="">{t('noTargets')}</option>
        ) : (
          options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))
        )}
      </PortalSelect>
    </PortalFormField>
  );
}

function buildHotspotPayload(
  mode: 'create' | 'edit',
  canvasId: string,
  hotspotId: string | undefined,
  formData: FormData,
): Record<string, string | number> {
  const x = Number(formData.get('x'));
  const y = Number(formData.get('y'));
  const label = String(formData.get('label') ?? '').trim();
  const targetValue = String(formData.get('targetValue') ?? '');
  const target = parseHotspotTargetValue(targetValue);

  const payload: Record<string, string | number> = {
    canvasId,
    x: clampCoord(x),
    y: clampCoord(y),
    ...target,
  };

  if (label) {
    payload.label = label;
  }
  if (mode === 'edit' && hotspotId) {
    payload.hotspotId = hotspotId;
  }

  return payload;
}

function clampCoord(value: number): number {
  if (Number.isNaN(value)) {
    return HOTSPOT_COORD_MIN;
  }
  return Math.min(HOTSPOT_COORD_MAX, Math.max(HOTSPOT_COORD_MIN, value));
}
