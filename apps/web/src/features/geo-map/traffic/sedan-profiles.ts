/** Side silhouette, meters. +X is the nose (becomes +Z after extrude). */
export const SEDAN_BODY_PROFILE: readonly (readonly [number, number])[] = [
  [2.28, 0.17],
  [2.34, 0.34],
  [2.22, 0.52],
  [1.12, 0.68],
  [0.48, 1.22],
  [-0.88, 1.26],
  [-1.48, 0.96],
  [-1.92, 0.72],
  [-2.26, 0.56],
  [-2.32, 0.34],
  [-2.24, 0.17],
];

export const SEDAN_GLASS_PROFILE: readonly (readonly [number, number])[] = [
  [0.92, 0.74],
  [0.42, 1.18],
  [-0.82, 1.2],
  [-1.38, 0.94],
  [-1.28, 0.8],
  [0.82, 0.8],
];

export const SEDAN_BODY_WIDTH_M = 1.82;
export const SEDAN_GLASS_WIDTH_M = 1.68;
export const SEDAN_WHEEL_RADIUS_M = 0.32;
export const SEDAN_WHEEL_WIDTH_M = 0.22;
export const SEDAN_WHEEL_X_M = 0.78;
export const SEDAN_WHEEL_Z_M = 1.26;
