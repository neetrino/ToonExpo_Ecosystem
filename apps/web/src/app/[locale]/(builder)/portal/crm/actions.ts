'use server';

import {
  dealActivityInputSchema,
  dealApartmentLinkInputSchema,
  dealAssignInputSchema,
  dealStageUpdateInputSchema,
  manualDealInputSchema,
} from '@toonexpo/contracts';
import { SUPPORTED_LOCALES } from '@toonexpo/shared';
import { revalidatePath } from 'next/cache';

import { assertBuilderSession } from '@/lib/builder/assert-builder-session';
import {
  addDealActivity,
  assignDeal,
  createManualDeal,
  linkDealApartment,
  unlinkDealApartment,
  updateDealStage,
} from '@/lib/crm/deal-mutations';
import type { CrmMutationErrorKey, CrmMutationResult } from '@/lib/crm/mutation-result';
import { resolveCatalogPathsForProjects } from '@/lib/shared/resolve-catalog-paths';
import { revalidateCatalogPaths } from '@/lib/shared/revalidate-catalog-paths';

export type CrmActionResult<T extends Record<string, unknown> = { dealId: string }> =
  CrmMutationResult<T>;

type CrmActionFailure = { ok: false; errorKey: CrmMutationErrorKey };

function unauthorized(): CrmActionFailure {
  return { ok: false, errorKey: 'unauthorized' };
}

function invalidInput(): CrmActionFailure {
  return { ok: false, errorKey: 'invalidInput' };
}

function revalidateCrmPortalPaths(): void {
  for (const locale of SUPPORTED_LOCALES) {
    revalidatePath(`/${locale}/portal`);
    revalidatePath(`/${locale}/portal/crm`);
  }
}

async function revalidateAfterInventoryTouch(
  companyId: string,
  projectIds: string[],
): Promise<void> {
  revalidateCrmPortalPaths();
  if (projectIds.length === 0) {
    revalidateCatalogPaths({});
    return;
  }

  const resolved = await resolveCatalogPathsForProjects(companyId, projectIds);
  if (resolved.length === 0) {
    revalidateCatalogPaths(projectIds.map((projectId) => ({ projectId })));
    return;
  }

  revalidateCatalogPaths(resolved);
}

export async function updateDealStageAction(
  _locale: string,
  raw: unknown,
): Promise<CrmActionResult<{ dealId: string; affectedProjectIds: string[] }>> {
  const session = await assertBuilderSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = dealStageUpdateInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }

  const result = await updateDealStage(session.companyId, parsed.data, session.session.user.id);
  if (result.ok) {
    await revalidateAfterInventoryTouch(session.companyId, result.affectedProjectIds);
  }
  return result;
}

export async function linkDealApartmentAction(
  _locale: string,
  raw: unknown,
): Promise<CrmActionResult<{ dealId: string; affectedProjectIds: string[] }>> {
  const session = await assertBuilderSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = dealApartmentLinkInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }

  const result = await linkDealApartment(session.companyId, parsed.data);
  if (result.ok) {
    await revalidateAfterInventoryTouch(session.companyId, result.affectedProjectIds);
  }
  return result;
}

export async function unlinkDealApartmentAction(
  _locale: string,
  raw: unknown,
): Promise<CrmActionResult<{ dealId: string; affectedProjectIds: string[] }>> {
  const session = await assertBuilderSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = dealApartmentLinkInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }

  const result = await unlinkDealApartment(session.companyId, parsed.data);
  if (result.ok) {
    await revalidateAfterInventoryTouch(session.companyId, result.affectedProjectIds);
  }
  return result;
}

export async function addDealActivityAction(
  _locale: string,
  raw: unknown,
): Promise<CrmActionResult> {
  const session = await assertBuilderSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = dealActivityInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }

  const result = await addDealActivity(session.companyId, parsed.data, session.session.user.id);
  if (result.ok) {
    revalidateCrmPortalPaths();
  }
  return result;
}

export async function assignDealAction(_locale: string, raw: unknown): Promise<CrmActionResult> {
  const session = await assertBuilderSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = dealAssignInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }

  const result = await assignDeal(session.companyId, parsed.data, session.session.user.id);
  if (result.ok) {
    revalidateCrmPortalPaths();
  }
  return result;
}

export async function createManualDealAction(
  _locale: string,
  raw: unknown,
): Promise<CrmActionResult<{ dealId: string; affectedProjectIds: string[] }>> {
  const session = await assertBuilderSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = manualDealInputSchema.safeParse({
    ...(typeof raw === 'object' && raw !== null ? raw : {}),
    companyId: session.companyId,
  });
  if (!parsed.success) {
    return invalidInput();
  }

  const result = await createManualDeal(
    session.companyId,
    { ...parsed.data, companyId: session.companyId, buyerUserId: undefined },
    session.session.user.id,
  );
  if (result.ok) {
    revalidateCrmPortalPaths();
  }
  return result;
}

export type { CrmMutationErrorKey };
