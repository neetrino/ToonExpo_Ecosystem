'use server';

import { projectPublicationInputSchema, projectUpsertInputSchema } from '@toonexpo/contracts';

import { assertBuilderSession } from '@/lib/builder/assert-builder-session';
import { createProject, setProjectPublication, updateProject } from '@/lib/builder/mutations';

import {
  type BuilderActionResult,
  invalidInput,
  revalidateAfterProjectMutation,
  unauthorized,
} from './portal-action-shared';

export async function createProjectAction(
  _locale: string,
  raw: unknown,
): Promise<BuilderActionResult<{ projectId: string; projectSlug: string }>> {
  const session = await assertBuilderSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = projectUpsertInputSchema.safeParse(raw);
  if (!parsed.success || parsed.data.projectId) {
    return invalidInput();
  }

  const result = await createProject(session.companyId, parsed.data);
  if (result.ok) {
    await revalidateAfterProjectMutation(
      session.companyId,
      session.companySlug,
      result.projectId,
      result.projectSlug,
    );
  }
  return result;
}

export async function updateProjectAction(
  _locale: string,
  raw: unknown,
): Promise<BuilderActionResult<{ projectId: string }>> {
  const session = await assertBuilderSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = projectUpsertInputSchema.safeParse(raw);
  if (!parsed.success || !parsed.data.projectId) {
    return invalidInput();
  }

  const result = await updateProject(session.companyId, {
    ...parsed.data,
    projectId: parsed.data.projectId,
  });
  if (result.ok) {
    await revalidateAfterProjectMutation(session.companyId, session.companySlug, result.projectId);
  }
  return result;
}

export async function setProjectPublicationAction(
  _locale: string,
  raw: unknown,
): Promise<BuilderActionResult<{ projectId: string }>> {
  const session = await assertBuilderSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = projectPublicationInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }

  const result = await setProjectPublication(session.companyId, parsed.data, {
    userId: session.session.user.id,
    role: session.session.user.role,
  });
  if (result.ok) {
    await revalidateAfterProjectMutation(session.companyId, session.companySlug, result.projectId);
  }
  return result;
}
