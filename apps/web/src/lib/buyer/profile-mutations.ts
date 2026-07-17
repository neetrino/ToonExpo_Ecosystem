import {
  buyerProfileSchema,
  buyerProfileUpdateResponseSchema,
  type BuyerProfile,
  type BuyerProfileUpdateInput,
} from '@toonexpo/contracts';

import { getApiErrorKey } from '../api/errors';
import { serverApiRequest } from '../api/server';

export type BuyerProfileMutationResult =
  { ok: true } | { ok: false; errorKey: 'notFound' | 'invalidInput' | 'unauthorized' };

/** Updates the signed-in buyer's name and phone. Email/role are not writable here. */
export async function updateBuyerProfile(
  input: BuyerProfileUpdateInput,
): Promise<BuyerProfileMutationResult> {
  try {
    const response = await serverApiRequest<unknown>('/buyer/profile', {
      method: 'PATCH',
      body: input,
    });
    buyerProfileUpdateResponseSchema.parse(response);
    return { ok: true };
  } catch (error) {
    const errorKey = getApiErrorKey(error);
    if (isProfileErrorKey(errorKey)) {
      return { ok: false, errorKey };
    }
    throw error;
  }
}

export type BuyerProfileView = BuyerProfile;

export async function getBuyerProfile(): Promise<BuyerProfileView | null> {
  try {
    const response = await serverApiRequest<unknown>('/buyer/profile');
    return buyerProfileSchema.parse(response);
  } catch (error) {
    if (getApiErrorKey(error) === 'notFound') {
      return null;
    }
    throw error;
  }
}

function isProfileErrorKey(
  value: string | null,
): value is 'notFound' | 'invalidInput' | 'unauthorized' {
  return value === 'notFound' || value === 'invalidInput' || value === 'unauthorized';
}
