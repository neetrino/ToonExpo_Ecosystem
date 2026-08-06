import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { GeoMapPinIcon } from '@/features/geo-map/components/geo-map-pin-icon';
import {
  MARKER_ELEMENT_CLASS_NAME,
  MARKER_ELEMENT_EDITABLE_CLASS_NAME,
  MARKER_ELEMENT_SELECTED_CLASS_NAME,
} from '@/features/geo-map/constants';

export type GeoMapPinElement = {
  element: HTMLDivElement;
  root: Root;
};

/**
 * Applies state as class toggles / attributes only. Never assigns `className`:
 * MapLibre keeps `maplibregl-marker` (absolute positioning) on the same element,
 * and dropping it makes every pin fall back into document flow.
 */
export const applyGeoMapPinState = (
  element: HTMLElement,
  label: string,
  editable: boolean,
  selected: boolean,
): void => {
  element.classList.toggle(MARKER_ELEMENT_EDITABLE_CLASS_NAME, editable);
  element.classList.toggle(MARKER_ELEMENT_SELECTED_CLASS_NAME, selected);
  element.setAttribute('aria-label', label);
  element.title = label;
};

/** Builds a MapLibre-ready pin host with a Lucide `MapPin` React root inside. */
export const createGeoMapPinElement = (
  label: string,
  editable: boolean,
  selected: boolean,
): GeoMapPinElement => {
  const element = document.createElement('div');
  element.classList.add(MARKER_ELEMENT_CLASS_NAME);
  element.setAttribute('role', 'button');

  const iconHost = document.createElement('span');
  iconHost.className = 'geo-map-pin__icon';
  element.appendChild(iconHost);

  const root = createRoot(iconHost);
  root.render(createElement(GeoMapPinIcon));
  applyGeoMapPinState(element, label, editable, selected);
  return { element, root };
};

/**
 * Defers `root.unmount()` — calling it synchronously inside a parent React
 * effect cleanup races with React's own commit (nested createRoot).
 */
export const disposeGeoMapPinElement = (pin: GeoMapPinElement): void => {
  const { root } = pin;
  queueMicrotask(() => {
    root.unmount();
  });
};
