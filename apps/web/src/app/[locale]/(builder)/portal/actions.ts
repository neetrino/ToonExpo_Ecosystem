'use server';

import { companyProfileUpdateInputSchema } from '@toonexpo/contracts';
import {
  apartmentUpsertInputSchema,
  buildingCreateInputSchema,
  buildingPublicationInputSchema,
  buildingUpdateInputSchema,
  floorCreateInputSchema,
  floorPublicationInputSchema,
  floorUpdateInputSchema,
  mediaAssetIdInputSchema,
  mediaAssetUpsertInputSchema,
  projectPublicationInputSchema,
  projectUpsertInputSchema,
} from '@toonexpo/contracts';
import { prisma } from '@toonexpo/db';
import { SUPPORTED_LOCALES } from '@toonexpo/shared';
import { revalidatePath } from 'next/cache';

import { assertBuilderSession } from '@/lib/builder/assert-builder-session';
import type { BuilderMutationErrorKey, BuilderMutationResult } from '@/lib/builder/mutations';
import {
  addMediaAsset,
  createBuilding,
  createFloor,
  createProject,
  deleteMediaAsset,
  setBuildingPublication,
  setFloorPublication,
  setProjectPublication,
  updateBuilding,
  updateCompanyProfile,
  updateFloor,
  updateMediaAsset,
  updateProject,
  upsertApartment,
} from '@/lib/builder/mutations';
import { resolveCatalogPaths } from '@/lib/shared/resolve-catalog-paths';
import { revalidateCatalogPaths } from '@/lib/shared/revalidate-catalog-paths';

export type BuilderActionResult<T extends Record<string, unknown> = Record<string, never>> =
  BuilderMutationResult<T>;

type BuilderActionFailure = { ok: false; errorKey: BuilderMutationErrorKey };

function unauthorized(): BuilderActionFailure {
  return { ok: false, errorKey: 'unauthorized' };
}

function invalidInput(): BuilderActionFailure {
  return { ok: false, errorKey: 'invalidInput' };
}

async function revalidateAfterProjectMutation(
  companyId: string,
  companySlug: string,
  projectId: string,
  projectSlug?: string,
): Promise<void> {
  const paths =
    projectSlug != null
      ? { projectId, projectSlug, companySlug }
      : await resolveCatalogPaths(companyId, { projectId });

  if (paths) {
    revalidateCatalogPaths(paths);
  } else {
    revalidateCatalogPaths({});
  }
}

async function revalidateAfterInventoryMutation(
  companyId: string,
  hint: { projectId?: string; buildingId?: string; floorId?: string },
): Promise<void> {
  const paths = await resolveCatalogPaths(companyId, hint);
  revalidateCatalogPaths(paths ?? {});
}

async function revalidateAfterCompanyProfileMutation(
  companyId: string,
  companySlug: string,
): Promise<void> {
  const projects = await prisma.project.findMany({
    where: { companyId },
    select: { slug: true },
  });

  const pathSets = projects.map((project) => ({
    companySlug,
    projectSlug: project.slug,
  }));

  revalidateCatalogPaths(pathSets.length > 0 ? pathSets : { companySlug });
  for (const locale of SUPPORTED_LOCALES) {
    revalidatePath(`/${locale}/portal/company`);
  }
}

async function revalidateAfterMediaMutation(
  companyId: string,
  hint: { projectId?: string; apartmentId?: string; mediaAssetId?: string },
): Promise<void> {
  const paths = await resolveCatalogPaths(companyId, hint);
  revalidateCatalogPaths(paths ?? {});
}

export async function createProjectAction(
  _locale: string,
  raw: unknown,
): Promise<BuilderActionResult<{ projectId: string; projectSlug: string }>> {
  const session = await assertBuilderSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = projectUpsertInputSchema.safeParse(raw);
  if (!parsed.success || parsed.data.projectId) {
    return invalidInput();
  }

  const result = await createProject(session.companyId, parsed.data);
  if (result.ok) {
    await revalidateAfterProjectMutation(
      session.companyId,
      session.companySlug,
      result.projectId,
      result.projectSlug,
    );
  }
  return result;
}

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

export async function updateProjectAction(
  _locale: string,
  raw: unknown,
): Promise<BuilderActionResult<{ projectId: string }>> {
  const session = await assertBuilderSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = projectUpsertInputSchema.safeParse(raw);
  if (!parsed.success || !parsed.data.projectId) {
    return invalidInput();
  }

  const result = await updateProject(session.companyId, {
    ...parsed.data,
    projectId: parsed.data.projectId,
  });
  if (result.ok) {
    await revalidateAfterProjectMutation(session.companyId, session.companySlug, result.projectId);
  }
  return result;
}

