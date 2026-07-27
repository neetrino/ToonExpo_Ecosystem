'use client';

import { FavoriteToggleButton } from '@/features/buyer/components/favorite-toggle-button';
import { cn } from '@/shared/ui/cn';

type ProjectDetailFavoriteProps = {
  projectId: string;
};

/**
 * Heart on the project hero — same horizontal track as header actions
 * (`page-container` + `--page-gutter`), so it lines up with the burger.
 */
export const ProjectDetailFavorite = ({ projectId }: ProjectDetailFavoriteProps) => (
  <div className="pointer-events-none absolute inset-x-0 top-0 z-10">
    <div
      className={cn(
        'page-container flex justify-end',
        'pt-[calc(4.75rem+env(safe-area-inset-top,0px))]',
        'sm:pt-[calc(7rem+env(safe-area-inset-top,0px))]',
      )}
    >
      <FavoriteToggleButton
        targetType="project"
        targetId={projectId}
        className="pointer-events-auto size-10"
      />
    </div>
  </div>
);
