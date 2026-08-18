import {
  BadGatewayException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { GeoMapGeocodeResponse } from '@toonexpo/contracts';

import {
  GEO_MAP_GEOCODE_COUNTRY_CODES,
  GEO_MAP_GEOCODE_NOMINATIM_URL,
  GEO_MAP_GEOCODE_TIMEOUT_MS,
  GEO_MAP_GEOCODE_USER_AGENT,
  GEO_MAP_LATITUDE_MAX,
  GEO_MAP_LATITUDE_MIN,
  GEO_MAP_LONGITUDE_MAX,
  GEO_MAP_LONGITUDE_MIN,
} from '../geo-map.constants.js';

type NominatimHit = {
  lat?: unknown;
  lon?: unknown;
  display_name?: unknown;
};

const isFiniteNumber = (value: number): boolean => Number.isFinite(value);

const isValidLngLat = (longitude: number, latitude: number): boolean =>
  isFiniteNumber(longitude) &&
  isFiniteNumber(latitude) &&
  longitude >= GEO_MAP_LONGITUDE_MIN &&
  longitude <= GEO_MAP_LONGITUDE_MAX &&
  latitude >= GEO_MAP_LATITUDE_MIN &&
  latitude <= GEO_MAP_LATITUDE_MAX;

const parseNominatimHit = (hit: NominatimHit | undefined): GeoMapGeocodeResponse['data'] | null => {
  if (!hit) {
    return null;
  }
  const longitude = Number(hit.lon);
  const latitude = Number(hit.lat);
  if (!isValidLngLat(longitude, latitude)) {
    return null;
  }
  const label = typeof hit.display_name === 'string' ? hit.display_name.trim() : '';
  return { longitude, latitude, label };
};

/**
 * Admin-only address lookup so the 3D map editor can fly to a typed address.
 */
@Injectable()
export class AdminGeoMapGeocodeService {
  private readonly logger = new Logger(AdminGeoMapGeocodeService.name);

  async geocode(query: string): Promise<GeoMapGeocodeResponse> {
    const url = new URL(GEO_MAP_GEOCODE_NOMINATIM_URL);
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');
    url.searchParams.set('countrycodes', GEO_MAP_GEOCODE_COUNTRY_CODES);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), GEO_MAP_GEOCODE_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'User-Agent': GEO_MAP_GEOCODE_USER_AGENT,
        },
      });
      if (!response.ok) {
        this.logger.warn(`Nominatim HTTP ${response.status}`);
        throw new BadGatewayException('Address lookup failed');
      }
      const payload = (await response.json()) as unknown;
      const hit = Array.isArray(payload) ? (payload[0] as NominatimHit | undefined) : undefined;
      const data = parseNominatimHit(hit);
      if (!data) {
        throw new NotFoundException('Address not found');
      }
      return { data };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadGatewayException) {
        throw error;
      }
      this.logger.warn(error instanceof Error ? error.message : 'Nominatim request failed');
      throw new BadGatewayException('Address lookup failed');
    } finally {
      clearTimeout(timer);
    }
  }
}
