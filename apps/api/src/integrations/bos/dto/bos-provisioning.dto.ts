import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

import {
  COMPANY_NAME_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  PHONE_MAX_LENGTH,
} from "../../../common/constants/app.constants.js";
import {
  BOS_COMPANY_ID_MAX_LENGTH,
  BOS_EVENT_CYCLE_MAX_LENGTH,
  BOS_REQUESTED_MODULES,
  BOS_REQUEST_ID_MAX_LENGTH,
} from "../../integrations.constants.js";

enum BosProvisioningCompanyTypeDto {
  builder = "builder",
  partner = "partner",
  bank = "bank",
}

enum BosRequestedModuleDto {
  builder_portal = "builder_portal",
  constructor_crm = "constructor_crm",
  readiness = "readiness",
  partner_profile = "partner_profile",
  bank_offers = "bank_offers",
  analytics = "analytics",
}

/**
 * BOS wire-format provisioning payload (snake_case per integration spec).
 */
export class BosProvisioningRequestDto {
  @ApiProperty({ name: "request_id" })
  @IsString()
  @MinLength(1)
  @MaxLength(BOS_REQUEST_ID_MAX_LENGTH)
  request_id!: string;

  @ApiProperty({ name: "bos_company_id" })
  @IsString()
  @MinLength(1)
  @MaxLength(BOS_COMPANY_ID_MAX_LENGTH)
  bos_company_id!: string;

  @ApiProperty({ name: "company_name" })
  @IsString()
  @MinLength(1)
  @MaxLength(COMPANY_NAME_MAX_LENGTH)
  company_name!: string;

  @ApiProperty({ enum: BosProvisioningCompanyTypeDto, name: "company_type" })
  @IsEnum(BosProvisioningCompanyTypeDto)
  company_type!: BosProvisioningCompanyTypeDto;

  @ApiProperty({ name: "primary_contact_name" })
  @IsString()
  @MinLength(1)
  @MaxLength(NAME_MAX_LENGTH)
  primary_contact_name!: string;

  @ApiProperty({ name: "primary_contact_email" })
  @IsEmail()
  @MaxLength(EMAIL_MAX_LENGTH)
  primary_contact_email!: string;

  @ApiPropertyOptional({ name: "primary_contact_phone" })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(PHONE_MAX_LENGTH)
  primary_contact_phone?: string;

  @ApiPropertyOptional({ name: "event_cycle_id" })
  @IsOptional()
  @IsString()
  @MaxLength(BOS_EVENT_CYCLE_MAX_LENGTH)
  event_cycle_id?: string;

  @ApiPropertyOptional({ name: "event_cycle_name" })
  @IsOptional()
  @IsString()
  @MaxLength(BOS_EVENT_CYCLE_MAX_LENGTH)
  event_cycle_name?: string;

  @ApiProperty({
    enum: BosRequestedModuleDto,
    isArray: true,
    name: "requested_modules",
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(BosRequestedModuleDto, { each: true })
  requested_modules!: BosRequestedModuleDto[];
}

export const isValidBosRequestedModules = (
  modules: readonly string[],
): modules is typeof BOS_REQUESTED_MODULES[number][] =>
  modules.length > 0 &&
  modules.every((moduleKey) =>
    (BOS_REQUESTED_MODULES as readonly string[]).includes(moduleKey),
  );
