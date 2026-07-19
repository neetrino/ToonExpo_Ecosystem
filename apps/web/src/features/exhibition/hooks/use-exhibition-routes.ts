"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RouteGraphPayload } from "@toonexpo/contracts";

import {
  getAdminVenueMapRouteGraph,
  replaceAdminVenueMapRouteGraph,
} from "@/features/exhibition/api/admin-exhibition-api";
import {
  getPublicVenueMapEntranceNodes,
  getPublicVenueMapRoute,
} from "@/features/exhibition/api/public-exhibition-api";
import {
  adminVenueMapRouteGraphQueryKey,
  publicVenueMapBoothsQueryKey,
  publicVenueMapEntranceNodesQueryKey,
} from "@/features/exhibition/constants";

export const usePublicVenueMapEntranceNodesQuery = (mapId: string) =>
  useQuery({
    queryKey: publicVenueMapEntranceNodesQueryKey(mapId),
    queryFn: () => getPublicVenueMapEntranceNodes(mapId),
    enabled: mapId.length > 0,
  });

export const usePublicVenueMapRouteQuery = (
  mapId: string,
  fromNodeId: string | null,
  toBoothId: string | null,
  enabled: boolean,
) =>
  useQuery({
    queryKey: [
      ...publicVenueMapBoothsQueryKey(mapId, "route"),
      fromNodeId,
      toBoothId,
    ],
    queryFn: () =>
      getPublicVenueMapRoute(mapId, fromNodeId ?? "", toBoothId ?? ""),
    enabled:
      enabled &&
      mapId.length > 0 &&
      Boolean(fromNodeId) &&
      Boolean(toBoothId),
  });

export const useAdminVenueMapRouteGraphQuery = (mapId: string) =>
  useQuery({
    queryKey: adminVenueMapRouteGraphQueryKey(mapId),
    queryFn: () => getAdminVenueMapRouteGraph(mapId),
    enabled: mapId.length > 0,
  });

export const useReplaceAdminRouteGraphMutation = (mapId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: RouteGraphPayload) =>
      replaceAdminVenueMapRouteGraph(mapId, body),
    onSuccess: (graph) => {
      queryClient.setQueryData(adminVenueMapRouteGraphQueryKey(mapId), graph);
    },
  });
};
