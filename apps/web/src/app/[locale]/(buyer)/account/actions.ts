'use server';

import { buyerProfileUpdateInputSchema } from '@toonexpo/contracts';

import { auth } from '@/auth';
import { updateBuyerProfile, type BuyerProfileMutationResult } from '@/lib/buyer/profile-mutations';

export type BuyerProfileActionResult = BuyerProfileMutationResult;

function unauthorized(): BuyerProfileActionResult {
  return { ok: false, errorKey: 'unauthorized' };
}

function invalidInput(): BuyerProfileActionResult {
  return { ok: false, errorKey: 'invalidInput' };
}

export async function updateBuyerProfileAction(
  _locale: string,
  raw: unknown,
): Promise<BuyerProfileActionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId || session.user.role !== 'BUYER') {
    return unauthorized();
  }

  const parsed = buyerProfileUpdateInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }

  return updateBuyerProfile(userId, parsed.data);
}
