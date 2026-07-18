import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type { MediaAssetItem, MediaListResponse } from "@toonexpo/contracts";

import { AccountTypes } from "../../auth/decorators/account-types.decorator.js";
import { CurrentUser } from "../../auth/decorators/current-user.decorator.js";
import type { AuthenticatedUser } from "../../auth/types/authenticated-user.js";
import { CompanyMember } from "../../company/decorators/company-member.decorator.js";
import { CurrentCompanyMember } from "../../company/decorators/current-company-member.decorator.js";
import { CompanyMemberGuard } from "../../company/guards/company-member.guard.js";
import type { CompanyMemberContext } from "../../company/types/company-member-context.js";
import { ListMediaQueryDto } from "../dto/list-media.query.dto.js";
import { MEDIA_UPLOAD_FIELD_NAME } from "../media.constants.js";
import { MediaUploadService } from "../media-upload.service.js";
import type { UploadedImageFile } from "../uploaded-file.type.js";

@ApiTags("portal-media")
@AccountTypes("company_member")
@CompanyMember()
@UseGuards(CompanyMemberGuard)
@Controller()
export class PortalMediaController {
  constructor(private readonly mediaUpload: MediaUploadService) {}

  @Get("portal/media")
  @ApiOperation({ summary: "List company media assets" })
  @ApiOkResponse({ description: "Paginated media list" })
  list(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @Query() query: ListMediaQueryDto,
  ): Promise<MediaListResponse> {
    return this.mediaUpload.listCompanyMedia(
      member.companyId,
      query.page,
      query.pageSize,
    );
  }

  @Post("portal/media")
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Upload a company media image" })
  @ApiCreatedResponse({ description: "Uploaded media asset" })
  @UseInterceptors(
    FileInterceptor(MEDIA_UPLOAD_FIELD_NAME, {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  upload(
    @CurrentCompanyMember() member: CompanyMemberContext,
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file?: UploadedImageFile,
  ): Promise<MediaAssetItem> {
    if (!file) {
      throw new BadRequestException("Image file is required");
    }

    return this.mediaUpload.uploadImage({
      buffer: file.buffer,
      mimeType: file.mimetype,
      originalFilename: file.originalname,
      uploadedByUserId: user.id,
      scope: { kind: "company", companyId: member.companyId },
    });
  }
}
