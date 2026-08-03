/**
 * MapLibre Three.js custom-layer constants — orientation parity with
 * Manvel-Lambaryan/Map POC (`DEFAULT_MODEL_ROTATION_X_DEG = 90`, Y-scale flip).
 */

/** MapLibre custom layer id for GLB buildings. */
export const THREE_BUILDING_LAYER_ID = 'geo-map-three-buildings';

/**
 * Default Rotation X (degrees). Blender/Z-up → MapLibre Three.js upright.
 * Maps to admin `pitchDeg` / Prisma `pitchDeg`.
 */
export const DEFAULT_MODEL_ROTATION_X_DEG = 90;

export const DEFAULT_MODEL_ROTATION_Y_DEG = 0;
export const DEFAULT_MODEL_ROTATION_Z_DEG = 0;

/** Ambient light intensity (POC: 0.45). */
export const THREE_AMBIENT_LIGHT_INTENSITY = 0.45;

/** Primary / fill directional lights (POC: 1.1 / 0.9). */
export const THREE_DIRECTIONAL_LIGHT_INTENSITY_PRIMARY = 1.1;
export const THREE_DIRECTIONAL_LIGHT_INTENSITY_FILL = 0.9;

/** Clamp MeshStandardMaterial so GLB textures read more naturally on the shared GL context. */
export const THREE_MATERIAL_MAX_METALNESS = 0.2;
export const THREE_MATERIAL_MIN_ROUGHNESS = 0.4;

/**
 * When authoring units are absurdly tiny/huge, normalize height toward this
 * meter target (POC `prepareModelForMap`).
 */
export const THREE_MODEL_TARGET_HEIGHT_M = 12;
export const THREE_MODEL_ABSURD_MIN_DIM_M = 0.5;
export const THREE_MODEL_ABSURD_MAX_DIM_M = 250;

/** Degrees → radians for Three.js rotation axes. */
export const degToRad = (degrees: number): number => (degrees * Math.PI) / 180;
