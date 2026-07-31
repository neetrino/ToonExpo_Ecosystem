'use client';

import type { MediaAssetItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { GeoMapGlbUploader } from '@/features/geo-map/admin/components/geo-map-glb-uploader';
import type { GeoMapProjectOption } from '@/features/geo-map/admin/utils/available-projects';
import { FormField } from '@/shared/ui/form-field';
import { Select } from '@/shared/ui/select';

export type GeoMapCreateDraft = {
  projectId: string;
  mediaAssetId: string;
  modelUrl: string;
  fileName: string;
};

type GeoMapCreatePanelProps = {
  projects: GeoMapProjectOption[];
  draft: GeoMapCreateDraft | null;
  onDraftChange: (draft: GeoMapCreateDraft | null) => void;
  isCreating: boolean;
};

/**
 * Create flow: pick a free project, upload GLB, then click the map to place.
 */
export const GeoMapCreatePanel = ({
  projects,
  draft,
  onDraftChange,
  isCreating,
}: GeoMapCreatePanelProps) => {
  const t = useTranslations('Admin.geoMap');
  const selectedProjectId = draft?.projectId ?? '';

  const handleProjectChange = (projectId: string): void => {
    onDraftChange({
      projectId,
      mediaAssetId: projectId ? (draft?.mediaAssetId ?? '') : '',
      modelUrl: projectId ? (draft?.modelUrl ?? '') : '',
      fileName: projectId ? (draft?.fileName ?? '') : '',
    });
  };

  const handleUploaded = (asset: MediaAssetItem): void => {
    if (!selectedProjectId) {
      return;
    }
    onDraftChange({
      projectId: selectedProjectId,
      mediaAssetId: asset.id,
      modelUrl: asset.fileUrl,
      fileName: asset.title ?? asset.id,
    });
  };

  const readyToPlace = Boolean(draft?.projectId && draft.mediaAssetId);

  return (
    <section className="space-y-3 border-t border-border pt-4">
      <h2 className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">
        {t('create.title')}
      </h2>
      <FormField id="geo-map-project" label={t('create.project')}>
        <Select
          id="geo-map-project"
          value={selectedProjectId}
          disabled={isCreating}
          onChange={(event) => handleProjectChange(event.target.value)}
        >
          <option value="">{t('create.projectPlaceholder')}</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id} disabled={project.hasModel}>
              {project.hasModel
                ? t('create.projectTaken', { name: project.name })
                : `${project.name} · ${project.companyName}`}
            </option>
          ))}
        </Select>
      </FormField>

      <GeoMapGlbUploader
        disabled={!selectedProjectId || isCreating}
        fileName={draft?.fileName || null}
        onUploaded={handleUploaded}
      />

      {readyToPlace ? (
        <p className="rounded-sm border border-brand/40 bg-brand-soft/30 px-3 py-2 text-sm text-ink">
          {isCreating ? t('create.placing') : t('create.clickMap')}
        </p>
      ) : (
        <p className="text-xs text-ink-muted">{t('create.hint')}</p>
      )}
    </section>
  );
};
