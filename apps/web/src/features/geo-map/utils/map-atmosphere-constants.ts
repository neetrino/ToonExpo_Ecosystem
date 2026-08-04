/**
 * Daytime sky / fog / light defaults for ToonExpo geo-map.
 * Warm stone + soft sky — brand-aligned, not purple.
 */

/** Soft midday sky matching brand canvas warmth. */
export const MAP_ATMOSPHERE_SKY_COLOR = '#8eb8e0';
export const MAP_ATMOSPHERE_HORIZON_COLOR = '#e8e4dc';
export const MAP_ATMOSPHERE_FOG_COLOR = '#eef1f4';

export const MAP_ATMOSPHERE_SKY_HORIZON_BLEND = 0.55;
export const MAP_ATMOSPHERE_HORIZON_FOG_BLEND = 0.22;
export const MAP_ATMOSPHERE_FOG_GROUND_BLEND = 0.06;
/** Subtle globe/atmosphere rim without overpowering the basemap. */
export const MAP_ATMOSPHERE_BLEND = 0.35;

export const MAP_LIGHT_ANCHOR = 'map' as const;
export const MAP_LIGHT_COLOR = '#fff8f0';
export const MAP_LIGHT_INTENSITY = 0.68;
/** Radial / azimuth / polar — strong side light for roof/side contrast. */
export const MAP_LIGHT_POSITION: readonly [number, number, number] = [1.45, 205, 24];

export const MAP_BUILDING_EXTRUSION_AO_INTENSITY = 0.55;
export const MAP_BUILDING_EXTRUSION_AO_RADIUS = 6;
