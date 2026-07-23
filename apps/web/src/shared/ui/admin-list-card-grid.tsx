import type { ReactNode } from 'react';

import { cn } from '@/shared/ui/cn';

type AdminListCardGridProps = {
  children: ReactNode;
  className?: string | undefined;
};

/**
 * Responsive card grid for admin collection views.
 */
export const AdminListCardGrid = ({ children, className }: AdminListCardGridProps) => {
  return (
    <div className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3', className)}>
      {children}
    </div>
  );
};
