import { companyProfileUpdateInputSchema } from '@toonexpo/contracts';

import { assertBuilderSession } from '@/lib/builder/assert-builder-session';
import { updateCompanyProfile } from '@/lib/builder/mutations';

import {
  type BuilderActionResult,
  invalidInput,
  revalidateAfterCompanyProfileMutation,
  unauthorized,
} from './portal-action-shared';

export async function updateCompanyProfileAction(
  _locale: string,
  raw: unknown,
): Promise<BuilderActionResult<{ companyId: string }>> {
  const session = await assertBuilderSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = companyProfileUpdateInputSchema.safeParse(raw);
  if (!parsed.success || parsed.data.companyId) {
    return invalidInput();
  }

  const result = await updateCompanyProfile(session.companyId, parsed.data);
  if (result.ok) {
    await revalidateAfterCompanyProfileMutation(session.companyId, result.companySlug);
  }
  return result;
}
