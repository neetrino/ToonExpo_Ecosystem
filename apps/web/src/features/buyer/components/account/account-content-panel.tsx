import type { ReactNode } from 'react';

import { Card } from '@/shared/ui/card';
import { cn } from '@/shared/ui/cn';

type AccountContentPanelProps = {
  children: ReactNode;
  className?: string | undefined;
};

/**
 * Elevated content surface used across account pages.
 */
export const AccountContentPanel = ({ children, className }: AccountContentPanelProps) => {
  return (
    <Card variant="elevated" className={cn('flex flex-col gap-6', className)}>
      {children}
    </Card>
  );
};
