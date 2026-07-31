import type { IControl, Map as MapLibreMap } from 'maplibre-gl';
import maplibregl from 'maplibre-gl';

import {
  CITY_MAP_ARMENIA_BOUNDS,
  CITY_MAP_ARMENIA_FIT_MAX_ZOOM,
  CITY_MAP_ARMENIA_FIT_PADDING,
  CITY_MAP_PIN_FOCUS_ZOOM,
  type CityMapModelPose,
} from '../constants';

export type CityMapRecenterTarget =
  { kind: 'pin'; longitude: number; latitude: number } | { kind: 'armenia' };

/**
 * Prefer an explicitly selected placement (pin click / list select).
 * No selection → Armenia overview.
 */
export const resolveCityMapRecenterTarget = (
  models: CityMapModelPose[],
  selectedPlacementId: string | null,
): CityMapRecenterTarget => {
  if (!selectedPlacementId) {
    return { kind: 'armenia' };
  }
  const target = models.find((model) => model.id === selectedPlacementId);
  if (!target) {
    return { kind: 'armenia' };
  }
  return {
    kind: 'pin',
    longitude: target.longitude,
    latitude: target.latitude,
  };
};

export const applyCityMapRecenter = (map: MapLibreMap, target: CityMapRecenterTarget): void => {
  if (target.kind === 'pin') {
    map.flyTo({
      center: [target.longitude, target.latitude],
      zoom: Math.max(map.getZoom(), CITY_MAP_PIN_FOCUS_ZOOM),
      essential: true,
    });
    return;
  }

  const bounds = new maplibregl.LngLatBounds(
    [CITY_MAP_ARMENIA_BOUNDS.west, CITY_MAP_ARMENIA_BOUNDS.south],
    [CITY_MAP_ARMENIA_BOUNDS.east, CITY_MAP_ARMENIA_BOUNDS.north],
  );
  map.fitBounds(bounds, {
    padding: CITY_MAP_ARMENIA_FIT_PADDING,
    maxZoom: CITY_MAP_ARMENIA_FIT_MAX_ZOOM,
    duration: 900,
    pitch: 0,
    bearing: 0,
  });
};

type CityMapRecenterControlOptions = {
  onRecenter: () => void;
  title?: string;
};

const RECENTER_ICON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="12" cy="12" r="3"/>
  <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
</svg>
`.trim();

/** MapLibre control: recenter to selected pin, or Armenia overview. */
export class CityMapRecenterControl implements IControl {
  private container: HTMLDivElement | null = null;
  private button: HTMLButtonElement | null = null;
  private readonly onRecenter: () => void;
  private readonly title: string;

  constructor(options: CityMapRecenterControlOptions) {
    this.onRecenter = options.onRecenter;
    this.title = options.title ?? 'Recenter map';
  }

  onAdd(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'maplibregl-ctrl maplibregl-ctrl-group';

    const button = document.createElement('button');
    button.type = 'button';
    button.title = this.title;
    button.setAttribute('aria-label', this.title);
    button.setAttribute('data-testid', 'city-map-recenter');
    button.innerHTML = RECENTER_ICON_SVG;
    button.addEventListener('click', this.handleClick);

    container.appendChild(button);
    this.container = container;
    this.button = button;
    return container;
  }

  onRemove(): void {
    this.button?.removeEventListener('click', this.handleClick);
    this.container?.remove();
    this.container = null;
    this.button = null;
  }

  private readonly handleClick = (event: MouseEvent): void => {
    event.preventDefault();
    this.onRecenter();
  };
}
