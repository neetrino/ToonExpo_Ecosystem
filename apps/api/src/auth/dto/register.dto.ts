import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

import {
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PHONE_MAX_LENGTH,
} from "../../common/constants/app.constants.js";

export class RegisterDto {
  @ApiProperty({ example: "Ani Hakobyan" })
  @IsString()
  @MinLength(1)
  @MaxLength(NAME_MAX_LENGTH)
  name!: string;

  @ApiProperty({ example: "ani@example.com" })
  @IsEmail()
  @MaxLength(EMAIL_MAX_LENGTH)
  email!: string;

  @ApiProperty({ example: "+37491111222" })
  @IsString()
  @MinLength(5)
  @MaxLength(PHONE_MAX_LENGTH)
  @Matches(/^[+0-9()\-\s]+$/, {
    message: "phone must contain digits and optional phone punctuation",
  })
  phone!: string;

  @ApiProperty({ minLength: PASSWORD_MIN_LENGTH, maxLength: PASSWORD_MAX_LENGTH })
  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  password!: string;
}
