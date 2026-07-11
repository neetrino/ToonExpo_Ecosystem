import type { PublicationStatus } from '@toonexpo/domain';

export const STATUS_BADGE_CLASS: Record<PublicationStatus, string> = {
  DRAFT: 'portal-badge portal-badge--draft',
  PUBLISHED: 'portal-badge portal-badge--published',
  ARCHIVED: 'portal-badge portal-badge--archived',
};

export function publicationActionsFor(
  status: PublicationStatus,
): ReadonlyArray<{ targetStatus: PublicationStatus; actionKey: 'publish' | 'archive' | 'draft' }> {
  if (status === 'DRAFT') {
    return [{ targetStatus: 'PUBLISHED', actionKey: 'publish' }];
  }
  if (status === 'PUBLISHED') {
    return [{ targetStatus: 'ARCHIVED', actionKey: 'archive' }];
  }
  return [{ targetStatus: 'DRAFT', actionKey: 'draft' }];
}
