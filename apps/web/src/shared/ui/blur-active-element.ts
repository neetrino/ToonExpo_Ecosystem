/**
 * Clears focus after Escape closes an overlay so the trigger does not keep a focus ring.
 */
export const blurActiveElementAfterEscClose = (): void => {
  window.requestAnimationFrame(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement) {
      active.blur();
    }
  });
};
