import type { FavoriteTargetType } from "@toonexpo/contracts";
import { FavoriteTargetType as DbFavoriteTargetType } from "@toonexpo/db";

const TARGET_TYPE_TO_DB: Record<FavoriteTargetType, DbFavoriteTargetType> = {
  project: DbFavoriteTargetType.project,
  apartment: DbFavoriteTargetType.apartment,
};

const DB_TO_TARGET_TYPE: Record<DbFavoriteTargetType, FavoriteTargetType> = {
  [DbFavoriteTargetType.project]: "project",
  [DbFavoriteTargetType.apartment]: "apartment",
};

export const toDbFavoriteTargetType = (
  targetType: FavoriteTargetType,
): DbFavoriteTargetType => TARGET_TYPE_TO_DB[targetType];

export const fromDbFavoriteTargetType = (
  targetType: DbFavoriteTargetType,
): FavoriteTargetType => DB_TO_TARGET_TYPE[targetType];

export const favoriteTargetKey = (
  targetType: FavoriteTargetType,
  targetId: string,
): string => `${targetType}:${targetId}`;

export const parseFavoriteTargetKey = (
  key: string,
): { targetType: FavoriteTargetType; targetId: string } | null => {
  const separatorIndex = key.indexOf(":");
  if (separatorIndex <= 0) {
    return null;
  }

  const targetType = key.slice(0, separatorIndex);
  const targetId = key.slice(separatorIndex + 1);
  if (targetType !== "project" && targetType !== "apartment") {
    return null;
  }
  if (targetId.length === 0) {
    return null;
  }

  return { targetType, targetId };
};
