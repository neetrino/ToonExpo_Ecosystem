import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, MaxLength } from "class-validator";

import { EMAIL_MAX_LENGTH } from "../../common/constants/app.constants.js";

export class ForgotPasswordDto {
  @ApiProperty({ example: "ani@example.com" })
  @IsEmail()
  @MaxLength(EMAIL_MAX_LENGTH)
  email!: string;
}
