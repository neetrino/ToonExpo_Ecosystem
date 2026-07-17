import type { ReadinessCategoryUpsertInput } from '@toonexpo/contracts';

import { adminApiRequest } from './admin-api';
import type { AdminMutationResult } from './mutation-result';

export function upsertReadinessCategory(
  input: ReadinessCategoryUpsertInput,
): Promise<AdminMutationResult<{ categoryId: string }>> {
  return adminApiRequest('/commands/upsert-readiness-category', { method: 'POST', body: input });
}
