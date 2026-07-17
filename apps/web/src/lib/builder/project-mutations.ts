import type { ProjectPublicationInput, ProjectUpsertInput } from '@toonexpo/contracts';

import { apiRequest } from '@/lib/api/client';
import type { AuditActor } from '@/lib/audit/record-audit';

import type { BuilderMutationResult } from './mutation-result';

export function createProject(
  companyId: string,
  input: ProjectUpsertInput,
): Promise<BuilderMutationResult<{ projectId: string; projectSlug: string }>> {
  void companyId;
  return apiRequest('/builder/projects', { method: 'POST', body: input });
}

export function updateProject(
  companyId: string,
  input: ProjectUpsertInput & { projectId: string },
): Promise<BuilderMutationResult<{ projectId: string }>> {
  void companyId;
  return apiRequest('/builder/projects', { method: 'PATCH', body: input });
}

export function setProjectPublication(
  companyId: string,
  input: ProjectPublicationInput,
  actor: AuditActor,
): Promise<BuilderMutationResult<{ projectId: string }>> {
  void companyId;
  void actor;
  return apiRequest('/builder/projects/publication', { method: 'PATCH', body: input });
}
