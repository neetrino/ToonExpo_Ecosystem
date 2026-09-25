import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsObject, ValidateNested } from 'class-validator';

class PublicSitePagesMapDto {
  @ApiProperty()
  @IsBoolean()
  apartments!: boolean;

  @ApiProperty()
  @IsBoolean()
  projects!: boolean;

  @ApiProperty()
  @IsBoolean()
  partners!: boolean;

  @ApiProperty()
  @IsBoolean()
  insights!: boolean;

  @ApiProperty()
  @IsBoolean()
  mortgage!: boolean;

  @ApiProperty()
  @IsBoolean()
  expo!: boolean;

  @ApiProperty()
  @IsBoolean()
  map!: boolean;

  @ApiProperty()
  @IsBoolean()
  discover!: boolean;
}

export class UpdatePublicSitePagesDto {
  @ApiProperty({ type: PublicSitePagesMapDto })
  @IsObject()
  @ValidateNested()
  @Type(() => PublicSitePagesMapDto)
  pages!: PublicSitePagesMapDto;
}
