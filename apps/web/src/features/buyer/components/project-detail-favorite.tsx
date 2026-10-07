'use client';

import { FavoriteToggleButton } from '@/features/buyer/components/favorite-toggle-button';

type ProjectDetailFavoriteProps = {
  projectId: string;
  className?: string | undefined;
};

/** Heart next to the project QR control. */
export const ProjectDetailFavorite = ({ projectId, className }: ProjectDetailFavoriteProps) => (
  <FavoriteToggleButton
    targetType="project"
    targetId={projectId}
    variant="prominent"
    className={className}
  />
);
