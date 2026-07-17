import { assertAdminSession } from '@/lib/admin/assert-admin-session';
import type { AdminMutationErrorKey, AdminMutationResult } from '@/lib/admin/mutation-result';
import {
  deleteBooth,
  moveBooth,
  upsertBooth,
  upsertVenueMap,
} from '@/lib/exhibition/venue-mutations';
import {
  deleteVenuePathEdge,
  deleteVenuePathNode,
  setVenueEntrance,
  upsertVenuePathEdge,
  upsertVenuePathNode,
} from '@/lib/exhibition/venue-path-mutations';

export type VenueActionResult<T extends Record<string, unknown> = Record<string, never>> =
  AdminMutationResult<T>;

function unauthorized(): { ok: false; errorKey: AdminMutationErrorKey } {
  return { ok: false, errorKey: 'unauthorized' };
}

function revalidateVenuePaths(..._args: unknown[]): void {
  void _args;
}

export async function upsertVenueMapAction(
  locale: string,
  eventId: string,
  raw: unknown,
): Promise<VenueActionResult<{ venueMapId: string; eventId: string }>> {
  const session = await assertAdminSession();
  if (!session) {
    return unauthorized();
  }

  const base = raw && typeof raw === 'object' ? raw : {};
  const result = await upsertVenueMap({ ...base, eventId });
  if (result.ok) {
    revalidateVenuePaths(locale, eventId);
  }
  return result;
}

export async function setVenueEntranceAction(
  locale: string,
  eventId: string,
  raw: unknown,
): Promise<VenueActionResult<{ venueMapId: string }>> {
  const session = await assertAdminSession();
  if (!session) {
    return unauthorized();
  }

  const result = await setVenueEntrance(raw);
  if (result.ok) {
    revalidateVenuePaths(locale, eventId);
  }
  return result;
}

export async function upsertBoothAction(
  locale: string,
  eventId: string,
  raw: unknown,
): Promise<VenueActionResult<{ boothId: string; venueMapId: string }>> {
  const session = await assertAdminSession();
  if (!session) {
    return unauthorized();
  }

  const result = await upsertBooth(raw);
  if (result.ok) {
    revalidateVenuePaths(locale, eventId);
  }
  return result;
}

export async function moveBoothAction(
  locale: string,
  eventId: string,
  raw: unknown,
): Promise<VenueActionResult<{ boothId: string; venueMapId: string }>> {
  const session = await assertAdminSession();
  if (!session) {
    return unauthorized();
  }

  const result = await moveBooth(raw);
  if (result.ok) {
    revalidateVenuePaths(locale, eventId);
  }
  return result;
}

export async function deleteBoothAction(
  locale: string,
  eventId: string,
  raw: unknown,
): Promise<VenueActionResult<{ boothId: string; venueMapId: string }>> {
  const session = await assertAdminSession();
  if (!session) {
    return unauthorized();
  }

  const result = await deleteBooth(raw);
  if (result.ok) {
    revalidateVenuePaths(locale, eventId);
  }
  return result;
}

export async function upsertVenuePathNodeAction(
  locale: string,
  eventId: string,
  raw: unknown,
): Promise<VenueActionResult<{ nodeId: string; venueMapId: string }>> {
  const session = await assertAdminSession();
  if (!session) {
    return unauthorized();
  }

  const result = await upsertVenuePathNode(raw);
  if (result.ok) {
    revalidateVenuePaths(locale, eventId);
  }
  return result;
}

export async function deleteVenuePathNodeAction(
  locale: string,
  eventId: string,
  raw: unknown,
): Promise<VenueActionResult<{ nodeId: string; venueMapId: string }>> {
  const session = await assertAdminSession();
  if (!session) {
    return unauthorized();
  }

  const result = await deleteVenuePathNode(raw);
  if (result.ok) {
    revalidateVenuePaths(locale, eventId);
  }
  return result;
}

export async function upsertVenuePathEdgeAction(
  locale: string,
  eventId: string,
  raw: unknown,
): Promise<VenueActionResult<{ edgeId: string; venueMapId: string }>> {
  const session = await assertAdminSession();
  if (!session) {
    return unauthorized();
  }

  const result = await upsertVenuePathEdge(raw);
  if (result.ok) {
    revalidateVenuePaths(locale, eventId);
  }
  return result;
}

export async function deleteVenuePathEdgeAction(
  locale: string,
  eventId: string,
  raw: unknown,
): Promise<VenueActionResult<{ edgeId: string; venueMapId: string }>> {
  const session = await assertAdminSession();
  if (!session) {
    return unauthorized();
  }

  const result = await deleteVenuePathEdge(raw);
  if (result.ok) {
    revalidateVenuePaths(locale, eventId);
  }
  return result;
}
