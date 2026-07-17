import type { AssessmentUpsertInput } from '@toonexpo/contracts';

import type { AuditActor } from '@/lib/audit/record-audit';

import { adminApiRequest } from './admin-api';
import type { AdminMutationResult } from './mutation-result';

export function upsertAssessment(
  input: AssessmentUpsertInput,
  _actor: AuditActor,
): Promise<AdminMutationResult<{ assessmentId: string }>> {
  return adminApiRequest('/commands/upsert-assessment', { method: 'POST', body: input });
}
