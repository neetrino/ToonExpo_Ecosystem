'use client';

import type { AdminGeoMapModelItem, UpdateGeoMapModelRequest } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { GeoMapEditActions } from '@/features/geo-map/admin/components/geo-map-edit-actions';
import { GeoMapGlbUploader } from '@/features/geo-map/admin/components/geo-map-glb-uploader';
import { GeoMapSiteAddress } from '@/features/geo-map/admin/components/geo-map-site-address';
import { GEO_MAP_REPLACE_GLB_INPUT_ID } from '@/features/geo-map/admin/utils/focus-geo-map-file-input';
import {
  GeoMapTransformFields,
  type GeoMapTransformDraft,
} from '@/features/geo-map/admin/components/geo-map-transform-fields';
import type { GeoMapProjectOption } from '@/features/geo-map/admin/utils/available-projects';
import { formatGeoMapSiteAddress } from '@/features/geo-map/admin/utils/build-geo-map-address-query';
import type { GeoMapLngLat } from '@/features/geo-map/types';
import { isValidGeoMapLngLat } from '@/features/geo-map/utils/validate-geo-map-position';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Select } from '@/shared/ui/select';

/**
 * Map-drag end → sidebar draft sync (token bumps each drag). `id` scopes the
 * patch to the dragged model so dragging one pin never moves the selected one.
 */
export type GeoMapDragSyncedPosition = GeoMapLngLat & {
  id: string;
  token: number;
};

type GeoMapEditPanelProps = {
  model: AdminGeoMapModelItem;
  projects: GeoMapProjectOption[];
  isSaving: boolean;
  isDeleting: boolean;
  /** Live map preview while editing; Save still persists to the API. */
  onTransformPreview: (draft: GeoMapTransformDraft) => void;
  /** When token bumps (drag end), patches draft lng/lat so sliders stay in sync. */
  dragSyncedPosition: GeoMapDragSyncedPosition | null;
  onSave: (body: UpdateGeoMapModelRequest) => Promise<void>;
  onPublishChange: (isPublished: boolean) => Promise<void>;
  onReplaceModel: (mediaAssetId: string) => Promise<void>;
  onAttachProject: (projectId: string) => Promise<void>;
  onDelete: () => void;
};

const toDraft = (model: AdminGeoMapModelItem): GeoMapTransformDraft => ({
  longitude: Number(model.longitude),
  latitude: Number(model.latitude),
  altitudeM: Number(model.altitudeM),
  headingDeg: Number(model.headingDeg),
  pitchDeg: Number(model.pitchDeg),
  rollDeg: Number(model.rollDeg),
  scale: Number(model.scale),
  minZoom: Number(model.minZoom),
});

/**
 * Edit panel: attach project, replace GLB, transforms, publish, delete.
 */
