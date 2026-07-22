'use client';

import type { ReactNode } from 'react';

import { cn } from '@/shared/ui/cn';

type DesktopFluidFrameProps = {
  children: ReactNode;
  className?: string | undefined;
  stageClassName?: string | undefined;
};

/**
 * MaMarie-style desktop fluid frame: layout is authored at a fixed design
 * width, then scaled with CSS `zoom` so shrinking the viewport keeps the
 * same composition instead of reflowing.
 *
 * Below the desktop breakpoint the stage is a normal full-width wrapper.
 */
export const DesktopFluidFrame = ({
  children,
  className,
  stageClassName,
}: DesktopFluidFrameProps) => {
  return (
    <div className={cn('desktop-fluid-frame', className)}>
      <div className={cn('desktop-fluid-stage', stageClassName)}>{children}</div>
    </div>
  );
};
