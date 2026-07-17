import type { MediaAssetIdInput, MediaAssetUpsertInput } from '@toonexpo/contracts';

import { serverApiRequest } from '@/lib/api/server';

import type { BuilderMutationResult } from './mutation-result';

export function addMediaAsset(companyId: string, input: MediaAssetUpsertInput) {
  void companyId;
  return serverApiRequest<BuilderMutationResult<{ mediaAssetId: string }>>('/builder/media', {
    method: 'POST',
    body: input,
  });
}

export function updateMediaAsset(
  companyId: string,
  input: MediaAssetUpsertInput & { mediaAssetId: string },
) {
  void companyId;
  return serverApiRequest<BuilderMutationResult<{ mediaAssetId: string }>>('/builder/media', {
    method: 'PATCH',
    body: input,
  });
}

export function deleteMediaAsset(companyId: string, input: MediaAssetIdInput) {
  void companyId;
  return serverApiRequest<BuilderMutationResult<{ mediaAssetId: string }>>('/builder/media', {
    method: 'DELETE',
    body: input,
  });
}
