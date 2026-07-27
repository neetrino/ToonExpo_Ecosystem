import { describe, expect, it } from 'vitest';

import { buildActiveIntegratedFilterChips } from '@/shared/ui/integrated-search-filters.build-chips';
import type { IntegratedSearchFilterConfig } from '@/shared/ui/integrated-search-filters.types';

const FILTERS: readonly IntegratedSearchFilterConfig[] = [
  {
    key: 'source',
    label: 'Source',
    allOptionLabel: 'All sources',
    options: [{ value: 'manual', label: 'Manual' }],
  },
  {
    key: 'status',
    label: 'Status',
    allOptionLabel: 'All',
    options: [{ value: 'new_request', label: 'New' }],
  },
];

describe('buildActiveIntegratedFilterChips', () => {
  it('returns empty when all filters are baseline', () => {
    expect(buildActiveIntegratedFilterChips(FILTERS, { source: '', status: '' })).toEqual([]);
  });

  it('builds chips only for active filters', () => {
    expect(
      buildActiveIntegratedFilterChips(FILTERS, {
        source: 'manual',
        status: '',
      }),
    ).toEqual([{ key: 'source', label: 'Source: Manual' }]);
  });
});
