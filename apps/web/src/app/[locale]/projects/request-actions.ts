'use server';

import { auth } from '@/auth';
import type { PublicRequestMutationResult } from '@/lib/crm/mutation-result';
import { submitPublicRequest } from '@/lib/crm/public-request-mutations';

import type { PublicRequestFormActionState } from './request-form-state';

const HONEYPOT_FIELD_NAME = 'website';

function getFormString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === 'string' ? value : undefined;
}

function getOptionalFormString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function isHoneypotTripped(formData: FormData): boolean {
  const value = formData.get(HONEYPOT_FIELD_NAME);
  return typeof value === 'string' && value.trim().length > 0;
}

function toFormState(result: PublicRequestMutationResult): PublicRequestFormActionState {
  if (result.ok) {
    return result.deduped ? { success: true, deduped: true } : { success: true };
  }
  return { errorKey: result.errorKey };
}

async function resolveBuyerContext(): Promise<{
  buyerUserId?: string;
  defaultName?: string;
  defaultEmail?: string;
}> {
  const session = await auth();
  if (!session?.user) {
    return {};
  }

  return {
    buyerUserId: session.user.id,
    defaultName: session.user.name ?? undefined,
    defaultEmail: session.user.email ?? undefined,
  };
}

/** Core mutation entry for tests and scripts (no honeypot). */
export async function submitPublicRequestAction(
  input: Parameters<typeof submitPublicRequest>[0],
): Promise<PublicRequestMutationResult> {
  // TODO(rate-limit): add Redis-backed rate limiting on public request intake.
  return submitPublicRequest(input);
}

export async function publicRequestFormAction(
  _locale: string,
  _prevState: PublicRequestFormActionState,
  formData: FormData,
): Promise<PublicRequestFormActionState> {
  if (isHoneypotTripped(formData)) {
    return { success: true };
  }

  const buyer = await resolveBuyerContext();
  const name = getFormString(formData, 'name') ?? buyer.defaultName;
  const email = getFormString(formData, 'email') ?? buyer.defaultEmail;

  const result = await submitPublicRequest({
    projectId: getFormString(formData, 'projectId'),
    apartmentId: getOptionalFormString(formData, 'apartmentId'),
    name: name ?? '',
    phone: getFormString(formData, 'phone') ?? '',
    email: email ?? '',
    message: getOptionalFormString(formData, 'message'),
    buyerUserId: buyer.buyerUserId,
  });

  return toFormState(result);
}
