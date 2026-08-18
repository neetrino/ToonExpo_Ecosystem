'use client';

import type { MediaAssetItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { GeoMapCreateAddressField } from '@/features/geo-map/admin/components/geo-map-create-address-field';
import { GeoMapGlbUploader } from '@/features/geo-map/admin/components/geo-map-glb-uploader';
import { GEO_MAP_CREATE_GLB_INPUT_ID } from '@/features/geo-map/admin/utils/focus-geo-map-file-input';
import type { GeoMapProjectOption } from '@/features/geo-map/admin/utils/available-projects';
import {
  buildGeoMapAddressQuery,
  formatGeoMapSiteAddress,
} from '@/features/geo-map/admin/utils/build-geo-map-address-query';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Select } from '@/shared/ui/select';

export type GeoMapCreateDraft = {
  /** Empty string = place without attaching a project yet. */
  projectId: string;
  /** Temporary geocode input; never written back as the project address. */
  searchQuery: string;
  mediaAssetId: string;
  modelUrl: string;
  fileName: string;
};

type GeoMapCreatePanelProps = {
  projects: GeoMapProjectOption[];
  draft: GeoMapCreateDraft | null;
  onDraftChange: (draft: GeoMapCreateDraft | null) => void;
  onGoToAddress: (query: string) => void;
  onPlaceAtPreview: () => void;
  isCreating: boolean;
  isGeocoding: boolean;
  hasOsmSelection: boolean;
  hasPreviewPin: boolean;
};

const patchDraft = (
  draft: GeoMapCreateDraft | null,
  patch: Partial<GeoMapCreateDraft>,
): GeoMapCreateDraft => ({
  projectId: draft?.projectId ?? '',
  searchQuery: draft?.searchQuery ?? '',
  mediaAssetId: draft?.mediaAssetId ?? '',
  modelUrl: draft?.modelUrl ?? '',
  fileName: draft?.fileName ?? '',
  ...patch,
});

/**
 * Create flow: optional project + address fly-to + required GLB, then click map.
 */
export const GeoMapCreatePanel = ({
  projects,
  draft,
  onDraftChange,
  onGoToAddress,
  onPlaceAtPreview,
  isCreating,
  isGeocoding,
  hasOsmSelection,
  hasPreviewPin,
}: GeoMapCreatePanelProps) => {
  const t = useTranslations('Admin.geoMap');
  const selectedProjectId = draft?.projectId ?? '';
  const searchQuery = draft?.searchQuery ?? '';
  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? null;
  const siteAddress = selectedProject ? formatGeoMapSiteAddress(selectedProject) : '';
  const readyToPlace = Boolean(draft?.mediaAssetId);

  const handleProjectChange = (projectId: string): void => {
    const selected = projects.find((project) => project.id === projectId) ?? null;
    onDraftChange(patchDraft(draft, { projectId, searchQuery: '' }));
    const geocodeQuery = selected ? buildGeoMapAddressQuery(selected) : '';
    if (geocodeQuery) {
      onGoToAddress(geocodeQuery);
    }
  };

  const handleUploaded = (asset: MediaAssetItem): void => {
    onDraftChange(
      patchDraft(draft, {
        mediaAssetId: asset.id,
        modelUrl: asset.fileUrl,
        fileName: asset.title ?? asset.id,
      }),
    );
  };

  return (
    <section id="geo-map-create-panel" className="space-y-3 border-t border-border pt-4">
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
          <option value="">{t('create.projectOptional')}</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id} disabled={project.hasModel}>
              {project.hasModel
                ? t('create.projectTaken', { name: project.name })
                : `${project.name} · ${project.companyName}`}
            </option>
          ))}
        </Select>
      </FormField>
      <p className="text-xs text-ink-muted">{t('create.projectLaterHint')}</p>

      <GeoMapCreateAddressField
        siteAddress={siteAddress}
        searchQuery={searchQuery}
        disabled={isCreating}
        isGeocoding={isGeocoding}
        onSearchChange={(value) => onDraftChange(patchDraft(draft, { searchQuery: value }))}
        onSearch={onGoToAddress}
      />

      {hasPreviewPin ? (
        <p className="text-xs text-ink-muted">{t('create.previewHint')}</p>
      ) : null}

      <GeoMapGlbUploader
        browseButtonId="geo-map-create-glb-browse"
        fileInputId={GEO_MAP_CREATE_GLB_INPUT_ID}
        disabled={isCreating}
        fileName={draft?.fileName || null}
        onUploaded={handleUploaded}
      />

      {readyToPlace && hasPreviewPin ? (
        <Button type="button" size="sm" disabled={isCreating} onClick={onPlaceAtPreview}>
          {isCreating ? t('create.placing') : t('create.placeAtPin')}
        </Button>
      ) : null}

      {readyToPlace ? (
        <p className="rounded-sm border border-brand/40 bg-brand-soft/30 px-3 py-2 text-sm text-ink">
          {isCreating
            ? t('create.placing')
            : hasOsmSelection
              ? t('create.clickOsmReady')
              : t('create.clickMapOrOsm')}
        </p>
      ) : (
        <p className="text-xs text-ink-muted">{t('create.hint')}</p>
      )}
    </section>
  );
};
