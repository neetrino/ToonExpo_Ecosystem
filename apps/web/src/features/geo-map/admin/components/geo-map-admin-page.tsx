'use client';

import type { AdminGeoMapModelItem, UpdateGeoMapModelRequest } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { GeoMapAdminSidebar } from '@/features/geo-map/admin/components/geo-map-admin-sidebar';
import type { GeoMapCreateDraft } from '@/features/geo-map/admin/components/geo-map-create-panel';
import type { GeoMapDragSyncedPosition } from '@/features/geo-map/admin/components/geo-map-edit-panel';
import type { GeoMapTransformDraft } from '@/features/geo-map/admin/components/geo-map-transform-fields';
import { GEO_MAP_DEFAULT_CREATE_VALUES, GEO_MAP_PREVIEW_PIN_ID } from '@/features/geo-map/admin/constants';
import { useGeoMapAddressFlyTo } from '@/features/geo-map/admin/hooks/use-geo-map-address-fly-to';
import {
  useAdminGeoMapModelsQuery,
  useCreateGeoMapModelMutation,
  useDeleteGeoMapModelMutation,
  useGeoMapAdminProjectsQuery,
  useUpdateGeoMapModelMutation,
} from '@/features/geo-map/admin/hooks/use-geo-map-admin';
import { buildGeoMapProjectOptions } from '@/features/geo-map/admin/utils/available-projects';
import { buildGeoMapPreviewObject } from '@/features/geo-map/admin/utils/build-geo-map-preview-object';
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
  OsmBuildingHideTarget,
  SelectedOsmBuilding,
} from '@/features/geo-map/types';
import type { ObjectTransformOverride } from '@/features/geo-map/utils/apply-position-override';
import { resolveStoredHideIdForPlacement } from '@/features/geo-map/utils/building-hide-identity';
import { mapAdminGeoMapItemsToObjects } from '@/features/geo-map/utils/map-object-mapper';
import {
  roundGeoMapCoordinateForApi,
  roundGeoMapLngLatForApi,
} from '@/features/geo-map/utils/round-geo-map-coordinates';
import { isValidGeoMapLngLat } from '@/features/geo-map/utils/validate-geo-map-position';
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
  searchQuery: '',
  mediaAssetId: '',
  modelUrl: '',
  fileName: '',
};

const createEmptyDraft = (): GeoMapCreateDraft => ({ ...EMPTY_CREATE_DRAFT });

