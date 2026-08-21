import type { CatalogScope } from '@/features/builder/catalog-scope';

/**
 * How inventory sheets load/mutate data.
 * - `platform` — cross-company admin hubs (`/admin/buildings`, …)
 * - CatalogScope — portal or admin company-catalog APIs
 */
export type InventorySheetScope = { kind: 'platform' } | CatalogScope;

export const PLATFORM_INVENTORY_SHEET_SCOPE: InventorySheetScope = { kind: 'platform' };

export const PORTAL_INVENTORY_SHEET_SCOPE: InventorySheetScope = { mode: 'portal' };

export const isPlatformInventoryScope = (
  scope: InventorySheetScope,
): scope is { kind: 'platform' } => 'kind' in scope && scope.kind === 'platform';

/**
 * Catalog scope for portal/admin-catalog mutations (never platform list endpoints).
 */
export const toCatalogMutationScope = (
  scope: InventorySheetScope,
  companyId: string,
): CatalogScope => {
  if (isPlatformInventoryScope(scope)) {
    return { mode: 'admin', companyId };
  }
  return scope;
};
