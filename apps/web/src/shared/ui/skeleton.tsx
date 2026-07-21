import { cn } from '@/shared/ui/cn';

type SkeletonProps = {
  className?: string | undefined;
};

/**
 * Pulse placeholder for loading states.
 */
export const Skeleton = ({ className }: SkeletonProps) => {
  return <div className={cn('animate-pulse rounded-sm bg-border/70', className)} aria-hidden />;
};

type SkeletonTextProps = {
  lines?: number | undefined;
  className?: string | undefined;
};

/**
 * Multi-line text skeleton.
 */
export const SkeletonText = ({ lines = 3, className }: SkeletonTextProps) => {
  return (
    <div className={cn('flex flex-col gap-2', className)} aria-hidden>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className={cn('h-3 w-full', index === lines - 1 && 'w-2/3')} />
      ))}
    </div>
  );
};
