'use server';

import { revalidatePath } from 'next/cache';

import { assertAdminSession } from '@/lib/admin/assert-admin-session';
import type { AdminMutationErrorKey, AdminMutationResult } from '@/lib/admin/mutation-result';
import {
  deleteBooth,
  moveBooth,
  upsertBooth,
  upsertVenueMap,
} from '@/lib/exhibition/venue-mutations';

export type VenueActionResult<T extends Record<string, unknown> = Record<string, never>> =
  AdminMutationResult<T>;

function unauthorized(): { ok: false; errorKey: AdminMutationErrorKey } {
  return { ok: false, errorKey: 'unauthorized' };
}

function revalidateVenuePaths(locale: string, eventId: string): void {
  revalidatePath(`/${locale}/admin/exhibition`);
  revalidatePath(`/${locale}/admin/exhibition/${eventId}/venue`);
  revalidatePath(`/${locale}/exhibition`);
  revalidatePath(`/${locale}/portal`);
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
