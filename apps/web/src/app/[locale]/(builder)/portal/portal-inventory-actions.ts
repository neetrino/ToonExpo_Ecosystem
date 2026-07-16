'use server';

import {
  apartmentUpsertInputSchema,
  buildingCreateInputSchema,
  buildingPublicationInputSchema,
  buildingUpdateInputSchema,
  floorCreateInputSchema,
  floorPublicationInputSchema,
  floorUpdateInputSchema,
} from '@toonexpo/contracts';

import { assertBuilderSession } from '@/lib/builder/assert-builder-session';
import {
  createBuilding,
  createFloor,
  setBuildingPublication,
  setFloorPublication,
  updateBuilding,
  updateFloor,
  upsertApartment,
} from '@/lib/builder/mutations';

import {
  type BuilderActionResult,
  invalidInput,
  revalidateAfterInventoryMutation,
  unauthorized,
} from './portal-action-shared';

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

  const result = await upsertApartment(session.companyId, parsed.data, session.session.user.id);
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
