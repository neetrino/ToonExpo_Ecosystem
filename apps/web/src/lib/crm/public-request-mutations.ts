import { publicRequestInputSchema, type PublicRequestInput } from '@toonexpo/contracts';

import { getApiErrorKey } from '@/lib/api/errors';
import { apiRequest } from '@/lib/api/client';

import type { PublicRequestMutationResult } from './mutation-result';

export type SubmitPublicRequestParams = PublicRequestInput & { buyerUserId?: string };

export async function submitPublicRequest(
  raw: SubmitPublicRequestParams,
): Promise<PublicRequestMutationResult> {
  const parsed = publicRequestInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, errorKey: 'invalidInput' };
  try {
    return await apiRequest<PublicRequestMutationResult>('/crm/public-requests', {
      method: 'POST',
      body: parsed.data,
    });
  } catch (error) {
    const key = getApiErrorKey(error);
    if (key === 'invalidInput' || key === 'notFound' || key === 'rateLimited') {
      return { ok: false, errorKey: key };
    }
    throw error;
  }
}
