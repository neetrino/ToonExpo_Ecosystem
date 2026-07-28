const STAGE_SELECTOR = '.desktop-fluid-stage';

/**
 * Portal host for overlays (sheets, modals) so they inherit desktop fluid `zoom`.
 * Falls back to `document.body` when the stage is absent (SSR / rare layouts).
 */
export const getOverlayPortalHost = (): HTMLElement => {
  const stage = document.querySelector(STAGE_SELECTOR);
  if (stage instanceof HTMLElement) {
    return stage;
  }
  return document.body;
};
