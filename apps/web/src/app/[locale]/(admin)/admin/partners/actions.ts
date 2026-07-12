'use server';

import {
  bankOfferStatusInputSchema,
  bankOfferUpsertInputSchema,
  partnerStatusInputSchema,
  partnerUpsertInputSchema,
} from '@toonexpo/contracts';

import { assertAdminSession } from '@/lib/admin/assert-admin-session';
import type { AdminMutationErrorKey, AdminMutationResult } from '@/lib/admin/mutation-result';
import {
  createBankOffer,
  createPartner,
  setBankOfferStatus,
  setPartnerStatus,
  updateBankOffer,
  updatePartner,
} from '@/lib/admin/partner-mutations';
import { revalidatePartnerPaths } from '@/lib/shared/revalidate-partner-paths';

export type PartnerActionResult<T extends Record<string, unknown> = Record<string, never>> =
  AdminMutationResult<T>;

type PartnerActionFailure = { ok: false; errorKey: AdminMutationErrorKey };

function unauthorized(): PartnerActionFailure {
  return { ok: false, errorKey: 'unauthorized' };
}

function invalidInput(): PartnerActionFailure {
  return { ok: false, errorKey: 'invalidInput' };
}

export async function createPartnerAction(
  locale: string,
  raw: unknown,
): Promise<PartnerActionResult<{ partnerId: string }>> {
  const session = await assertAdminSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = partnerUpsertInputSchema.safeParse(raw);
  if (!parsed.success || parsed.data.partnerId) {
    return invalidInput();
  }

  const result = await createPartner(parsed.data);
  if (result.ok) {
    revalidatePartnerPaths({ partnerId: result.partnerId, partnerSlug: result.partnerSlug });
  }
  return result;
}

export async function updatePartnerAction(
  locale: string,
  raw: unknown,
): Promise<PartnerActionResult<{ partnerId: string }>> {
  const session = await assertAdminSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = partnerUpsertInputSchema.safeParse(raw);
  if (!parsed.success || !parsed.data.partnerId) {
    return invalidInput();
  }

  const result = await updatePartner({
    ...parsed.data,
    partnerId: parsed.data.partnerId,
  });
  if (result.ok) {
    revalidatePartnerPaths({ partnerId: result.partnerId, partnerSlug: result.partnerSlug });
  }
  return result;
}

export async function setPartnerStatusAction(
  locale: string,
  raw: unknown,
): Promise<PartnerActionResult<{ partnerId: string }>> {
  const session = await assertAdminSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = partnerStatusInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }

  const result = await setPartnerStatus(parsed.data, {
    userId: session.user.id,
    role: session.user.role,
  });
  if (result.ok) {
    revalidatePartnerPaths({ partnerId: result.partnerId, partnerSlug: result.partnerSlug });
  }
  return result;
}

export async function createBankOfferAction(
  locale: string,
  raw: unknown,
): Promise<PartnerActionResult<{ bankOfferId: string }>> {
  const session = await assertAdminSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = bankOfferUpsertInputSchema.safeParse(raw);
  if (!parsed.success || parsed.data.bankOfferId) {
    return invalidInput();
  }

  const result = await createBankOffer(parsed.data);
  if (result.ok) {
    revalidatePartnerPaths({
      partnerId: parsed.data.partnerId,
      partnerSlug: result.partnerSlug,
    });
  }
  return result;
}

export async function updateBankOfferAction(
  locale: string,
  raw: unknown,
): Promise<PartnerActionResult<{ bankOfferId: string }>> {
  const session = await assertAdminSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = bankOfferUpsertInputSchema.safeParse(raw);
  if (!parsed.success || !parsed.data.bankOfferId) {
    return invalidInput();
  }

  const result = await updateBankOffer({
    ...parsed.data,
    bankOfferId: parsed.data.bankOfferId,
  });
  if (result.ok) {
    revalidatePartnerPaths({
      partnerId: parsed.data.partnerId,
      partnerSlug: result.partnerSlug,
    });
  }
  return result;
}

export async function setBankOfferStatusAction(
  locale: string,
  partnerId: string,
  raw: unknown,
): Promise<PartnerActionResult<{ bankOfferId: string }>> {
  const session = await assertAdminSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = bankOfferStatusInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }

  const result = await setBankOfferStatus(parsed.data, {
    userId: session.user.id,
    role: session.user.role,
  });
  if (result.ok) {
    revalidatePartnerPaths({ partnerId, partnerSlug: result.partnerSlug });
  }
  return result;
}
