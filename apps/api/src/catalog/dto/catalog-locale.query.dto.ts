import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsOptional, IsString } from "class-validator";

/**
 * Shared `?locale=` query for public catalog endpoints.
 * Unknown locales are accepted and fall back to Armenian in the service layer.
 */
export class CatalogLocaleQueryDto {
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
