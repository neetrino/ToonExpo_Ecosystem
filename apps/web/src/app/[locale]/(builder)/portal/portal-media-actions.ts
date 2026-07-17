import { mediaAssetIdInputSchema, mediaAssetUpsertInputSchema } from '@toonexpo/contracts';

import { assertBuilderSession } from '@/lib/builder/assert-builder-session';
import { addMediaAsset, deleteMediaAsset, updateMediaAsset } from '@/lib/builder/mutations';

import {
  type BuilderActionResult,
  invalidInput,
  revalidateAfterMediaMutation,
  unauthorized,
} from './portal-action-shared';

export async function addMediaAssetAction(
  _locale: string,
  raw: unknown,
): Promise<BuilderActionResult<{ mediaAssetId: string }>> {
  const session = await assertBuilderSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = mediaAssetUpsertInputSchema.safeParse(raw);
  if (!parsed.success || parsed.data.mediaAssetId) {
    return invalidInput();
  }

  const result = await addMediaAsset(session.companyId, parsed.data);
  if (result.ok) {
    await revalidateAfterMediaMutation(session.companyId, {
      projectId: parsed.data.projectId,
      apartmentId: parsed.data.apartmentId,
    });
  }
  return result;
}

export async function updateMediaAssetAction(
  _locale: string,
  raw: unknown,
): Promise<BuilderActionResult<{ mediaAssetId: string }>> {
  const session = await assertBuilderSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = mediaAssetUpsertInputSchema.safeParse(raw);
  if (!parsed.success || !parsed.data.mediaAssetId) {
    return invalidInput();
  }

  const result = await updateMediaAsset(session.companyId, {
    ...parsed.data,
    mediaAssetId: parsed.data.mediaAssetId,
  });
  if (result.ok) {
    await revalidateAfterMediaMutation(session.companyId, {
      mediaAssetId: result.mediaAssetId,
    });
  }
  return result;
}

export async function deleteMediaAssetAction(
  _locale: string,
  raw: unknown,
): Promise<BuilderActionResult<{ mediaAssetId: string }>> {
  const session = await assertBuilderSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = mediaAssetIdInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }

  const result = await deleteMediaAsset(session.companyId, parsed.data);
  if (result.ok) {
    await revalidateAfterMediaMutation(session.companyId, {
      mediaAssetId: result.mediaAssetId,
    });
  }
  return result;
}
