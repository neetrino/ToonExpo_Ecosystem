import type { ProjectPublicationInput, ProjectUpsertInput } from '@toonexpo/contracts';

import { serverApiRequest } from '@/lib/api/server';
import type { AuditActor } from '@/lib/audit/record-audit';

import type { BuilderMutationResult } from './mutation-result';

export function createProject(
  companyId: string,
  input: ProjectUpsertInput,
): Promise<BuilderMutationResult<{ projectId: string; projectSlug: string }>> {
  void companyId;
  return serverApiRequest('/builder/projects', { method: 'POST', body: input });
}

export function updateProject(
  companyId: string,
  input: ProjectUpsertInput & { projectId: string },
): Promise<BuilderMutationResult<{ projectId: string }>> {
  void companyId;
  return serverApiRequest('/builder/projects', { method: 'PATCH', body: input });
}

export function setProjectPublication(
  companyId: string,
  input: ProjectPublicationInput,
  actor: AuditActor,
): Promise<BuilderMutationResult<{ projectId: string }>> {
  void companyId;
  void actor;
  return serverApiRequest('/builder/projects/publication', { method: 'PATCH', body: input });
}
