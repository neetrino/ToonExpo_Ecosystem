"use client";

import { FavoriteToggleButton } from "@/features/buyer/components/favorite-toggle-button";

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
    className="absolute right-6 top-6"
  />
);
