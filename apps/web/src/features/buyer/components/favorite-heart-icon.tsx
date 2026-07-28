import { Heart } from 'lucide-react';

import { cn } from '@/shared/ui/cn';

type FavoriteHeartIconProps = {
  filled: boolean;
  className?: string | undefined;
};

/**
 * Outline / filled heart for favorite toggles (same on mobile and desktop).
 */
export const FavoriteHeartIcon = ({ filled, className }: FavoriteHeartIconProps) => (
  <Heart
    aria-hidden
    absoluteStrokeWidth
    className={cn(
      'size-5 shrink-0',
      filled ? 'fill-brand text-brand' : 'fill-none text-current',
      className,
    )}
    strokeWidth={1.75}
  />
);
