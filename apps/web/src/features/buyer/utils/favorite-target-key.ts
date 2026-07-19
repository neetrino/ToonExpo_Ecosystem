import type { FavoriteTargetType } from "@toonexpo/contracts";

export type FavoriteTarget = {
  targetType: FavoriteTargetType;
  targetId: string;
};

/** Builds the batch status key (`project:id`). */
export const buildFavoriteTargetKey = (
  targetType: FavoriteTargetType,
  targetId: string,
): string => `${targetType}:${targetId}`;

/** Serializes targets for the status query string (stable order). */
export const serializeFavoriteTargets = (targets: FavoriteTarget[]): string =>
  [...targets]
    .map(({ targetType, targetId }) =>
      buildFavoriteTargetKey(targetType, targetId),
    )
    .sort()
    .join(",");
