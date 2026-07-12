'use server';

import {
  apartmentUpsertInputSchema,
  buildingCreateInputSchema,
  buildingUpdateInputSchema,
  floorCreateInputSchema,
  floorUpdateInputSchema,
  projectPublicationInputSchema,
  projectUpsertInputSchema,
} from '@toonexpo/contracts';

import { assertBuilderSession } from '@/lib/builder/assert-builder-session';
import type { BuilderMutationErrorKey, BuilderMutationResult } from '@/lib/builder/mutations';
import {
  createBuilding,
  createFloor,
  createProject,
  setProjectPublication,
  updateBuilding,
  updateFloor,
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

export type { BuilderMutationErrorKey };
