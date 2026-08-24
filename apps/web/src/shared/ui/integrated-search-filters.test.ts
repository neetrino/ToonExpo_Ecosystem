import { describe, expect, it } from 'vitest';

import {
  buildActiveIntegratedFilterChips,
  removeIntegratedFilterChip,
} from '@/shared/ui/integrated-search-filters.build-chips';
import { INTEGRATED_SEARCH_FILTER_SUMMARY_CHIP_KEY } from '@/shared/ui/integrated-search-filters.constants';
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

const MULTI_FILTER: readonly IntegratedSearchFilterConfig[] = [
  {
    key: 'companyId',
    label: 'Builder',
    allOptionLabel: 'All',
    multiple: true,
    options: [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B' },
      { value: 'c', label: 'C' },
    ],
  },
  {
    key: 'buildingId',
    label: 'Building',
    allOptionLabel: 'All',
    multiple: true,
    options: [
      { value: '1', label: 'Tower 1' },
      { value: '2', label: 'Tower 2' },
    ],
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

  it('shows individual chips when total selections are at most three', () => {
    expect(buildActiveIntegratedFilterChips(MULTI_FILTER, { companyId: 'a,b', buildingId: '1' })).toEqual([
      { key: 'companyId::a', label: 'Builder: A' },
      { key: 'companyId::b', label: 'Builder: B' },
      { key: 'buildingId::1', label: 'Building: Tower 1' },
    ]);
  });

  it('collapses to a single summary chip when total selections exceed three', () => {
    expect(
      buildActiveIntegratedFilterChips(
        MULTI_FILTER,
        { companyId: 'a,b,c', buildingId: '1' },
        { summaryCountLabel: (count) => `${count} selected` },
      ),
    ).toEqual([{ key: INTEGRATED_SEARCH_FILTER_SUMMARY_CHIP_KEY, label: '4 selected' }]);
  });
});

describe('removeIntegratedFilterChip', () => {
  it('clears all filters when removing the summary chip', () => {
    expect(
      removeIntegratedFilterChip(
        MULTI_FILTER,
        { companyId: 'a,b,c', buildingId: '1' },
        INTEGRATED_SEARCH_FILTER_SUMMARY_CHIP_KEY,
      ),
    ).toEqual({ companyId: '', buildingId: '' });
  });

  it('removes one id from a multi-select filter', () => {
    expect(
      removeIntegratedFilterChip(MULTI_FILTER, { companyId: 'a,b', buildingId: '' }, 'companyId::a'),
    ).toEqual({ companyId: 'b', buildingId: '' });
  });

  it('clears a single-select filter by key', () => {
    expect(removeIntegratedFilterChip(FILTERS, { source: 'manual', status: '' }, 'source')).toEqual({
      source: '',
      status: '',
    });
  });
});
