'use client';

import type { AdminGeoMapModelItem, UpdateGeoMapModelRequest } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { GeoMapAdminSidebar } from '@/features/geo-map/admin/components/geo-map-admin-sidebar';
import type { GeoMapCreateDraft } from '@/features/geo-map/admin/components/geo-map-create-panel';
import { GEO_MAP_DEFAULT_CREATE_VALUES } from '@/features/geo-map/admin/constants';
import {
  useAdminGeoMapModelsQuery,
  useCreateGeoMapModelMutation,
  useDeleteGeoMapModelMutation,
  useGeoMapAdminProjectsQuery,
  useUpdateGeoMapModelMutation,
} from '@/features/geo-map/admin/hooks/use-geo-map-admin';
import { buildGeoMapProjectOptions } from '@/features/geo-map/admin/utils/available-projects';
import { GeoMapCanvasLazy } from '@/features/geo-map/components/geo-map-canvas-lazy';
import type { GeoMapLngLat } from '@/features/geo-map/types';
import { mapAdminGeoMapItemsToObjects } from '@/features/geo-map/utils/map-object-mapper';
import { AdminDeleteModal } from '@/shared/ui/admin-delete-modal';
import { Link } from '@/i18n/navigation';

const EMPTY_CREATE_DRAFT: GeoMapCreateDraft = {
  projectId: '',
  mediaAssetId: '',
  modelUrl: '',
  fileName: '',
};

/**
 * Super-admin 3D map editor: fullscreen map + side panel (Stage 2b).
 */
export const GeoMapAdminPage = () => {
  const t = useTranslations('Admin.geoMap');
  const modelsQuery = useAdminGeoMapModelsQuery();
  const projectsQuery = useGeoMapAdminProjectsQuery();
  const createMutation = useCreateGeoMapModelMutation();
  const updateMutation = useUpdateGeoMapModelMutation();
  const deleteMutation = useDeleteGeoMapModelMutation();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [createDraft, setCreateDraft] = useState<GeoMapCreateDraft | null>(EMPTY_CREATE_DRAFT);
  const [pendingDelete, setPendingDelete] = useState<AdminGeoMapModelItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const models = modelsQuery.data?.data ?? [];
  const projects = useMemo(
    () => buildGeoMapProjectOptions(projectsQuery.data?.data ?? [], models),
    [projectsQuery.data, models],
  );
  const objects = useMemo(() => mapAdminGeoMapItemsToObjects(models), [models]);
  const selectedModel = models.find((model) => model.id === selectedId) ?? null;

  const startCreate = (): void => {
    setSelectedId(null);
    setCreateDraft(EMPTY_CREATE_DRAFT);
    setActionError(null);
  };

  const selectModel = (id: string): void => {
    setSelectedId(id);
    setCreateDraft(null);
    setActionError(null);
  };

  const handleMapClick = async (position: GeoMapLngLat): Promise<void> => {
    if (!createDraft?.projectId || !createDraft.mediaAssetId) {
      return;
    }
    setActionError(null);
    try {
      const created = await createMutation.mutateAsync({
        projectId: createDraft.projectId,
        mediaAssetId: createDraft.mediaAssetId,
        longitude: position.longitude,
        latitude: position.latitude,
        ...GEO_MAP_DEFAULT_CREATE_VALUES,
      });
      setCreateDraft(null);
      setSelectedId(created.id);
    } catch {
      setActionError(t('errors.createFailed'));
    }
  };

  const handleDragged = async (id: string, position: GeoMapLngLat): Promise<void> => {
    setActionError(null);
    try {
      await updateMutation.mutateAsync({
        id,
        body: { longitude: position.longitude, latitude: position.latitude },
      });
    } catch {
      setActionError(t('errors.updateFailed'));
    }
  };

  const handleSave = async (body: UpdateGeoMapModelRequest): Promise<void> => {
    if (!selectedId) {
      return;
    }
    setActionError(null);
    await updateMutation.mutateAsync({ id: selectedId, body });
  };

  const handlePublishChange = async (isPublished: boolean): Promise<void> => {
    if (!selectedId) {
      return;
    }
    setActionError(null);
    try {
      await updateMutation.mutateAsync({ id: selectedId, body: { isPublished } });
    } catch {
      setActionError(t('errors.updateFailed'));
    }
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!pendingDelete) {
      return;
    }
    setActionError(null);
    try {
      await deleteMutation.mutateAsync(pendingDelete.id);
      if (selectedId === pendingDelete.id) {
        setSelectedId(null);
        setCreateDraft(EMPTY_CREATE_DRAFT);
      }
      setPendingDelete(null);
    } catch {
      setActionError(t('errors.deleteFailed'));
    }
  };

  if (modelsQuery.isLoading || projectsQuery.isLoading) {
    return <p className="p-6 text-sm text-ink-muted">{t('loading')}</p>;
  }

  if (modelsQuery.isError || projectsQuery.isError) {
    return (
      <p role="alert" className="p-6 text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-5rem)] flex-col lg:flex-row lg:h-[calc(100dvh-5rem)]">
      <div className="w-full shrink-0 lg:w-80 lg:min-h-0">
        <GeoMapAdminSidebar
          models={models}
          projects={projects}
          selectedId={selectedId}
          createDraft={createDraft}
          selectedModel={selectedModel}
          isCreating={createMutation.isPending}
          isSaving={updateMutation.isPending}
          isDeleting={deleteMutation.isPending}
          onSelect={selectModel}
          onStartCreate={startCreate}
          onCreateDraftChange={setCreateDraft}
          onSave={handleSave}
          onPublishChange={handlePublishChange}
          onDelete={() => {
            if (selectedModel) {
              setPendingDelete(selectedModel);
            }
          }}
          headerActions={
            <Link
              href="/admin/geo-map/lab"
              className="text-[11px] uppercase tracking-[0.12em] text-ink-muted underline-offset-4 hover:underline"
            >
              {t('labLink')}
            </Link>
          }
        />
      </div>

      <div className="relative min-h-[50vh] min-w-0 flex-1 lg:min-h-0">
        <GeoMapCanvasLazy
          objects={objects}
          editable
          className="h-full min-h-[50vh] w-full lg:min-h-full"
          onObjectClick={selectModel}
          onObjectHover={setHoveredId}
          onMapClick={(position) => {
            void handleMapClick(position);
          }}
          onObjectDragged={(id, position) => {
            void handleDragged(id, position);
          }}
        />
        {actionError ? (
          <p
            role="alert"
            className="absolute bottom-3 left-3 right-3 rounded-sm border border-danger/40 bg-surface-elevated px-3 py-2 text-sm text-danger shadow-sm lg:left-auto lg:right-3 lg:max-w-sm"
          >
            {actionError}
          </p>
        ) : null}
        {hoveredId && !selectedId ? (
          <p className="pointer-events-none absolute left-3 top-3 rounded-sm bg-surface-elevated/90 px-2 py-1 text-xs text-ink-muted">
            {t('map.hover', { id: hoveredId })}
          </p>
        ) : null}
      </div>

      <AdminDeleteModal
        open={pendingDelete !== null}
        title={t('deleteConfirmTitle')}
        message={
          pendingDelete ? t('deleteConfirmMessage', { name: pendingDelete.projectName }) : ''
        }
        confirming={deleteMutation.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
      />
    </div>
  );
};
