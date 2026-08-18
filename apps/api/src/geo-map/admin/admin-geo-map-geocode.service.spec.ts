import { BadGatewayException, NotFoundException } from '@nestjs/common';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AdminGeoMapGeocodeService } from './admin-geo-map-geocode.service.js';

describe('AdminGeoMapGeocodeService', () => {
  const service = new AdminGeoMapGeocodeService();

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the first Nominatim hit', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ lat: '40.181', lon: '44.515', display_name: 'Abovyan, Yerevan' }],
      }),
    );

    await expect(service.geocode('Abovyan Yerevan')).resolves.toEqual({
      data: { longitude: 44.515, latitude: 40.181, label: 'Abovyan, Yerevan' },
    });
  });

  it('throws not found when Nominatim returns no usable hit', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
      }),
    );

    await expect(service.geocode('unknown place')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws bad gateway when Nominatim is down', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      }),
    );

    await expect(service.geocode('Abovyan Yerevan')).rejects.toBeInstanceOf(BadGatewayException);
  });
});
