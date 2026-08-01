'use client';

import type { AdminGeoMapModelItem, UpdateGeoMapModelRequest } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { GeoMapGlbUploader } from '@/features/geo-map/admin/components/geo-map-glb-uploader';
import {
  GeoMapTransformFields,
  type GeoMapTransformDraft,
} from '@/features/geo-map/admin/components/geo-map-transform-fields';
import { Button } from '@/shared/ui/button';
import { Switch } from '@/shared/ui/switch';

type GeoMapEditPanelProps = {
  model: AdminGeoMapModelItem;
  isSaving: boolean;
  isDeleting: boolean;
  onSave: (body: UpdateGeoMapModelRequest) => Promise<void>;
  onPublishChange: (isPublished: boolean) => Promise<void>;
  onReplaceModel: (mediaAssetId: string) => Promise<void>;
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
 * Edit panel for a selected map model: replace GLB, transforms, publish, delete.
 */
export const GeoMapEditPanel = ({
  model,
  isSaving,
  isDeleting,
  onSave,
  onPublishChange,
  onReplaceModel,
  onDelete,
}: GeoMapEditPanelProps) => {
  const t = useTranslations('Admin.geoMap');
  const [draft, setDraft] = useState(() => toDraft(model));
  const [saveError, setSaveError] = useState<string | null>(null);
  const [replaceError, setReplaceError] = useState<string | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);
  const busy = isSaving || isDeleting || isReplacing;

  useEffect(() => {
    setDraft(toDraft(model));
    setSaveError(null);
    setReplaceError(null);
  }, [model]);

  const handleSave = async (): Promise<void> => {
    setSaveError(null);
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

  return (
    <section className="space-y-4 border-t border-border pt-4">
      <div>
        <h2 className="font-display text-xl text-ink">{model.projectName}</h2>
        <p className="mt-1 text-xs text-ink-muted">{t('edit.subtitle')}</p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-ink">{t('form.published')}</span>
        <Switch
          checked={model.isPublished}
          disabled={busy}
          aria-label={t('form.published')}
          onCheckedChange={(checked) => {
            void onPublishChange(checked);
          }}
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs text-ink-muted">{t('edit.replaceHint')}</p>
        <GeoMapGlbUploader
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

      <GeoMapTransformFields value={draft} onChange={setDraft} disabled={busy} />

      {saveError ? (
        <p role="alert" className="text-sm text-danger">
          {saveError}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" disabled={busy} onClick={() => void handleSave()}>
          {isSaving ? t('form.saving') : t('form.save')}
        </Button>
        <Button type="button" size="sm" variant="danger" disabled={busy} onClick={onDelete}>
          {isDeleting ? t('form.deleting') : t('form.delete')}
        </Button>
      </div>
    </section>
  );
};
