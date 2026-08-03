/**
 * Best-effort WebGL availability probe. Used to render a graceful fallback
 * instead of crashing MapLibre/Three.js on devices/browsers without WebGL.
 */
export const detectWebglSupport = (): boolean => {
  if (typeof document === 'undefined') {
    return false;
  }

  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
};
