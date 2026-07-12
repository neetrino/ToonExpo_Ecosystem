import { describe, expect, it } from 'vitest';

import { boothMatchesQuery } from './booth-search';
import type { PublicBooth } from './venue-queries';

const baseBooth: PublicBooth = {
  id: 'b-1',
  code: 'A12',
  label: 'Demo Development',
  xPercent: 28,
  yPercent: 42,
  note: 'Main aisle',
  company: { id: 'co-1', name: 'Demo Development', slug: 'demo-development' },
  partner: null,
  project: {
    id: 'p-1',
    name: 'Sunrise Residence',
    slug: 'sunrise-residence',
    companySlug: 'demo-development',
  },
};

describe('boothMatchesQuery', () => {
  it('matches empty query', () => {
    expect(boothMatchesQuery(baseBooth, '')).toBe(true);
  });

  it('matches booth code and label', () => {
    expect(boothMatchesQuery(baseBooth, 'a12')).toBe(true);
    expect(boothMatchesQuery(baseBooth, 'demo')).toBe(true);
  });

  it('matches linked project name', () => {
    expect(boothMatchesQuery(baseBooth, 'sunrise')).toBe(true);
  });

  it('rejects unrelated query', () => {
    expect(boothMatchesQuery(baseBooth, 'converse')).toBe(false);
  });
});
