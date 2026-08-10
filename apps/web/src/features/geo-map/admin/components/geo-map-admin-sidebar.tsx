'use client';

import type { AdminGeoMapModelItem, UpdateGeoMapModelRequest } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import {
  GeoMapCreatePanel,
  type GeoMapCreateDraft,
} from '@/features/geo-map/admin/components/geo-map-create-panel';
import {
  GeoMapEditPanel,
  type GeoMapDragSyncedPosition,
} from '@/features/geo-map/admin/components/geo-map-edit-panel';
import { GeoMapModelList } from '@/features/geo-map/admin/components/geo-map-model-list';
import type { GeoMapTransformDraft } from '@/features/geo-map/admin/components/geo-map-transform-fields';
import type { GeoMapProjectOption } from '@/features/geo-map/admin/utils/available-projects';
import { Button } from '@/shared/ui/button';
import { Reveal } from '@/shared/ui/motion';

type GeoMapAdminSidebarProps = {
  models: AdminGeoMapModelItem[];
  projects: GeoMapProjectOption[];
  selectedId: string | null;
  createDraft: GeoMapCreateDraft | null;
  selectedModel: AdminGeoMapModelItem | null;
  hasOsmSelection: boolean;
  isCreating: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  dragSyncedPosition: GeoMapDragSyncedPosition | null;
  onSelect: (id: string) => void;
  onStartCreate: () => void;
  onCreateDraftChange: (draft: GeoMapCreateDraft | null) => void;
  onTransformPreview: (draft: GeoMapTransformDraft) => void;
  onSave: (body: UpdateGeoMapModelRequest) => Promise<void>;
  onPublishChange: (isPublished: boolean) => Promise<void>;
  onReplaceModel: (mediaAssetId: string) => Promise<void>;
  onAttachProject: (projectId: string) => Promise<void>;
  onDelete: () => void;
  headerActions?: ReactNode | undefined;
};

/**
 * Side panel: model list + create/edit forms for the admin 3D map editor.
 */
export const GeoMapAdminSidebar = ({
  models,
  projects,
  selectedId,
  createDraft,
  selectedModel,
  hasOsmSelection,
  isCreating,
  isSaving,
  isDeleting,
  dragSyncedPosition,
  onSelect,
  onStartCreate,
  onCreateDraftChange,
  onTransformPreview,
  onSave,
  onPublishChange,
  onReplaceModel,
  onAttachProject,
  onDelete,
  headerActions,
}: GeoMapAdminSidebarProps) => {
  const t = useTranslations('Admin.geoMap');
  const isCreateMode = createDraft !== null;

  return (
    <aside className="flex h-full min-h-0 w-full flex-col gap-4 overflow-y-auto border-border bg-surface-elevated p-4 lg:border-r">
      <Reveal force>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="font-display text-2xl text-ink">{t('title')}</h1>
            <p className="mt-1 text-xs text-ink-muted">{t('subtitle')}</p>
          </div>
          {headerActions}
        </div>
      </Reveal>

      <section className="space-y-2">
        <Reveal force>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">
              {t('list.title')}
            </h2>
            <Button type="button" size="sm" variant="secondary" onClick={onStartCreate}>
              {t('create.new')}
            </Button>
          </div>
        </Reveal>
        <GeoMapModelList models={models} selectedId={selectedId} onSelect={onSelect} />
      </section>

      {isCreateMode ? (
        <GeoMapCreatePanel
          projects={projects}
          draft={createDraft}
          onDraftChange={onCreateDraftChange}
          isCreating={isCreating}
          hasOsmSelection={hasOsmSelection}
        />
      ) : null}

      {!isCreateMode && selectedModel ? (
        <GeoMapEditPanel
          model={selectedModel}
          projects={projects}
          isSaving={isSaving}
          isDeleting={isDeleting}
          dragSyncedPosition={dragSyncedPosition}
          onTransformPreview={onTransformPreview}
          onSave={onSave}
          onPublishChange={onPublishChange}
          onReplaceModel={onReplaceModel}
          onAttachProject={onAttachProject}
          onDelete={onDelete}
        />
      ) : null}
    </aside>
  );
};
