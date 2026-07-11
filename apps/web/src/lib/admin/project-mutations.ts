import type { ProjectPublicationInput } from '@toonexpo/contracts';
import { prisma } from '@toonexpo/db';

import type { AdminMutationResult } from './mutation-result';

export async function setProjectPublicationAsAdmin(
  input: ProjectPublicationInput,
): Promise<AdminMutationResult<{ projectId: string }>> {
  const result = await prisma.project.updateMany({
    where: { id: input.projectId },
    data: { status: input.status },
  });

  if (result.count === 0) {
    return { ok: false, errorKey: 'notFound' };
  }

  return { ok: true, projectId: input.projectId };
}
