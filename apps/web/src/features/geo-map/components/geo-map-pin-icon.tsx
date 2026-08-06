'use client';

import { Home } from 'lucide-react';

/**
 * Brand map pin — needle-sharp teal teardrop with Lucide `Home` center mark.
 * Colors / hover live on `.geo-map-pin__*` in `utilities-geo-map.css`.
 */
export const GeoMapPinIcon = (): React.JSX.Element => (
  <>
    <svg className="geo-map-pin__shape" viewBox="0 0 28 40" aria-hidden focusable="false">
      <path
        className="geo-map-pin__body"
        d="M14 1.2C7.05 1.2 1.4 6.85 1.4 13.8c0 8.35 10.35 21.55 12.05 23.85L14 39.2l0.55-1.55C16.25 35.35 26.6 22.15 26.6 13.8 26.6 6.85 20.95 1.2 14 1.2Z"
      />
    </svg>
    <Home className="geo-map-pin__glyph" size={12} strokeWidth={2} aria-hidden />
  </>
);
