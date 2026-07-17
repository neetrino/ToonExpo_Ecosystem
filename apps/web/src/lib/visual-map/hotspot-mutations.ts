import type { HotspotMoveInput, HotspotUpsertInput } from '@toonexpo/contracts';

import { apiRequest } from '@/lib/api/client';

import type { VisualMapMutationResult } from './mutation-result';

function mutate(
  action: string,
  companyId: string,
  input: unknown,
): Promise<VisualMapMutationResult<{ hotspotId: string; projectId: string }>> {
  return apiRequest(`/visual-map/builder/actions/${action}`, {
    method: 'POST',
    body: { companyId, input },
  });
}

export function createHotspot(companyId: string, input: HotspotUpsertInput) {
  return mutate('create-hotspot', companyId, input);
}

export function updateHotspot(companyId: string, input: HotspotUpsertInput) {
  return mutate('update-hotspot', companyId, input);
}

export function moveHotspot(companyId: string, input: HotspotMoveInput) {
  return mutate('move-hotspot', companyId, input);
}

export function archiveHotspot(companyId: string, hotspotId: string) {
  return mutate('archive-hotspot', companyId, { hotspotId });
}

export function restoreHotspot(companyId: string, hotspotId: string) {
  return mutate('restore-hotspot', companyId, { hotspotId });
}

export const deleteHotspot = archiveHotspot;
