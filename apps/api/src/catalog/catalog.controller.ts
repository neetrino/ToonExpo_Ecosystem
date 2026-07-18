import { Controller, Get, Param, Query } from "@nestjs/common";
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type {
  ApartmentDetail,
  BuilderSummary,
  PaginatedResponse,
  ProjectDetail,
  ProjectListItem,
} from "@toonexpo/contracts";

import { OptionalAuth } from "../auth/decorators/optional-auth.decorator.js";
import { OptionalUser } from "../auth/decorators/optional-user.decorator.js";
import { Public } from "../auth/decorators/public.decorator.js";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.js";
import { ApartmentsService } from "./apartments.service.js";
import { BuildersService } from "./builders.service.js";
import { CatalogLocaleQueryDto } from "./dto/catalog-locale.query.dto.js";
import { ListProjectsQueryDto } from "./dto/list-projects.query.dto.js";
import { ProjectsService } from "./projects.service.js";

@ApiTags("catalog")
@Controller()
export class CatalogController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly apartmentsService: ApartmentsService,
    private readonly buildersService: BuildersService,
  ) {}

  @Public()
  @OptionalAuth()
  @Get("projects")
  @ApiOperation({ summary: "List published projects with filters" })
  @ApiOkResponse({ description: "Paginated published projects" })
  listProjects(
    @Query() query: ListProjectsQueryDto,
    @OptionalUser() user: AuthenticatedUser | null,
  ): Promise<PaginatedResponse<ProjectListItem>> {
    return this.projectsService.listProjects(query, {
      locale: query.locale,
      isAuthenticated: user != null,
    });
  }

  @Public()
  @OptionalAuth()
  @Get("projects/:id")
  @ApiOperation({ summary: "Get a published project with buildings and floors" })
  @ApiOkResponse({ description: "Published project detail" })
  @ApiNotFoundResponse({ description: "Project not found or not published" })
  getProject(
    @Param("id") id: string,
    @Query() query: CatalogLocaleQueryDto,
    @OptionalUser() user: AuthenticatedUser | null,
  ): Promise<ProjectDetail> {
    return this.projectsService.getProjectById(id, {
      locale: query.locale,
      isAuthenticated: user != null,
    });
  }

  @Public()
  @OptionalAuth()
  @Get("apartments/:id")
  @ApiOperation({ summary: "Get a published apartment detail" })
  @ApiOkResponse({ description: "Published apartment detail" })
  @ApiNotFoundResponse({ description: "Apartment not found or not published" })
  getApartment(
    @Param("id") id: string,
    @Query() query: CatalogLocaleQueryDto,
    @OptionalUser() user: AuthenticatedUser | null,
  ): Promise<ApartmentDetail> {
    return this.apartmentsService.getApartmentById(id, {
      locale: query.locale,
      isAuthenticated: user != null,
    });
  }

  @Public()
  @OptionalAuth()
  @Get("builders")
  @ApiOperation({ summary: "List active builder companies" })
  @ApiOkResponse({ description: "Active builders with published project counts" })
  listBuilders(
    @Query() query: CatalogLocaleQueryDto,
  ): Promise<BuilderSummary[]> {
    return this.buildersService.listBuilders({
      locale: query.locale,
      isAuthenticated: false,
    });
  }
}
