'use client';

import type { AdminGeoMapModelItem, UpdateGeoMapModelRequest } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';

import { GeoMapAdminSidebar } from '@/features/geo-map/admin/components/geo-map-admin-sidebar';
import type { GeoMapCreateDraft } from '@/features/geo-map/admin/components/geo-map-create-panel';
import type { GeoMapDragSyncedPosition } from '@/features/geo-map/admin/components/geo-map-edit-panel';
import type { GeoMapTransformDraft } from '@/features/geo-map/admin/components/geo-map-transform-fields';
import { GEO_MAP_DEFAULT_CREATE_VALUES } from '@/features/geo-map/admin/constants';
import {
  useAdminGeoMapModelsQuery,
  useCreateGeoMapModelMutation,
  useDeleteGeoMapModelMutation,
  useGeoMapAdminProjectsQuery,
  useUpdateGeoMapModelMutation,
} from '@/features/geo-map/admin/hooks/use-geo-map-admin';
import { buildGeoMapProjectOptions } from '@/features/geo-map/admin/utils/available-projects';
import {
  focusGeoMapFileInput,
  GEO_MAP_CREATE_GLB_INPUT_ID,
  GEO_MAP_REPLACE_GLB_INPUT_ID,
} from '@/features/geo-map/admin/utils/focus-geo-map-file-input';
import { GeoMapCanvasLazy } from '@/features/geo-map/components/geo-map-canvas-lazy';
import type {
  AdminOsmHideSession,
  GeoMapLngLat,
  GeoMapAdminMapSelectionChromeProps,
  SelectedOsmBuilding,
} from '@/features/geo-map/types';
import type { ObjectTransformOverride } from '@/features/geo-map/utils/apply-position-override';
import { mapAdminGeoMapItemsToObjects } from '@/features/geo-map/utils/map-object-mapper';
import {
  roundGeoMapCoordinateForApi,
  roundGeoMapLngLatForApi,
} from '@/features/geo-map/utils/round-geo-map-coordinates';
import { Link } from '@/i18n/navigation';
import { AdminDeleteModal } from '@/shared/ui/admin-delete-modal';

const modelToLngLat = (model: AdminGeoMapModelItem): GeoMapLngLat => ({
  longitude: Number(model.longitude),
  latitude: Number(model.latitude),
});

const draftToTransformOverride = (
  modelId: string,
  draft: GeoMapTransformDraft,
): ObjectTransformOverride => ({
  id: modelId,
  longitude: draft.longitude,
  latitude: draft.latitude,
  altitudeM: draft.altitudeM,
  headingDeg: draft.headingDeg,
  pitchDeg: draft.pitchDeg,
  rollDeg: draft.rollDeg,
  scale: draft.scale,
  minZoom: draft.minZoom,
});

const resolveSelectionAnchor = (
  model: AdminGeoMapModelItem,
  preview: ObjectTransformOverride | null,
): GeoMapLngLat => {
  if (preview && preview.id === model.id) {
    return {
      longitude: preview.longitude ?? Number(model.longitude),
      latitude: preview.latitude ?? Number(model.latitude),
    };
  }
  return modelToLngLat(model);
};

