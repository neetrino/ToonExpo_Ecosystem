import {
  CLUSTER_DISC_CLASS_NAME,
  CLUSTER_ELEMENT_CLASS_NAME,
  CLUSTER_ELEMENT_DENSE_CLASS_NAME,
  CLUSTER_ELEMENT_GREEN_CLASS_NAME,
  MARKER_CLUSTER_DENSE_MIN_COUNT,
} from '@/features/geo-map/constants';
import { resolveClusterBubbleTone } from '@/features/geo-map/utils/cluster-screen-points';

/**
 * Updates the bubble count and tone. Never assigns `className` on the root:
 * MapLibre keeps `maplibregl-marker` on that element.
 */
export const applyGeoMapClusterState = (element: HTMLElement, apartmentCount: number): void => {
  const disc = element.querySelector(`.${CLUSTER_DISC_CLASS_NAME}`);
  if (!(disc instanceof HTMLElement)) {
    return;
  }
  const label = String(apartmentCount);
  disc.textContent = label;
  element.classList.toggle(
    CLUSTER_ELEMENT_GREEN_CLASS_NAME,
    resolveClusterBubbleTone(apartmentCount) === 'green',
  );
  element.classList.toggle(
    CLUSTER_ELEMENT_DENSE_CLASS_NAME,
    apartmentCount >= MARKER_CLUSTER_DENSE_MIN_COUNT,
  );
  element.setAttribute('aria-label', label);
};

/** Circle bubble whose child disc is centered on the geographic anchor. */
export const createGeoMapClusterElement = (apartmentCount: number): HTMLDivElement => {
  const element = document.createElement('div');
  element.classList.add(CLUSTER_ELEMENT_CLASS_NAME);
  element.setAttribute('role', 'button');
  element.tabIndex = 0;

  const disc = document.createElement('span');
  disc.className = CLUSTER_DISC_CLASS_NAME;
  disc.setAttribute('aria-hidden', 'true');
  element.appendChild(disc);
  applyGeoMapClusterState(element, apartmentCount);
  return element;
};
