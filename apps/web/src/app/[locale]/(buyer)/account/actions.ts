'use server';

import { buyerProfileUpdateInputSchema } from '@toonexpo/contracts';

import { updateBuyerProfile, type BuyerProfileMutationResult } from '@/lib/buyer/profile-mutations';

export type BuyerProfileActionResult = BuyerProfileMutationResult;

function invalidInput(): BuyerProfileActionResult {
  return { ok: false, errorKey: 'invalidInput' };
}

export async function updateBuyerProfileAction(
  _locale: string,
  raw: unknown,
): Promise<BuyerProfileActionResult> {
  const parsed = buyerProfileUpdateInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }

  return updateBuyerProfile(parsed.data);
}
