import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";

enum PublicationStatusDto {
  draft = "draft",
  published = "published",
  archived = "archived",
}

export class UpdatePortalPublicationDto {
  @ApiProperty({ enum: PublicationStatusDto })
  @IsEnum(PublicationStatusDto)
  publicationStatus!: PublicationStatusDto;
}
