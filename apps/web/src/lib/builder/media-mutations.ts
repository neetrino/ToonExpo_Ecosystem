import type { MediaAssetIdInput, MediaAssetUpsertInput } from '@toonexpo/contracts';

import { apiRequest } from '@/lib/api/client';

import type { BuilderMutationResult } from './mutation-result';

export function addMediaAsset(companyId: string, input: MediaAssetUpsertInput) {
  void companyId;
  return apiRequest<BuilderMutationResult<{ mediaAssetId: string }>>('/builder/media', {
    method: 'POST',
    body: input,
  });
}

export function updateMediaAsset(
  companyId: string,
  input: MediaAssetUpsertInput & { mediaAssetId: string },
) {
  void companyId;
  return apiRequest<BuilderMutationResult<{ mediaAssetId: string }>>('/builder/media', {
    method: 'PATCH',
    body: input,
  });
}

export function deleteMediaAsset(companyId: string, input: MediaAssetIdInput) {
  void companyId;
  return apiRequest<BuilderMutationResult<{ mediaAssetId: string }>>('/builder/media', {
    method: 'DELETE',
    body: input,
  });
}
