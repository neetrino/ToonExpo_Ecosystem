import type { AdminMutationResult } from '@/lib/admin/mutation-result';
import { serverApiRequest } from '@/lib/api/server';

export type VenueMutationResult<T extends Record<string, unknown> = Record<string, never>> =
  AdminMutationResult<T>;

function mutate<T extends Record<string, unknown>>(
  action: string,
  raw: unknown,
): Promise<VenueMutationResult<T>> {
  return serverApiRequest(`/exhibition/admin/venue/${action}`, {
    method: 'POST',
    body: raw,
  });
}

export function upsertVenueMap(
  raw: unknown,
): Promise<VenueMutationResult<{ venueMapId: string; eventId: string }>> {
  return mutate('upsert-map', raw);
}

export function upsertBooth(
  raw: unknown,
): Promise<VenueMutationResult<{ boothId: string; venueMapId: string }>> {
  return mutate('upsert-booth', raw);
}

export function moveBooth(
  raw: unknown,
): Promise<VenueMutationResult<{ boothId: string; venueMapId: string }>> {
  return mutate('move-booth', raw);
}

export function deleteBooth(
  raw: unknown,
): Promise<VenueMutationResult<{ boothId: string; venueMapId: string }>> {
  return mutate('delete-booth', raw);
}
