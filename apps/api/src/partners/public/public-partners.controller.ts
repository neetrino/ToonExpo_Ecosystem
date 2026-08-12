import { Controller, Get, Param, Query } from "@nestjs/common";
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type {
  PublicPartnerDetail,
  PublicPartnerFacetsResponse,
  PublicPartnerListResponse,
} from "@toonexpo/contracts";

import { Public } from "../../auth/decorators/public.decorator.js";
import {
  ListPublicPartnersQueryDto,
  PublicPartnerSlugQueryDto,
} from "./dto/list-public-partners.query.dto.js";
import { PublicPartnersService } from "./public-partners.service.js";

@ApiTags("partners")
@Controller("partners")
export class PublicPartnersController {
  constructor(private readonly partners: PublicPartnersService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: "List published active partners" })
  @ApiOkResponse({ description: "Paginated public partners" })
  list(
    @Query() query: ListPublicPartnersQueryDto,
  ): Promise<PublicPartnerListResponse> {
    return this.partners.list(query);
  }

  @Public()
  @Get("facets")
  @ApiOperation({
    summary: "Partner filter facets (types with at least one published partner)",
  })
  @ApiOkResponse({ description: "Available public partner filter options" })
  async listFacets(): Promise<PublicPartnerFacetsResponse> {
    const types = await this.partners.listAvailableTypes();
    return { types };
  }

  @Public()
  @Get(":slug")
  @ApiOperation({ summary: "Get published partner detail by slug" })
  @ApiOkResponse({ description: "Public partner detail" })
  @ApiNotFoundResponse({ description: "Partner not found or not published" })
  getBySlug(
    @Param("slug") slug: string,
    @Query() query: PublicPartnerSlugQueryDto,
  ): Promise<PublicPartnerDetail> {
    return this.partners.getBySlug(slug, query.locale);
  }
}
