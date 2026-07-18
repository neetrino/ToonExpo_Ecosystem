import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";

enum CompanyMemberRoleDto {
  company_admin = "company_admin",
  member = "member",
}

enum CompanyMemberStatusDto {
  active = "active",
  inactive = "inactive",
  removed = "removed",
}

export class UpdateCompanyMemberDto {
  @ApiPropertyOptional({ enum: CompanyMemberRoleDto })
  @IsOptional()
  @IsEnum(CompanyMemberRoleDto)
  role?: CompanyMemberRoleDto;

  @ApiPropertyOptional({ enum: CompanyMemberStatusDto })
  @IsOptional()
  @IsEnum(CompanyMemberStatusDto)
  status?: CompanyMemberStatusDto;
}
