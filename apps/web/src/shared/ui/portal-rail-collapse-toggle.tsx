'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { IconButton } from '@/shared/ui/icon-button';
import { PORTAL_RAIL_DESKTOP_ID } from '@/shared/ui/portal-rail.constants';
import { cn } from '@/shared/ui/cn';

type PortalRailCollapseToggleProps = {
  collapsed: boolean;
  expandLabel: string;
  collapseLabel: string;
  onToggle: () => void;
  className?: string | undefined;
};

/**
 * Desktop-only control to collapse/expand the floating portal rail.
 */
export const PortalRailCollapseToggle = ({
  collapsed,
  expandLabel,
  collapseLabel,
  onToggle,
  className,
}: PortalRailCollapseToggleProps) => {
  const label = collapsed ? expandLabel : collapseLabel;

  return (
    <IconButton
      label={label}
      variant="ghost"
      size="sm"
      className={cn(
        'shrink-0 border-transparent text-on-dark/85 hover:bg-on-dark/10 hover:text-on-dark',
        className,
      )}
      aria-expanded={!collapsed}
      aria-controls={PORTAL_RAIL_DESKTOP_ID}
      onClick={onToggle}
    >
      {collapsed ? (
        <ChevronRight className="size-4" aria-hidden />
      ) : (
        <ChevronLeft className="size-4" aria-hidden />
      )}
    </IconButton>
  );
};
