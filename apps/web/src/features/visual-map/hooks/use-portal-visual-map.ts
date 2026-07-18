"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreatePortalVisualCanvasRequest,
  CreatePortalVisualHotspotRequest,
  UpdatePortalVisualCanvasRequest,
  UpdatePortalVisualHotspotRequest,
} from "@toonexpo/contracts";

import {
  createPortalVisualCanvas,
  createPortalVisualHotspot,
  deletePortalVisualCanvas,
  deletePortalVisualHotspot,
  getPortalVisualCanvas,
  listPortalProjectVisualCanvases,
  updatePortalVisualCanvas,
  updatePortalVisualHotspot,
} from "@/features/visual-map/api/portal-visual-map-api";
import {
  portalProjectVisualCanvasesQueryKey,
  portalVisualCanvasQueryKey,
} from "@/features/visual-map/constants";

export const usePortalProjectVisualCanvasesQuery = (projectId: string) =>
  useQuery({
    queryKey: portalProjectVisualCanvasesQueryKey(projectId),
    queryFn: () => listPortalProjectVisualCanvases(projectId),
    enabled: projectId.length > 0,
  });

export const usePortalVisualCanvasQuery = (canvasId: string) =>
  useQuery({
    queryKey: portalVisualCanvasQueryKey(canvasId),
    queryFn: () => getPortalVisualCanvas(canvasId),
    enabled: canvasId.length > 0,
  });

export const useCreatePortalVisualCanvasMutation = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreatePortalVisualCanvasRequest) =>
      createPortalVisualCanvas(projectId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: portalProjectVisualCanvasesQueryKey(projectId),
      });
    },
  });
};

export const useUpdatePortalVisualCanvasMutation = (
  projectId: string,
  canvasId: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdatePortalVisualCanvasRequest) =>
      updatePortalVisualCanvas(canvasId, body),
    onSuccess: (canvas) => {
      queryClient.setQueryData(portalVisualCanvasQueryKey(canvasId), canvas);
      void queryClient.invalidateQueries({
        queryKey: portalProjectVisualCanvasesQueryKey(projectId),
      });
    },
  });
};

export const useDeletePortalVisualCanvasMutation = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (canvasId: string) => deletePortalVisualCanvas(canvasId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: portalProjectVisualCanvasesQueryKey(projectId),
      });
    },
  });
};

export const useCreatePortalVisualHotspotMutation = (
  projectId: string,
  canvasId: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreatePortalVisualHotspotRequest) =>
      createPortalVisualHotspot(canvasId, body),
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

export const useUpdatePortalVisualHotspotMutation = (
  projectId: string,
  canvasId: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      hotspotId,
      body,
    }: {
      hotspotId: string;
      body: UpdatePortalVisualHotspotRequest;
    }) => updatePortalVisualHotspot(canvasId, hotspotId, body),
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

export const useDeletePortalVisualHotspotMutation = (
  projectId: string,
  canvasId: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (hotspotId: string) =>
      deletePortalVisualHotspot(canvasId, hotspotId),
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
