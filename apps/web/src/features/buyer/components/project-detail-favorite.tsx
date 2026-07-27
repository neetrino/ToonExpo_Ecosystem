'use client';

import { FavoriteToggleButton } from '@/features/buyer/components/favorite-toggle-button';

type ProjectDetailFavoriteProps = {
  projectId: string;
};

/**
 * Heart toggle for the public project detail hero.
 * Right edge aligns with the header burger / profile control (`page-gutter`).
 */
export const ProjectDetailFavorite = ({ projectId }: ProjectDetailFavoriteProps) => (
  <FavoriteToggleButton
    targetType="project"
    targetId={projectId}
    className="absolute top-[4.75rem] right-[var(--page-gutter)] z-10 size-10 sm:top-28"
  />
);
