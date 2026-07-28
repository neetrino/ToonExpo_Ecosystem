type AccountMobileNavListener = (open: boolean) => void;

let openState = false;
const listeners = new Set<AccountMobileNavListener>();

const emit = (): void => {
  for (const listener of listeners) {
    listener(openState);
  }
};

/**
 * Bridges SiteHeader burger ↔ PortalShell drawer on mobile
 * (buyer account + builder portal).
 */
export const accountMobileNavController = {
  subscribe(listener: AccountMobileNavListener): () => void {
    listeners.add(listener);
    listener(openState);
    return () => {
      listeners.delete(listener);
    };
  },
  setOpen(open: boolean): void {
    if (openState === open) {
      return;
    }
    openState = open;
    emit();
  },
  toggle(): void {
    openState = !openState;
    emit();
  },
};

const BUYER_ACCOUNT_SHELL_PREFIXES = [
  '/dashboard',
  '/settings',
  '/favorites',
  '/requests',
  '/checkin',
] as const;

/**
 * Routes that use AccountShell (own SiteHeader via PortalShell).
 * `/qr` is exact-only — `/qr/[token]` stays a public landing page.
 */
export const isBuyerAccountShellPath = (pathname: string): boolean => {
  if (pathname === '/qr') {
    return true;
  }

  return BUYER_ACCOUNT_SHELL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
};

/** Builder portal paths (own SiteHeader via PortalShell). */
export const isBuilderPortalPath = (pathname: string): boolean =>
  pathname === '/builder' || pathname.startsWith('/builder/');

/**
 * Paths where the navbar burger opens the PortalShell drawer
 * (buyer account + builder) instead of the public mobile nav.
 */
export const isNavbarControlledPortalPath = (pathname: string): boolean =>
  isBuyerAccountShellPath(pathname) || isBuilderPortalPath(pathname);

/** @deprecated Prefer `isNavbarControlledPortalPath` — kept for existing imports. */
export const isBuyerAccountPath = isNavbarControlledPortalPath;
