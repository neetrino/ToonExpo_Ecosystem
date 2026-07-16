'use server';

import {
  bankOfferUpsertInputSchema,
  partnerSelfProfileInputSchema,
} from '@toonexpo/contracts';

import type { AdminMutationErrorKey, AdminMutationResult } from '@/lib/admin/mutation-result';
import { createBankOffer, updateBankOffer } from '@/lib/admin/partner-mutations';
import { assertPartnerSession } from '@/lib/partner/assert-partner-session';
import { updateOwnPartnerProfile } from '@/lib/partner/mutations';
import { revalidatePartnerPaths } from '@/lib/shared/revalidate-partner-paths';

type PartnerActionFailure = { ok: false; errorKey: AdminMutationErrorKey };

function unauthorized(): PartnerActionFailure {
  return { ok: false, errorKey: 'unauthorized' };
}

function invalidInput(): PartnerActionFailure {
  return { ok: false, errorKey: 'invalidInput' };
}

function notBankPartner(): PartnerActionFailure {
  return { ok: false, errorKey: 'notBankPartner' };
}

export async function updateOwnPartnerProfileAction(
  _locale: string,
  raw: unknown,
): Promise<AdminMutationResult<{ partnerId: string }>> {
  const ctx = await assertPartnerSession();
  if (!ctx) {
    return unauthorized();
  }

  const parsed = partnerSelfProfileInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }

  const result = await updateOwnPartnerProfile(ctx.partnerId, parsed.data);
  if (result.ok) {
    revalidatePartnerPaths({ partnerId: result.partnerId, partnerSlug: result.partnerSlug });
  }
  return result;
}

export async function createOwnBankOfferAction(
  _locale: string,
  raw: unknown,
): Promise<AdminMutationResult<{ bankOfferId: string }>> {
  const ctx = await assertPartnerSession();
  if (!ctx) {
    return unauthorized();
  }
  if (ctx.partner.type !== 'BANK') {
    return notBankPartner();
  }

  const parsed = bankOfferUpsertInputSchema.safeParse({
    ...(typeof raw === 'object' && raw !== null ? raw : {}),
    partnerId: ctx.partnerId,
  });
  if (!parsed.success || parsed.data.bankOfferId) {
    return invalidInput();
  }

  const result = await createBankOffer({
    ...parsed.data,
    partnerId: ctx.partnerId,
  });
  if (result.ok) {
    revalidatePartnerPaths({
      partnerId: ctx.partnerId,
      partnerSlug: result.partnerSlug,
    });
  }
  return result;
}

export async function updateOwnBankOfferAction(
  _locale: string,
  raw: unknown,
): Promise<AdminMutationResult<{ bankOfferId: string }>> {
  const ctx = await assertPartnerSession();
  if (!ctx) {
    return unauthorized();
  }
  if (ctx.partner.type !== 'BANK') {
    return notBankPartner();
  }

  const parsed = bankOfferUpsertInputSchema.safeParse({
    ...(typeof raw === 'object' && raw !== null ? raw : {}),
    partnerId: ctx.partnerId,
  });
  if (!parsed.success || !parsed.data.bankOfferId) {
    return invalidInput();
  }

  const result = await updateBankOffer({
    ...parsed.data,
    partnerId: ctx.partnerId,
    bankOfferId: parsed.data.bankOfferId,
  });
  if (result.ok) {
    revalidatePartnerPaths({
      partnerId: ctx.partnerId,
      partnerSlug: result.partnerSlug,
    });
  }
  return result;
}
