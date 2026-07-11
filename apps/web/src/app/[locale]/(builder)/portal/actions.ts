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
import { revalidatePath } from 'next/cache';

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

export type BuilderActionResult<T extends Record<string, unknown> = Record<string, never>> =
  BuilderMutationResult<T>;

type BuilderActionFailure = { ok: false; errorKey: BuilderMutationErrorKey };

function revalidateBuilderPaths(locale: string): void {
  revalidatePath(`/${locale}/portal`);
  revalidatePath(`/${locale}/portal/projects`);
  revalidatePath(`/${locale}/projects`);
}

function unauthorized(): BuilderActionFailure {
  return { ok: false, errorKey: 'unauthorized' };
}

function invalidInput(): BuilderActionFailure {
  return { ok: false, errorKey: 'invalidInput' };
}

export async function createProjectAction(
  locale: string,
  raw: unknown,
): Promise<BuilderActionResult<{ projectId: string }>> {
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
    revalidateBuilderPaths(locale);
  }
  return result;
}

export async function updateProjectAction(
  locale: string,
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
    revalidateBuilderPaths(locale);
  }
  return result;
}

export async function setProjectPublicationAction(
  locale: string,
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

  const result = await setProjectPublication(session.companyId, parsed.data);
  if (result.ok) {
    revalidateBuilderPaths(locale);
  }
  return result;
}

export async function createBuildingAction(
  locale: string,
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
    revalidateBuilderPaths(locale);
  }
  return result;
}

export async function updateBuildingAction(
  locale: string,
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
    revalidateBuilderPaths(locale);
  }
  return result;
}

export async function createFloorAction(
  locale: string,
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
    revalidateBuilderPaths(locale);
  }
  return result;
}

export async function updateFloorAction(
  locale: string,
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
    revalidateBuilderPaths(locale);
  }
  return result;
}

export async function upsertApartmentAction(
  locale: string,
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
    revalidateBuilderPaths(locale);
  }
  return result;
}

export type { BuilderMutationErrorKey };