const GEO_MAP_CREATE_PANEL_ID = 'geo-map-create-panel';

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
  const { viewRequest, goToAddress, isGeocoding } = useGeoMapAddressFlyTo();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createDraft, setCreateDraft] = useState<GeoMapCreateDraft>(createEmptyDraft);
  const [previewPin, setPreviewPin] = useState<GeoMapLngLat | null>(null);
  const [pendingCreateFocus, setPendingCreateFocus] = useState(false);
  const [selectedOsmBuilding, setSelectedOsmBuilding] = useState<SelectedOsmBuilding | null>(null);
  const [hiddenOsmBuildings, setHiddenOsmBuildings] = useState<OsmBuildingHideTarget[]>([]);
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
  const savedObjects = useMemo(() => mapAdminGeoMapItemsToObjects(models), [models]);
  const objects = useMemo(() => {
    if (!previewPin) {
      return savedObjects;
    }
    return [...savedObjects, buildGeoMapPreviewObject(previewPin, t('create.previewPin'))];
  }, [previewPin, savedObjects, t]);
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
    if (id === GEO_MAP_PREVIEW_PIN_ID) {
      return;
    }
    setSelectedId(id);
    setCreateDraft(createEmptyDraft());
    setPreviewPin(null);
    setSelectedOsmBuilding(null);
    setActionError(null);
    clearTransformPreview();
  };

  const placeModel = useCallback(
    async (
      position: GeoMapLngLat,
      hideKey: string | null,
      draft: GeoMapCreateDraft,
    ): Promise<void> => {
      if (!draft.mediaAssetId) {
        return;
      }
      setActionError(null);
      if (!isValidGeoMapLngLat(position)) {
        setActionError(t('errors.createFailed'));
        return;
      }
      try {
        const { longitude, latitude } = roundGeoMapLngLatForApi(position);
        const created = await createMutation.mutateAsync({
          mediaAssetId: draft.mediaAssetId,
          longitude,
          latitude,
          ...GEO_MAP_DEFAULT_CREATE_VALUES,
          ...(draft.projectId ? { projectId: draft.projectId } : {}),
          ...(hideKey ? { sourceOsmId: hideKey } : {}),
        });
        setCreateDraft(createEmptyDraft());
        setPreviewPin(null);
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
    if (!isValidGeoMapLngLat(position)) {
      return;
    }
    if (!createDraft.mediaAssetId) {
      setPreviewPin(roundGeoMapLngLatForApi(position));
      return;
    }
    void placeModel(position, null, createDraft);
  };

  const handleOsmBuildingSelect = (building: SelectedOsmBuilding): void => {
    setSelectedOsmBuilding(building);
    setActionError(null);
    if (createDraft.mediaAssetId) {
      void placeModel(
        { longitude: building.longitude, latitude: building.latitude },
        resolveStoredHideIdForPlacement({
          sourceOsmId: building.sourceOsmId,
          featureId: building.featureId,
        }),
        createDraft,
      );
    }
  };

  const handleCreateDraftChange = useCallback(
    (draft: GeoMapCreateDraft | null): void => {
      const previousAssetId = createDraft.mediaAssetId;
      const nextDraft = draft ?? createEmptyDraft();
      setCreateDraft(nextDraft);
      const nextAssetId = nextDraft.mediaAssetId;
      if (!nextAssetId || nextAssetId === previousAssetId || !selectedOsmBuilding) {
        return;
      }
      void placeModel(
        {
          longitude: selectedOsmBuilding.longitude,
          latitude: selectedOsmBuilding.latitude,
        },
        resolveStoredHideIdForPlacement({
          sourceOsmId: selectedOsmBuilding.sourceOsmId,
          featureId: selectedOsmBuilding.featureId,
        }),
        nextDraft,
      );
    },
    [createDraft.mediaAssetId, placeModel, selectedOsmBuilding],
  );

  const handleGoToAddress = (query: string): void => {
    void (async () => {
      const result = await goToAddress(query);
      if (result.status === 'not-found') {
        setActionError(t('create.geocodeNotFound'));
        return;
      }
      if (result.status === 'failed') {
        setActionError(t('create.geocodeFailed'));
        return;
      }
      setPreviewPin(result.center);
      setActionError(null);
    })();
  };

  const handlePlaceAtPreview = (): void => {
    if (!previewPin) {
      return;
    }
    void placeModel(previewPin, null, createDraft);
  };

  const handleDragged = async (id: string, position: GeoMapLngLat): Promise<void> => {
    setActionError(null);
    if (!isValidGeoMapLngLat(position)) {
      setActionError(t('errors.updateFailed'));
      return;
    }
    const rounded = roundGeoMapLngLatForApi(position);
    if (id === GEO_MAP_PREVIEW_PIN_ID) {
      setPreviewPin(rounded);
      return;
    }
    try {
      const { longitude, latitude } = rounded;
      setDragSyncedPosition((previous) => ({
        id,
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
    setCreateDraft(createEmptyDraft());
    setPreviewPin(null);
    setSelectedOsmBuilding(null);
    setActionError(null);
    setTransformPreview(null);
    setDragSyncedPosition(null);
  }, []);

  const startCreate = useCallback((): void => {
    setSelectedId(null);
    setCreateDraft(createEmptyDraft());
    setPreviewPin(null);
    setSelectedOsmBuilding(null);
    setActionError(null);
    setTransformPreview(null);
    setDragSyncedPosition(null);
    setPendingCreateFocus(true);
  }, []);

  useEffect(() => {
    if (!pendingCreateFocus) {
      return;
    }

    setPendingCreateFocus(false);
    document.getElementById(GEO_MAP_CREATE_PANEL_ID)?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
    focusGeoMapFileInput(GEO_MAP_CREATE_GLB_INPUT_ID);
  }, [pendingCreateFocus, createDraft]);

  const focusCreateUpload = useCallback((): void => {
    startCreate();
  }, [startCreate]);

  const focusCreateUploadKeepingOsm = useCallback((): void => {
    setCreateDraft((current) => current ?? createEmptyDraft());
    setPendingCreateFocus(true);
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

    const { longitude, latitude } = selectedOsmBuilding;
    const target: OsmBuildingHideTarget = {
      longitude,
      latitude,
      osmId: selectedOsmBuilding.sourceOsmId?.trim() || null,
      featureId: selectedOsmBuilding.featureId,
    };
    setHiddenOsmBuildings((current) => [...current, target]);
    setSelectedOsmBuilding(null);
    setActionError(null);
  }, [selectedOsmBuilding]);

  const adminOsmHideSession = useMemo((): AdminOsmHideSession => {
    return {
      hiddenBuildings: hiddenOsmBuildings,
    };
  }, [hiddenOsmBuildings]);

  const handleConfirmDelete = async (): Promise<void> => {
    if (!pendingDelete) {
      return;
    }
    setActionError(null);
    try {
      await deleteMutation.mutateAsync(pendingDelete.id);
      if (selectedId === pendingDelete.id) {
        setSelectedId(null);
        setCreateDraft(createEmptyDraft());
        setTransformPreview(null);
        setDragSyncedPosition(null);
      }
      setPendingDelete(null);
    } catch {
      setActionError(t('errors.deleteFailed'));
    }
  };

  const adminSelectionChrome = useMemo((): GeoMapAdminMapSelectionChromeProps | null => {
    if (selectedModel && !createDraft.mediaAssetId) {
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
          hasPreviewPin={previewPin !== null}
          isCreating={createMutation.isPending}
          isGeocoding={isGeocoding}
          isSaving={updateMutation.isPending}
          isDeleting={deleteMutation.isPending}
          dragSyncedPosition={dragSyncedPosition}
          onSelect={selectModel}
          onStartCreate={startCreate}
          onCreateDraftChange={handleCreateDraftChange}
          onGoToAddress={handleGoToAddress}
          onPlaceAtPreview={handlePlaceAtPreview}
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
          viewRequest={viewRequest}
          highlightedObjectId={selectedId ?? (previewPin ? GEO_MAP_PREVIEW_PIN_ID : null)}
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
