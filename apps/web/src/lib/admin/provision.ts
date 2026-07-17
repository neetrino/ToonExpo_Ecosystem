import type { ProvisionAccountInput } from '@toonexpo/contracts';

import type { AuditActor } from '@/lib/audit/record-audit';

import { adminApiRequest } from './admin-api';

export type ProvisionErrorCode = 'emailTaken' | 'invalidInput';

export type ProvisionAccountResult =
  | {
      ok: true;
      userId: string;
      companyId?: string;
      emailSent: boolean;
      inviteUrl?: string;
    }
  | { ok: false; error: ProvisionErrorCode };

export function provisionAccount(
  input: ProvisionAccountInput,
  _actor: AuditActor,
): Promise<ProvisionAccountResult> {
  return adminApiRequest('/commands/provision', { method: 'POST', body: input });
}
