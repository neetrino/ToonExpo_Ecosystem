import { describe, expect, it } from 'vitest';

import { isPublicVenueMapEventStatus, PUBLIC_VENUE_MAP_EVENT_STATUSES } from './venue-visibility';

describe('venue visibility', () => {
  it('exposes ACTIVE as the only public venue status', () => {
    expect(PUBLIC_VENUE_MAP_EVENT_STATUSES).toEqual(['ACTIVE']);
  });

  it('accepts ACTIVE and rejects other lifecycle statuses', () => {
    expect(isPublicVenueMapEventStatus('ACTIVE')).toBe(true);
    expect(isPublicVenueMapEventStatus('PLANNING')).toBe(false);
    expect(isPublicVenueMapEventStatus('COMPLETED')).toBe(false);
    expect(isPublicVenueMapEventStatus('ARCHIVED')).toBe(false);
    expect(isPublicVenueMapEventStatus('CANCELLED')).toBe(false);
  });
});
