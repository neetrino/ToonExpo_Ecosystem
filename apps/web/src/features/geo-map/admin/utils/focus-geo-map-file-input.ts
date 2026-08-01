/** Stable ids for admin map shortcuts → hidden file inputs. */
export const GEO_MAP_CREATE_GLB_INPUT_ID = 'geo-map-create-glb-input';
export const GEO_MAP_REPLACE_GLB_INPUT_ID = 'geo-map-replace-glb-input';

/**
 * Opens the native file picker after the sidebar uploader is in the DOM.
 */
export const focusGeoMapFileInput = (inputId: string): void => {
  queueMicrotask(() => {
    requestAnimationFrame(() => {
      const element = document.getElementById(inputId);
      if (element?.tagName !== 'INPUT') {
        return;
      }
      const input = element as HTMLInputElement;
      if (!input.disabled) {
        input.click();
      }
    });
  });
};
