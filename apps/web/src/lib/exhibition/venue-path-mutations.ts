import type { AdminMutationResult } from '@/lib/admin/mutation-result';
import { apiRequest } from '@/lib/api/client';

type PathMutationResult<T extends Record<string, unknown> = Record<string, never>> =
  AdminMutationResult<T>;

export function normalizeEdgeNodeIds(fromNodeId: string, toNodeId: string): [string, string] {
  return fromNodeId < toNodeId ? [fromNodeId, toNodeId] : [toNodeId, fromNodeId];
}

function mutate<T extends Record<string, unknown>>(
  action: string,
  raw: unknown,
): Promise<PathMutationResult<T>> {
  return apiRequest(`/exhibition/admin/venue/${action}`, {
    method: 'POST',
    body: raw,
  });
}

export function setVenueEntrance(
  raw: unknown,
): Promise<PathMutationResult<{ venueMapId: string }>> {
  return mutate('set-entrance', raw);
}

export function upsertVenuePathNode(
  raw: unknown,
): Promise<PathMutationResult<{ nodeId: string; venueMapId: string }>> {
  return mutate('upsert-node', raw);
}

export function deleteVenuePathNode(
  raw: unknown,
): Promise<PathMutationResult<{ nodeId: string; venueMapId: string }>> {
  return mutate('delete-node', raw);
}

export function upsertVenuePathEdge(
  raw: unknown,
): Promise<PathMutationResult<{ edgeId: string; venueMapId: string }>> {
  return mutate('upsert-edge', raw);
}

export function deleteVenuePathEdge(
  raw: unknown,
): Promise<PathMutationResult<{ edgeId: string; venueMapId: string }>> {
  return mutate('delete-edge', raw);
}

export async function ensureBoothPathNode(): Promise<void> {
  // Booth-node synchronization is owned by the Nest venue mutation.
}
