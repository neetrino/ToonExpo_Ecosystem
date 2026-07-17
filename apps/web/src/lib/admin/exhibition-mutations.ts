import type { ExhibitionEventUpsertInput } from '@toonexpo/contracts';

import type { AuditActor } from '@/lib/audit/record-audit';

import { adminApiRequest } from './admin-api';
import type { AdminMutationResult } from './mutation-result';

export type ExhibitionEventMutationResult = AdminMutationResult<{ eventId: string }>;

export function upsertExhibitionEvent(
  raw: ExhibitionEventUpsertInput | unknown,
  _actor: AuditActor,
): Promise<ExhibitionEventMutationResult> {
  return adminApiRequest('/commands/upsert-event', { method: 'POST', body: raw });
}
