'use client';

import { Home } from 'lucide-react';

/**
 * Brand map pin — sharp teal teardrop with Lucide `Home` as the center mark.
 * Colors / hover live on `.geo-map-pin__*` in `utilities-geo-map.css`.
 */
export const GeoMapPinIcon = (): React.JSX.Element => (
  <>
    <svg className="geo-map-pin__shape" viewBox="0 0 28 38" aria-hidden focusable="false">
      <path
        className="geo-map-pin__body"
        d="M14 1.5C7.1 1.5 1.5 7.1 1.5 14c0 8.6 11.2 21.2 12.05 22.25L14 37l0.45-0.75C15.3 35.2 26.5 22.6 26.5 14 26.5 7.1 20.9 1.5 14 1.5Z"
      />
    </svg>
    <Home className="geo-map-pin__glyph" size={12} strokeWidth={2} aria-hidden />
  </>
);
