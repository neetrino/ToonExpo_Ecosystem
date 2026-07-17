import type { ProjectPublicationInput } from '@toonexpo/contracts';

import type { AuditActor } from '@/lib/audit/record-audit';

import { adminApiRequest } from './admin-api';
import type { AdminMutationResult } from './mutation-result';

export function setProjectPublicationAsAdmin(
  input: ProjectPublicationInput,
  _actor: AuditActor,
): Promise<AdminMutationResult<{ projectId: string }>> {
  return adminApiRequest('/commands/project-publication', { method: 'POST', body: input });
}
