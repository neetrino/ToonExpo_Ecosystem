/**
 * Even daylight for the geo-map city — no rim glow, no side shine.
 */

/** Soft midday sky matching brand canvas warmth. */
export const MAP_ATMOSPHERE_SKY_COLOR = '#9ec4e6';
export const MAP_ATMOSPHERE_HORIZON_COLOR = '#f4f1ea';
export const MAP_ATMOSPHERE_FOG_COLOR = '#f7f6f3';

export const MAP_ATMOSPHERE_SKY_HORIZON_BLEND = 0.4;
export const MAP_ATMOSPHERE_HORIZON_FOG_BLEND = 0.06;
export const MAP_ATMOSPHERE_FOG_GROUND_BLEND = 0;
/** Keep sky, but do not wash the city with a glowing rim. */
export const MAP_ATMOSPHERE_BLEND = 0.08;

export const MAP_LIGHT_ANCHOR = 'map' as const;
export const MAP_LIGHT_COLOR = '#ffffff';
/** Unshaded extrusions — every wall keeps the same brightness. */
export const MAP_LIGHT_INTENSITY = 0;
export const MAP_LIGHT_POSITION: readonly [number, number, number] = [1.15, 210, 90];

export const MAP_BUILDING_EXTRUSION_VERTICAL_GRADIENT = false;
export const MAP_BUILDING_EXTRUSION_AO_INTENSITY = 0;
export const MAP_BUILDING_EXTRUSION_AO_RADIUS = 3;