const focusSidebarSelect = (id: string): void => {
  queueMicrotask(() => {
    requestAnimationFrame(() => {
      const element = document.getElementById(id);
      if (element instanceof HTMLElement) {
        element.focus();
      }
    });
  });
};

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
  const [createDraft, setCreateDraft] = useState<GeoMapCreateDraft | null>(EMPTY_CREATE_DRAFT);
  const [selectedOsmBuilding, setSelectedOsmBuilding] = useState<SelectedOsmBuilding | null>(null);
  const [hiddenOsmIds, setHiddenOsmIds] = useState<string[]>([]);
  const [hiddenOsmCentroidsWithoutId, setHiddenOsmCentroidsWithoutId] = useState<GeoMapLngLat[]>(
    [],
  );
  const [pendingDelete, setPendingDelete] = useState<AdminGeoMapModelItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [transformPreview, setTransformPreview] = useState<ObjectTransformOverride | null>(null);
  const [dragSyncedPosition, setDragSyncedPosition] = useState<GeoMapDragSyncedPosition | null>(
    null,
  );

  const models = modelsQuery.data?.data ?? [];
  const projects = useMemo(
    () => buildGeoMapProjectOptions(projectsQuery.data?.data ?? [], models),
    [projectsQuery.data, models],
  );
  const objects = useMemo(() => mapAdminGeoMapItemsToObjects(models), [models]);
  const selectedModel = models.find((model) => model.id === selectedId) ?? null;

  const handleTransformPreview = useCallback(
    (draft: GeoMapTransformDraft): void => {
      if (!selectedId) {
        setTransformPreview(null);
        return;
      }
      setTransformPreview(draftToTransformOverride(selectedId, draft));
    },
    [selectedId],
  );

  const clearTransformPreview = useCallback((): void => {
    setTransformPreview(null);
    setDragSyncedPosition(null);
  }, []);

  const selectModel = (id: string): void => {
    setSelectedId(id);
    setCreateDraft(null);
    setSelectedOsmBuilding(null);
    setActionError(null);
    clearTransformPreview();
  };

  const placeModel = useCallback(
    async (
      position: GeoMapLngLat,
      sourceOsmId: string | null,
      draft: GeoMapCreateDraft,
    ): Promise<void> => {
      if (!draft.mediaAssetId) {
        return;
      }
      setActionError(null);
      try {
        const { longitude, latitude } = roundGeoMapLngLatForApi(position);
        const created = await createMutation.mutateAsync({
          mediaAssetId: draft.mediaAssetId,
          longitude,
          latitude,
          ...GEO_MAP_DEFAULT_CREATE_VALUES,
          ...(draft.projectId ? { projectId: draft.projectId } : {}),
          ...(sourceOsmId ? { sourceOsmId } : {}),
        });
        setCreateDraft(null);
        setSelectedOsmBuilding(null);
        setTransformPreview(null);
        setDragSyncedPosition(null);
        setSelectedId(created.id);
      } catch {
        setActionError(t('errors.createFailed'));
      }
    },
    [createMutation, t],
  );

  const handleMapClick = (position: GeoMapLngLat): void => {
    if (!createDraft) {
      return;
    }
    void placeModel(position, null, createDraft);
  };

  const handleOsmBuildingSelect = (building: SelectedOsmBuilding): void => {
    setSelectedOsmBuilding(building);
    setActionError(null);
    if (createDraft?.mediaAssetId) {
      void placeModel(
        { longitude: building.longitude, latitude: building.latitude },
        building.sourceOsmId,
        createDraft,
      );
    }
  };

  const handleCreateDraftChange = useCallback(
    (draft: GeoMapCreateDraft | null): void => {
      const previousAssetId = createDraft?.mediaAssetId ?? '';
      setCreateDraft(draft);
      const nextAssetId = draft?.mediaAssetId ?? '';
      if (!nextAssetId || nextAssetId === previousAssetId || !selectedOsmBuilding || !draft) {
        return;
      }
      void placeModel(
        {
          longitude: selectedOsmBuilding.longitude,
          latitude: selectedOsmBuilding.latitude,
        },
        selectedOsmBuilding.sourceOsmId,
        draft,
      );
    },
    [createDraft?.mediaAssetId, placeModel, selectedOsmBuilding],
  );

  const handleDragged = async (id: string, position: GeoMapLngLat): Promise<void> => {
    setActionError(null);
    try {
      const { longitude, latitude } = roundGeoMapLngLatForApi(position);
      setDragSyncedPosition((previous) => ({
        longitude,
        latitude,
        token: (previous?.token ?? 0) + 1,
      }));
      setTransformPreview((previous) =>
        previous && previous.id === id ? { ...previous, longitude, latitude } : previous,
      );
      await updateMutation.mutateAsync({
        id,
        body: { longitude, latitude },
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
    await updateMutation.mutateAsync({
      id: selectedId,
      body: {
        ...body,
        ...(body.longitude !== undefined
          ? { longitude: roundGeoMapCoordinateForApi(body.longitude) }
          : {}),
        ...(body.latitude !== undefined
          ? { latitude: roundGeoMapCoordinateForApi(body.latitude) }
          : {}),
      },
    });
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

  const handleReplaceModel = async (mediaAssetId: string): Promise<void> => {
    if (!selectedId) {
      return;
    }
    setActionError(null);
    try {
      await updateMutation.mutateAsync({ id: selectedId, body: { mediaAssetId } });
    } catch {
      setActionError(t('errors.updateFailed'));
      throw new Error('replace-failed');
    }
  };

  const handleAttachProject = async (projectId: string): Promise<void> => {
    if (!selectedId) {
      return;
    }
    setActionError(null);
    try {
      await updateMutation.mutateAsync({ id: selectedId, body: { projectId } });
    } catch {
      setActionError(t('errors.updateFailed'));
      throw new Error('attach-failed');
    }
  };

  const requestDelete = useCallback((model: AdminGeoMapModelItem): void => {
    setPendingDelete(model);
  }, []);

  const clearSelection = useCallback((): void => {
    setSelectedId(null);
    setCreateDraft(EMPTY_CREATE_DRAFT);
    setSelectedOsmBuilding(null);
    setActionError(null);
    setTransformPreview(null);
    setDragSyncedPosition(null);
  }, []);

  const startCreate = useCallback((): void => {
    setSelectedId(null);
    setCreateDraft(EMPTY_CREATE_DRAFT);
    setSelectedOsmBuilding(null);
    setActionError(null);
    setTransformPreview(null);
    setDragSyncedPosition(null);
  }, []);

  const focusCreateUpload = useCallback((): void => {
    startCreate();
    focusGeoMapFileInput(GEO_MAP_CREATE_GLB_INPUT_ID);
  }, [startCreate]);

  const focusCreateUploadKeepingOsm = useCallback((): void => {
    setCreateDraft((current) => current ?? EMPTY_CREATE_DRAFT);
    focusGeoMapFileInput(GEO_MAP_CREATE_GLB_INPUT_ID);
  }, []);

  const focusReplaceUpload = useCallback((): void => {
    focusGeoMapFileInput(GEO_MAP_REPLACE_GLB_INPUT_ID);
  }, []);

  const focusAttachProject = useCallback((): void => {
    focusSidebarSelect('geo-map-attach-project');
  }, []);

  const handleMapDeleteModel = useCallback((): void => {
    if (selectedModel) {
      requestDelete(selectedModel);
    }
  }, [requestDelete, selectedModel]);

  const handleHideOsmBuilding = useCallback((): void => {
    if (!selectedOsmBuilding) {
      return;
    }
    const trimmedId = selectedOsmBuilding.sourceOsmId?.trim();
    if (trimmedId) {
      setHiddenOsmIds((current) =>
        current.includes(trimmedId) ? current : [...current, trimmedId],
      );
    } else {
      const { longitude, latitude } = selectedOsmBuilding;
      setHiddenOsmCentroidsWithoutId((current) => [...current, { longitude, latitude }]);
    }
    setSelectedOsmBuilding(null);
    setActionError(null);
  }, [selectedOsmBuilding]);

  const adminOsmHideSession = useMemo((): AdminOsmHideSession => {
    return {
      hiddenOsmIds,
      hiddenCentroidsWithoutId: hiddenOsmCentroidsWithoutId,
    };
  }, [hiddenOsmIds, hiddenOsmCentroidsWithoutId]);

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
        setTransformPreview(null);
        setDragSyncedPosition(null);
      }
      setPendingDelete(null);
    } catch {
      setActionError(t('errors.deleteFailed'));
    }
  };

  const adminSelectionChrome = useMemo((): GeoMapAdminMapSelectionChromeProps | null => {
    if (selectedModel && createDraft === null) {
      return {
        anchor: resolveSelectionAnchor(selectedModel, transformPreview),
        kind: 'model',
        title: selectedModel.projectName ?? selectedModel.mediaTitle ?? t('list.unassigned'),
        showAttachProject: !selectedModel.projectId,
        isDeleting: deleteMutation.isPending,
        onClearSelection: clearSelection,
        onDeleteModel: handleMapDeleteModel,
        onHideOsmBuilding: () => undefined,
        onFocusCreateUpload: focusCreateUpload,
        onFocusReplaceUpload: focusReplaceUpload,
        onFocusAttachProject: focusAttachProject,
      };
    }

    if (selectedOsmBuilding) {
      return {
        anchor: {
          longitude: selectedOsmBuilding.longitude,
          latitude: selectedOsmBuilding.latitude,
        },
        kind: 'osm',
        title: t('map.osmBuilding'),
        showAttachProject: false,
        isDeleting: false,
        onClearSelection: clearSelection,
        onDeleteModel: () => undefined,
        onHideOsmBuilding: handleHideOsmBuilding,
        onFocusCreateUpload: focusCreateUploadKeepingOsm,
        onFocusReplaceUpload: focusReplaceUpload,
        onFocusAttachProject: focusAttachProject,
      };
    }

    return null;
  }, [
    selectedModel,
    createDraft,
    selectedOsmBuilding,
    transformPreview,
    deleteMutation.isPending,
    t,
    clearSelection,
    handleMapDeleteModel,
    handleHideOsmBuilding,
    focusCreateUpload,
    focusCreateUploadKeepingOsm,
    focusReplaceUpload,
    focusAttachProject,
  ]);

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
    <div className="geo-map-admin-page">
      <div className="geo-map-admin-page__sidebar">
        <GeoMapAdminSidebar
          models={models}
          projects={projects}
          selectedId={selectedId}
          createDraft={createDraft}
          selectedModel={selectedModel}
          hasOsmSelection={selectedOsmBuilding !== null}
          isCreating={createMutation.isPending}
          isSaving={updateMutation.isPending}
          isDeleting={deleteMutation.isPending}
          dragSyncedPosition={dragSyncedPosition}
          onSelect={selectModel}
          onStartCreate={startCreate}
          onCreateDraftChange={handleCreateDraftChange}
          onTransformPreview={handleTransformPreview}
          onSave={handleSave}
          onPublishChange={handlePublishChange}
          onReplaceModel={handleReplaceModel}
          onAttachProject={handleAttachProject}
          onDelete={() => {
            if (selectedModel) {
              requestDelete(selectedModel);
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

      <div className="geo-map-admin-page__map">
        <GeoMapCanvasLazy
          objects={objects}
          editable
          highlightedObjectId={selectedId}
          transformOverride={transformPreview}
          selectedOsmBuilding={selectedOsmBuilding}
          adminSelectionChrome={adminSelectionChrome}
          adminOsmHideSession={adminOsmHideSession}
          className="absolute inset-0 h-full w-full"
          onObjectClick={selectModel}
          onOsmBuildingSelect={handleOsmBuildingSelect}
          onMapClick={handleMapClick}
          onObjectDragged={(id, position) => {
            void handleDragged(id, position);
          }}
        />
        {actionError ? (
          <p
            role="alert"
            className="absolute bottom-16 left-3 right-3 rounded-sm border border-danger/40 bg-surface-elevated px-3 py-2 text-sm text-danger shadow-sm lg:left-auto lg:right-3 lg:max-w-sm"
          >
            {actionError}
          </p>
        ) : null}
      </div>

      <AdminDeleteModal
        open={pendingDelete !== null}
        title={t('deleteConfirmTitle')}
        message={
          pendingDelete
            ? t('deleteConfirmMessage', {
                name: pendingDelete.projectName ?? pendingDelete.mediaTitle ?? t('list.unassigned'),
              })
            : ''
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
