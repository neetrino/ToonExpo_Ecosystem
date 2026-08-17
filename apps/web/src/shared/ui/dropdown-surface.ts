/**
 * True when `node` is the trigger root, the menu panel, or the DropdownPortal
 * wrapper that hosts the panel (scroll/wheel often target the portal, not the panel).
 */
export const isInsideDropdownSurface = (
  node: Node,
  root: HTMLElement | null,
  panel: HTMLElement | null,
): boolean => {
  if (root?.contains(node) || panel?.contains(node)) {
    return true;
  }
  if (node instanceof Element && panel) {
    const portal = node.closest('[data-dropdown-portal]');
    return Boolean(portal?.contains(panel));
  }
  return false;
};

/**
 * When the open menu fits without scrolling, block wheel so the page behind
 * does not scroll and dismiss the menu.
 */
export const preventWheelDismissThroughDropdown = (
  event: WheelEvent,
  panel: HTMLElement | null,
  isInside: (node: Node) => boolean,
): void => {
  if (!(event.target instanceof Node) || !isInside(event.target)) {
    return;
  }
  const portal = panel?.closest('[data-dropdown-portal]');
  if (!(portal instanceof HTMLElement)) {
    return;
  }
  const canScroll = portal.scrollHeight > portal.clientHeight + 1;
  if (!canScroll) {
    event.preventDefault();
  }
};
