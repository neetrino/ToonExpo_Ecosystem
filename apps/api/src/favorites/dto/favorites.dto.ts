import { BadRequestException } from "@nestjs/common";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";
import type { FavoriteTargetType } from "@toonexpo/contracts";

export class FavoriteTargetParamsDto {
  @ApiProperty({ enum: ["project", "apartment"] })
  @IsIn(["project", "apartment"])
  targetType!: FavoriteTargetType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  targetId!: string;
}

export class FavoritesLocaleQueryDto {
  @ApiPropertyOptional({
    enum: ["hy", "ru", "en"],
    description: "Catalog content locale; falls back to hy",
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  locale?: string;
}

export class FavoritesStatusQueryDto {
  @ApiProperty({
    description: "Comma-separated target keys: project:id,apartment:id",
    example: "project:proj_1,apartment:apt_1",
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  targets!: string;
}

export const parseFavoritesStatusTargets = (
  raw: string,
): Array<{ targetType: FavoriteTargetType; targetId: string }> => {
  const parts = raw
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  if (parts.length === 0) {
    throw new BadRequestException("targets query is required");
  }

  const parsed: Array<{ targetType: FavoriteTargetType; targetId: string }> =
    [];

  for (const part of parts) {
    const separatorIndex = part.indexOf(":");
    if (separatorIndex <= 0) {
      throw new BadRequestException(`Invalid target key: ${part}`);
    }

    const targetType = part.slice(0, separatorIndex);
    const targetId = part.slice(separatorIndex + 1);
    if (targetType !== "project" && targetType !== "apartment") {
      throw new BadRequestException(`Invalid target type in key: ${part}`);
    }
    if (targetId.length === 0) {
      throw new BadRequestException(`Invalid target id in key: ${part}`);
    }

    parsed.push({ targetType, targetId });
  }

  return parsed;
};
