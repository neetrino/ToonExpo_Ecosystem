'use client';

import type { ReactNode } from 'react';

import { MOBILE_BOTTOM_NAV_CONTENT_PB_CLASS } from '@/shared/ui/mobile-bottom-nav-clearance';
import { PortalRailCollapseProvider } from '@/shared/ui/portal-rail-collapse-context';
import { PortalRailCollapseToggle } from '@/shared/ui/portal-rail-collapse-toggle';
import {
  PORTAL_RAIL_DESKTOP_ID,
  PORTAL_RAIL_TOP_CLASS,
  PORTAL_RAIL_WIDTH_COLLAPSED_CLASS,
  PORTAL_RAIL_WIDTH_EXPANDED_CLASS,
  PORTAL_RAIL_WIDTH_TRANSITION_CLASS,
} from '@/shared/ui/portal-rail.constants';
import { cn } from '@/shared/ui/cn';

const RAIL_CHROME_TOP_CLASS = PORTAL_RAIL_TOP_CLASS;
const RAIL_CHROME_BOTTOM_CLASS = 'bottom-0';

type PortalRailDesktopAsideProps = {
  sidebar: ReactNode;
  collapsed: boolean;
  expandLabel: string;
  collapseLabel: string;
  onToggleCollapsed: () => void;
  /** Shown left of the collapse toggle when expanded (e.g. portal title). */
  header?: ReactNode | undefined;
};

/**
 * Fixed desktop Metallic Seaweed rail with optional icons-only collapse.
 */
export const PortalRailDesktopAside = ({
  sidebar,
  collapsed,
  expandLabel,
  collapseLabel,
  onToggleCollapsed,
  header,
}: PortalRailDesktopAsideProps) => {
  const showHeader = Boolean(header) && !collapsed;

  return (
    <PortalRailCollapseProvider collapsed={collapsed}>
      <aside
        id={PORTAL_RAIL_DESKTOP_ID}
        className={cn(
          'fixed left-0 z-[var(--z-sticky)] hidden overflow-hidden md:block',
          RAIL_CHROME_TOP_CLASS,
          RAIL_CHROME_BOTTOM_CLASS,
          PORTAL_RAIL_WIDTH_TRANSITION_CLASS,
          collapsed ? PORTAL_RAIL_WIDTH_COLLAPSED_CLASS : PORTAL_RAIL_WIDTH_EXPANDED_CLASS,
        )}
      >
        <div
          className={cn(
            'flex h-full min-h-0 flex-col overflow-hidden rounded-tr-[2.5rem] rounded-br-[2.5rem] bg-brand',
            collapsed ? 'px-2 py-3' : 'p-4',
            MOBILE_BOTTOM_NAV_CONTENT_PB_CLASS,
          )}
        >
          <div
            className={cn(
              'mb-2 flex shrink-0 items-center',
              showHeader ? 'justify-between gap-2' : collapsed ? 'justify-center' : 'justify-end',
            )}
          >
            {showHeader ? <div className="min-w-0 flex-1 px-1.5">{header}</div> : null}
            <PortalRailCollapseToggle
              collapsed={collapsed}
              expandLabel={expandLabel}
              collapseLabel={collapseLabel}
              onToggle={onToggleCollapsed}
            />
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">{sidebar}</div>
        </div>
      </aside>
    </PortalRailCollapseProvider>
  );
};
