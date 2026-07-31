import type { IControl, Map as MapLibreMap } from 'maplibre-gl';

import type { CityMapModelPose } from '../constants';
import { applyCityMapRecenter, resolveCityMapRecenterTarget } from './city-map-recenter';

type CityMapToolbarControlOptions = {
  getModels: () => CityMapModelPose[];
  getSelectedPlacementId: () => string | null;
};

const ICON_ZOOM_IN = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="11" cy="11" r="7"/>
  <path d="M11 8v6M8 11h6"/>
  <path d="m20 20-3.5-3.5"/>
</svg>
`.trim();

const ICON_ZOOM_OUT = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="11" cy="11" r="7"/>
  <path d="M8 11h6"/>
  <path d="m20 20-3.5-3.5"/>
</svg>
`.trim();

const ICON_COMPASS = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="12" cy="12" r="9"/>
  <path d="m16.2 7.8-2.1 6.3-6.3 2.1 2.1-6.3z"/>
  <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none"/>
</svg>
`.trim();

const ICON_RECENTER = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="12" cy="12" r="3.25"/>
  <path d="M12 2.75v3.5M12 17.75v3.5M2.75 12h3.5M17.75 12h3.5"/>
  <circle cx="12" cy="12" r="8.25" opacity="0.35"/>
</svg>
`.trim();

type ToolbarButtonSpec = {
  title: string;
  testId: string;
  iconHtml: string;
  onClick: () => void;
};

const createToolbarButton = (spec: ToolbarButtonSpec): HTMLButtonElement => {
  const button = document.createElement('button');
  button.type = 'button';
  button.title = spec.title;
  button.setAttribute('aria-label', spec.title);
  button.setAttribute('data-testid', spec.testId);
  button.innerHTML = spec.iconHtml;
  button.addEventListener('click', (event) => {
    event.preventDefault();
    spec.onClick();
  });
  return button;
};

/**
 * Single vertical MapLibre control: zoom in/out, reset north/pitch, recenter.
 */
export class CityMapToolbarControl implements IControl {
  private map: MapLibreMap | null = null;
  private container: HTMLDivElement | null = null;
  private readonly getModels: () => CityMapModelPose[];
  private readonly getSelectedPlacementId: () => string | null;

  constructor(options: CityMapToolbarControlOptions) {
    this.getModels = options.getModels;
    this.getSelectedPlacementId = options.getSelectedPlacementId;
  }

  onAdd(map: MapLibreMap): HTMLElement {
    this.map = map;
    const container = document.createElement('div');
    container.className = 'maplibregl-ctrl maplibregl-ctrl-group city-map-ctrl-toolbar';

    const buttons: ToolbarButtonSpec[] = [
      {
        title: 'Zoom in',
        testId: 'city-map-zoom-in',
        iconHtml: ICON_ZOOM_IN,
        onClick: () => {
          this.map?.zoomIn({ duration: 280 });
        },
      },
      {
        title: 'Zoom out',
        testId: 'city-map-zoom-out',
        iconHtml: ICON_ZOOM_OUT,
        onClick: () => {
          this.map?.zoomOut({ duration: 280 });
        },
      },
      {
        title: 'Reset north',
        testId: 'city-map-compass',
        iconHtml: ICON_COMPASS,
        onClick: () => {
          this.map?.resetNorthPitch({ duration: 480 });
        },
      },
      {
        title: 'Recenter map',
        testId: 'city-map-recenter',
        iconHtml: ICON_RECENTER,
        onClick: () => {
          if (!this.map) {
            return;
          }
          applyCityMapRecenter(
            this.map,
            resolveCityMapRecenterTarget(this.getModels(), this.getSelectedPlacementId()),
          );
        },
      },
    ];

    for (const spec of buttons) {
      container.appendChild(createToolbarButton(spec));
    }

    this.container = container;
    return container;
  }

  onRemove(): void {
    this.container?.remove();
    this.container = null;
    this.map = null;
  }
}
