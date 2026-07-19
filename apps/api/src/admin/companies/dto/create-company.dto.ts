import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

import {
  COMPANY_DESCRIPTION_MAX_LENGTH,
  COMPANY_NAME_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  PHONE_MAX_LENGTH,
} from "../../../common/constants/app.constants.js";

enum CompanyTypeDto {
  builder = "builder",
  partner = "partner",
  bank = "bank",
  service = "service",
}

export class CreateCompanyDto {
  @ApiProperty({ example: "Glendale Hills" })
  @IsString()
  @MinLength(1)
  @MaxLength(COMPANY_NAME_MAX_LENGTH)
  name!: string;

  @ApiProperty({ enum: CompanyTypeDto })
  @IsEnum(CompanyTypeDto)
  type!: CompanyTypeDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(COMPANY_DESCRIPTION_MAX_LENGTH)
  description?: string;

  @ApiProperty({ example: "Anna Admin" })
  @IsString()
  @MinLength(1)
  @MaxLength(NAME_MAX_LENGTH)
  adminName!: string;

  @ApiProperty({ example: "admin@builder.example" })
  @IsEmail()
  @MaxLength(EMAIL_MAX_LENGTH)
  adminEmail!: string;

  @ApiPropertyOptional({ example: "+37491111222" })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(PHONE_MAX_LENGTH)
  adminPhone?: string;

  @ApiPropertyOptional({ example: "en" })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(8)
  locale?: string;
}
