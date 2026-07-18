import { IsString, MaxLength, MinLength } from "class-validator";

const TOKEN_MIN_LENGTH = 8;
const TOKEN_MAX_LENGTH = 2048;

/**
 * Body for POST /qr/resolve — opaque token or full payload URL.
 */
export class ResolveQrDto {
  @IsString()
  @MinLength(TOKEN_MIN_LENGTH)
  @MaxLength(TOKEN_MAX_LENGTH)
  token!: string;
}
