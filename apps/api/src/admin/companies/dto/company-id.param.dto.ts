import { IsString, MinLength } from "class-validator";

/**
 * Route params for `/admin/companies/:companyId/*` nested routes.
 */
export class CompanyIdParamDto {
  @IsString()
  @MinLength(1)
  companyId!: string;
}
