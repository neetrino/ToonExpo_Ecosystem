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

const isVerticallyScrollable = (element: HTMLElement): boolean =>
  element.scrollHeight > element.clientHeight + 1;

/**
 * When the open menu fits without scrolling, block wheel so the page behind
 * does not scroll and dismiss the menu. If the portal or panel can scroll,
 * leave the wheel event alone so the list can move.
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
  const portalScrolls = portal instanceof HTMLElement && isVerticallyScrollable(portal);
  const panelScrolls = panel !== null && isVerticallyScrollable(panel);
  if (!portalScrolls && !panelScrolls) {
    event.preventDefault();
  }
};
