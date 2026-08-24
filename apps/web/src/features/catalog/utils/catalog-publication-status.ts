import type { PublicationStatus } from '@toonexpo/contracts';

export const CATALOG_PUBLICATION_STATUSES = ['draft', 'published'] as const;

export type CatalogPublicationStatus = (typeof CATALOG_PUBLICATION_STATUSES)[number];

/**
 * Catalog UI only exposes draft / published; archived is treated as draft.
 */
export const toCatalogPublicationStatus = (
  status: PublicationStatus,
): CatalogPublicationStatus => (status === 'published' ? 'published' : 'draft');
