"use client";

import { FavoriteToggleButton } from "@/features/buyer/components/favorite-toggle-button";

type ApartmentDetailFavoriteProps = {
  apartmentId: string;
};

/**
 * Heart toggle for the apartment detail header.
 */
export const ApartmentDetailFavorite = ({
  apartmentId,
}: ApartmentDetailFavoriteProps) => (
  <FavoriteToggleButton
    targetType="apartment"
    targetId={apartmentId}
    variant="surface"
  />
);
