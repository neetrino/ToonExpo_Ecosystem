import { IsString, MinLength } from "class-validator";

import { CatalogLocaleQueryDto } from "../../../catalog/dto/catalog-locale.query.dto.js";

export class BoothSearchQueryDto extends CatalogLocaleQueryDto {
  @IsString()
  @MinLength(1)
  q!: string;
}
