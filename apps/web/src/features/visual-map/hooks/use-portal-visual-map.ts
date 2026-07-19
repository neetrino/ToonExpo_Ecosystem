'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreatePortalVisualCanvasRequest,
  CreatePortalVisualHotspotRequest,
  UpdatePortalVisualCanvasRequest,
  UpdatePortalVisualHotspotRequest,
} from '@toonexpo/contracts';

import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import {
  createPortalVisualCanvas,
  createPortalVisualHotspot,
  deletePortalVisualCanvas,
  deletePortalVisualHotspot,
  getPortalVisualCanvas,
  listPortalProjectVisualCanvases,
  updatePortalVisualCanvas,
  updatePortalVisualHotspot,
} from '@/features/visual-map/api/portal-visual-map-api';
import {
  portalProjectVisualCanvasesQueryKey,
  portalVisualCanvasQueryKey,
} from '@/features/visual-map/constants';

export const usePortalProjectVisualCanvasesQuery = (projectId: string) => {
  const scope = useCatalogScope();
  return useQuery({
    queryKey: [...portalProjectVisualCanvasesQueryKey(projectId), scope],
    queryFn: () => listPortalProjectVisualCanvases(projectId, { scope }),
    enabled: projectId.length > 0,
  });
};

export const usePortalVisualCanvasQuery = (canvasId: string) => {
  const scope = useCatalogScope();
  return useQuery({
    queryKey: [...portalVisualCanvasQueryKey(canvasId), scope],
    queryFn: () => getPortalVisualCanvas(canvasId, { scope }),
    enabled: canvasId.length > 0,
  });
};

export const useCreatePortalVisualCanvasMutation = (projectId: string) => {
  const queryClient = useQueryClient();
  const scope = useCatalogScope();

  return useMutation({
    mutationFn: (body: CreatePortalVisualCanvasRequest) =>
      createPortalVisualCanvas(projectId, body, { scope }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: portalProjectVisualCanvasesQueryKey(projectId),
      });
    },
  });
};

export const useUpdatePortalVisualCanvasMutation = (projectId: string, canvasId: string) => {
  const queryClient = useQueryClient();
  const scope = useCatalogScope();

  return useMutation({
    mutationFn: (body: UpdatePortalVisualCanvasRequest) =>
      updatePortalVisualCanvas(canvasId, body, { scope }),
    onSuccess: (canvas) => {
      queryClient.setQueryData([...portalVisualCanvasQueryKey(canvasId), scope], canvas);
      void queryClient.invalidateQueries({
        queryKey: portalProjectVisualCanvasesQueryKey(projectId),
      });
    },
  });
};

export const useDeletePortalVisualCanvasMutation = (projectId: string) => {
  const queryClient = useQueryClient();
  const scope = useCatalogScope();

  return useMutation({
    mutationFn: (canvasId: string) => deletePortalVisualCanvas(canvasId, { scope }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: portalProjectVisualCanvasesQueryKey(projectId),
      });
    },
  });
};

export const useCreatePortalVisualHotspotMutation = (projectId: string, canvasId: string) => {
  const queryClient = useQueryClient();
  const scope = useCatalogScope();

  return useMutation({
    mutationFn: (body: CreatePortalVisualHotspotRequest) =>
      createPortalVisualHotspot(canvasId, body, { scope }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: portalVisualCanvasQueryKey(canvasId),
      });
      void queryClient.invalidateQueries({
        queryKey: portalProjectVisualCanvasesQueryKey(projectId),
      });
    },
  });
};

export const useUpdatePortalVisualHotspotMutation = (projectId: string, canvasId: string) => {
  const queryClient = useQueryClient();
  const scope = useCatalogScope();

  return useMutation({
    mutationFn: ({
      hotspotId,
      body,
    }: {
      hotspotId: string;
      body: UpdatePortalVisualHotspotRequest;
    }) => updatePortalVisualHotspot(canvasId, hotspotId, body, { scope }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: portalVisualCanvasQueryKey(canvasId),
      });
      void queryClient.invalidateQueries({
        queryKey: portalProjectVisualCanvasesQueryKey(projectId),
      });
    },
  });
};

export const useDeletePortalVisualHotspotMutation = (projectId: string, canvasId: string) => {
  const queryClient = useQueryClient();
  const scope = useCatalogScope();

  return useMutation({
    mutationFn: (hotspotId: string) => deletePortalVisualHotspot(canvasId, hotspotId, { scope }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: portalVisualCanvasQueryKey(canvasId),
      });
      void queryClient.invalidateQueries({
        queryKey: portalProjectVisualCanvasesQueryKey(projectId),
      });
    },
  });
};
