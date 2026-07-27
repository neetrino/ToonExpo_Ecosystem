type AccountMobileNavListener = (open: boolean) => void;

let openState = false;
const listeners = new Set<AccountMobileNavListener>();

const emit = (): void => {
  for (const listener of listeners) {
    listener(openState);
  }
};

/**
 * Bridges SiteHeader burger ↔ buyer account PortalShell drawer on mobile.
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

const BUYER_ACCOUNT_PREFIXES = [
  '/dashboard',
  '/settings',
  '/favorites',
  '/requests',
  '/qr',
  '/checkin',
] as const;

/** Buyer/visitor account routes that share AccountShell + public SiteHeader. */
export const isBuyerAccountPath = (pathname: string): boolean =>
  BUYER_ACCOUNT_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
