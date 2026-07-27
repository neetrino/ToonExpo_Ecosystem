'use client';

import { FavoriteToggleButton } from '@/features/buyer/components/favorite-toggle-button';

type ProjectDetailFavoriteProps = {
  projectId: string;
};

/**
 * Heart toggle for the public project detail hero.
 */
export const ProjectDetailFavorite = ({ projectId }: ProjectDetailFavoriteProps) => (
  <FavoriteToggleButton
    targetType="project"
    targetId={projectId}
    className="absolute top-24 right-6 z-10 hidden sm:top-28 sm:block"
  />
);