export async function setProjectPublicationAction(
  _locale: string,
  raw: unknown,
): Promise<BuilderActionResult<{ projectId: string }>> {
  const session = await assertBuilderSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = projectPublicationInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }

  const result = await setProjectPublication(session.companyId, parsed.data, {
    userId: session.session.user.id,
    role: session.session.user.role,
  });
  if (result.ok) {
    await revalidateAfterProjectMutation(session.companyId, session.companySlug, result.projectId);
  }
  return result;
}

export async function createBuildingAction(
  _locale: string,
  raw: unknown,
): Promise<BuilderActionResult<{ buildingId: string }>> {
  const session = await assertBuilderSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = buildingCreateInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }

  const result = await createBuilding(session.companyId, parsed.data);
  if (result.ok) {
    await revalidateAfterInventoryMutation(session.companyId, {
      projectId: parsed.data.projectId,
    });
  }
  return result;
}

export async function updateBuildingAction(
  _locale: string,
  raw: unknown,
): Promise<BuilderActionResult<{ buildingId: string }>> {
  const session = await assertBuilderSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = buildingUpdateInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }

  const result = await updateBuilding(session.companyId, parsed.data);
  if (result.ok) {
    await revalidateAfterInventoryMutation(session.companyId, {
      buildingId: parsed.data.buildingId,
    });
  }
  return result;
}

export async function createFloorAction(
  _locale: string,
  raw: unknown,
): Promise<BuilderActionResult<{ floorId: string }>> {
  const session = await assertBuilderSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = floorCreateInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }

  const result = await createFloor(session.companyId, parsed.data);
  if (result.ok) {
    await revalidateAfterInventoryMutation(session.companyId, {
      buildingId: parsed.data.buildingId,
    });
  }
  return result;
}

export async function updateFloorAction(
  _locale: string,
  raw: unknown,
): Promise<BuilderActionResult<{ floorId: string }>> {
  const session = await assertBuilderSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = floorUpdateInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }

  const result = await updateFloor(session.companyId, parsed.data);
  if (result.ok) {
    await revalidateAfterInventoryMutation(session.companyId, {
      floorId: parsed.data.floorId,
    });
  }
  return result;
}

export async function upsertApartmentAction(
  _locale: string,
  raw: unknown,
): Promise<BuilderActionResult<{ apartmentId: string }>> {
  const session = await assertBuilderSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = apartmentUpsertInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }

  const result = await upsertApartment(session.companyId, parsed.data);
  if (result.ok) {
    await revalidateAfterInventoryMutation(session.companyId, {
      floorId: parsed.data.floorId,
    });
  }
  return result;
}

export async function setBuildingPublicationAction(
  _locale: string,
  raw: unknown,
): Promise<BuilderActionResult<{ buildingId: string }>> {
  const session = await assertBuilderSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = buildingPublicationInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }

  const result = await setBuildingPublication(session.companyId, parsed.data, {
    userId: session.session.user.id,
    role: session.session.user.role,
  });
  if (result.ok) {
    await revalidateAfterInventoryMutation(session.companyId, {
      buildingId: result.buildingId,
    });
  }
  return result;
}

export async function setFloorPublicationAction(
  _locale: string,
  raw: unknown,
): Promise<BuilderActionResult<{ floorId: string }>> {
  const session = await assertBuilderSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = floorPublicationInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }

  const result = await setFloorPublication(session.companyId, parsed.data, {
    userId: session.session.user.id,
    role: session.session.user.role,
  });
  if (result.ok) {
    await revalidateAfterInventoryMutation(session.companyId, {
      floorId: result.floorId,
    });
  }
  return result;
}

export async function updateCompanyProfileAction(
  _locale: string,
  raw: unknown,
): Promise<BuilderActionResult<{ companyId: string }>> {
  const session = await assertBuilderSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = companyProfileUpdateInputSchema.safeParse(raw);
  if (!parsed.success || parsed.data.companyId) {
    return invalidInput();
  }

  const result = await updateCompanyProfile(session.companyId, parsed.data);
  if (result.ok) {
    await revalidateAfterCompanyProfileMutation(session.companyId, result.companySlug);
  }
  return result;
}

export type { BuilderMutationErrorKey };
