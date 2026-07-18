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
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  PHONE_MAX_LENGTH,
} from "../../common/constants/app.constants.js";

enum CompanyMemberRoleDto {
  company_admin = "company_admin",
  member = "member",
}

export class InviteCompanyMemberDto {
  @ApiProperty({ example: "Karen Member" })
  @IsString()
  @MinLength(1)
  @MaxLength(NAME_MAX_LENGTH)
  name!: string;

  @ApiProperty({ example: "karen@builder.example" })
  @IsEmail()
  @MaxLength(EMAIL_MAX_LENGTH)
  email!: string;

  @ApiPropertyOptional({ example: "+37491111333" })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(PHONE_MAX_LENGTH)
  phone?: string;

  @ApiProperty({ enum: CompanyMemberRoleDto })
  @IsEnum(CompanyMemberRoleDto)
  role!: CompanyMemberRoleDto;

  @ApiPropertyOptional({ example: "en" })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(8)
  locale?: string;
}