export const GeoMapEditPanel = ({
  model,
  projects,
  isSaving,
  isDeleting,
  onTransformPreview,
  dragSyncedPosition,
  onSave,
  onPublishChange,
  onReplaceModel,
  onAttachProject,
  onDelete,
}: GeoMapEditPanelProps) => {
  const t = useTranslations('Admin.geoMap');
  const [draft, setDraft] = useState(() => toDraft(model));
  const [attachProjectId, setAttachProjectId] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [attachError, setAttachError] = useState<string | null>(null);
  const [replaceError, setReplaceError] = useState<string | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);
  const busy = isSaving || isDeleting || isReplacing || isAttaching;
  const isUnassigned = model.projectId === null;
  const freeProjects = projects.filter((project) => !project.hasModel);
  const attachedProject = projects.find((project) => project.id === model.projectId) ?? null;
  const siteAddress = attachedProject ? formatGeoMapSiteAddress(attachedProject) : '';

  const commitDraft = (next: GeoMapTransformDraft): void => {
    setDraft(next);
    onTransformPreview(next);
  };

  useEffect(() => {
    const next = toDraft(model);
    setDraft(next);
    onTransformPreview(next);
    setAttachProjectId('');
    setSaveError(null);
    setAttachError(null);
    setReplaceError(null);
  }, [model, onTransformPreview]);

  useEffect(() => {
    if (!dragSyncedPosition || dragSyncedPosition.id !== model.id) {
      return;
    }
    setDraft((current) => {
      const next = {
        ...current,
        longitude: dragSyncedPosition.longitude,
        latitude: dragSyncedPosition.latitude,
      };
      onTransformPreview(next);
      return next;
    });
  }, [dragSyncedPosition, model.id, onTransformPreview]);

  const handleSave = async (): Promise<void> => {
    setSaveError(null);
    if (!isValidGeoMapLngLat({ longitude: draft.longitude, latitude: draft.latitude })) {
      setSaveError(t('form.coordinatesInvalid'));
      return;
    }
    try {
      await onSave({
        longitude: draft.longitude,
        latitude: draft.latitude,
        altitudeM: draft.altitudeM,
        headingDeg: draft.headingDeg,
        pitchDeg: draft.pitchDeg,
        rollDeg: draft.rollDeg,
        scale: draft.scale,
        minZoom: draft.minZoom,
      });
    } catch {
      setSaveError(t('form.saveError'));
    }
  };

  const handleReplaceUploaded = async (mediaAssetId: string): Promise<void> => {
    setReplaceError(null);
    setIsReplacing(true);
    try {
      await onReplaceModel(mediaAssetId);
    } catch {
      setReplaceError(t('edit.replaceError'));
    } finally {
      setIsReplacing(false);
    }
  };

  const handleAttach = async (): Promise<void> => {
    if (!attachProjectId) {
      return;
    }
    setAttachError(null);
    setIsAttaching(true);
    try {
      await onAttachProject(attachProjectId);
    } catch {
      setAttachError(t('edit.attachError'));
    } finally {
      setIsAttaching(false);
    }
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain">
        <div>
          <h2 className="font-display text-xl text-ink">
            {model.projectName ?? model.mediaTitle ?? t('list.unassigned')}
          </h2>
          <p className="mt-1 text-xs text-ink-muted">{t('edit.subtitle')}</p>
        </div>

        <GeoMapSiteAddress address={siteAddress} />

        {isUnassigned ? (
          <div className="space-y-2 rounded-sm border border-border px-3 py-3">
            <p className="text-sm font-medium text-ink">{t('edit.attachTitle')}</p>
            <p className="text-xs text-ink-muted">{t('edit.attachHint')}</p>
            <FormField id="geo-map-attach-project" label={t('create.project')}>
              <Select
                id="geo-map-attach-project"
                value={attachProjectId}
                disabled={busy}
                onChange={(event) => setAttachProjectId(event.target.value)}
              >
                <option value="">{t('create.projectPlaceholder')}</option>
                {freeProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} · {project.companyName}
                  </option>
                ))}
              </Select>
            </FormField>
            <Button
              type="button"
              size="sm"
              disabled={busy || !attachProjectId}
              onClick={() => void handleAttach()}
            >
              {isAttaching ? t('edit.attaching') : t('edit.attach')}
            </Button>
            {attachError ? (
              <p role="alert" className="text-sm text-danger">
                {attachError}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-2">
          <p className="text-xs text-ink-muted">{t('edit.replaceHint')}</p>
          <GeoMapGlbUploader
            browseButtonId="geo-map-replace-glb-browse"
            fileInputId={GEO_MAP_REPLACE_GLB_INPUT_ID}
            disabled={busy}
            onUploaded={(asset) => {
              void handleReplaceUploaded(asset.id);
            }}
          />
          {replaceError ? (
            <p role="alert" className="text-sm text-danger">
              {replaceError}
            </p>
          ) : null}
          {isReplacing ? <p className="text-xs text-ink-muted">{t('edit.replacing')}</p> : null}
        </div>

        <GeoMapTransformFields value={draft} onChange={commitDraft} disabled={busy} />

        {saveError ? (
          <p role="alert" className="text-sm text-danger">
            {saveError}
          </p>
        ) : null}
      </div>

      <GeoMapEditActions
        busy={busy}
        isPublished={model.isPublished}
        isSaving={isSaving}
        isDeleting={isDeleting}
        onSave={() => void handleSave()}
        onDelete={onDelete}
        onPublishChange={(next) => {
          void onPublishChange(next);
        }}
      />
    </section>
  );
};
