import { auth } from '@/auth';
import type { PublicRequestMutationResult } from '@/lib/crm/mutation-result';
import { submitPublicRequest } from '@/lib/crm/public-request-mutations';

import type { PublicRequestFormActionState } from './request-form-state';

const HONEYPOT_FIELD_NAME = 'website';
const HONEYPOT_SUPPRESSED_DEAL_ID = 'honeypot-suppressed';

type PublicRequestSubmissionInput = Parameters<typeof submitPublicRequest>[0] & {
  [HONEYPOT_FIELD_NAME]?: string;
};

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

function isHoneypotTripped(value: string | undefined): boolean {
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
  if (!session?.user || session.user.role !== 'BUYER') {
    return {};
  }

  return {
    buyerUserId: session.user.id,
    defaultName: session.user.name ?? undefined,
    defaultEmail: session.user.email ?? undefined,
  };
}

async function executePublicRequestSubmission(
  raw: PublicRequestSubmissionInput,
): Promise<PublicRequestMutationResult> {
  if (isHoneypotTripped(raw[HONEYPOT_FIELD_NAME])) {
    return { ok: true, dealId: HONEYPOT_SUPPRESSED_DEAL_ID };
  }

  const { [HONEYPOT_FIELD_NAME]: _honeypot, ...input } = raw;
  return submitPublicRequest(input);
}

/** Core mutation entry for tests and scripts; honeypot is enforced here. */
export async function submitPublicRequestAction(
  input: PublicRequestSubmissionInput,
): Promise<PublicRequestMutationResult> {
  return executePublicRequestSubmission(input);
}

export async function publicRequestFormAction(
  _locale: string,
  _prevState: PublicRequestFormActionState,
  formData: FormData,
): Promise<PublicRequestFormActionState> {
  const buyer = await resolveBuyerContext();
  const name = getFormString(formData, 'name') ?? buyer.defaultName;
  const email = getFormString(formData, 'email') ?? buyer.defaultEmail;

  const result = await executePublicRequestSubmission({
    projectId: getFormString(formData, 'projectId') ?? '',
    apartmentId: getOptionalFormString(formData, 'apartmentId'),
    name: name ?? '',
    phone: getFormString(formData, 'phone') ?? '',
    email: email ?? '',
    message: getOptionalFormString(formData, 'message'),
    buyerUserId: buyer.buyerUserId,
    [HONEYPOT_FIELD_NAME]: getFormString(formData, HONEYPOT_FIELD_NAME),
  });

  return toFormState(result);
}
