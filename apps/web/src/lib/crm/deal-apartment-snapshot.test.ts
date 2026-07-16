import { describe, expect, it } from 'vitest';

import { buildDealApartmentSnapshotData } from './deal-apartment-snapshot';

describe('buildDealApartmentSnapshotData', () => {
  it('captures price and status at link time', () => {
    const before = Date.now();
    const snapshot = buildDealApartmentSnapshotData({
      priceAmd: 45_000_000,
      status: 'AVAILABLE',
    });
    const after = Date.now();

    expect(snapshot.priceAmdSnapshot).toBe(45_000_000);
    expect(snapshot.statusSnapshot).toBe('AVAILABLE');
    expect(snapshot.snapshotAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(snapshot.snapshotAt.getTime()).toBeLessThanOrEqual(after);
  });

  it('allows null price snapshot', () => {
    const snapshot = buildDealApartmentSnapshotData({
      priceAmd: null,
      status: 'RESERVED',
    });

    expect(snapshot.priceAmdSnapshot).toBeNull();
    expect(snapshot.statusSnapshot).toBe('RESERVED');
  });
});
