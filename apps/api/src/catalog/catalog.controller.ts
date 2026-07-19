import { Controller, Get, Param, Query } from "@nestjs/common";
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type {
  ApartmentDetail,
  BuilderDetail,
  BuilderSummary,
  BuildingDetail,
  FloorDetail,
  PaginatedResponse,
  ProjectDetail,
  ProjectListItem,
} from "@toonexpo/contracts";

import { OptionalAuth } from "../auth/decorators/optional-auth.decorator.js";
import { OptionalUser } from "../auth/decorators/optional-user.decorator.js";
import { Public } from "../auth/decorators/public.decorator.js";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.js";
import { ApartmentsService } from "./apartments.service.js";
import { BuildingsCatalogService } from "./buildings-catalog.service.js";
import { BuildersService } from "./builders.service.js";
import { CatalogLocaleQueryDto } from "./dto/catalog-locale.query.dto.js";
import { ListProjectsQueryDto } from "./dto/list-projects.query.dto.js";
import { FloorsCatalogService } from "./floors-catalog.service.js";
import { ProjectsService } from "./projects.service.js";

@ApiTags("catalog")
@Controller()
export class CatalogController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly apartmentsService: ApartmentsService,
    private readonly buildersService: BuildersService,
    private readonly buildingsCatalogService: BuildingsCatalogService,
    private readonly floorsCatalogService: FloorsCatalogService,
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

  @Public()
  @OptionalAuth()
  @Get("builders/:id")
  @ApiOperation({ summary: "Get a builder profile with published projects" })
  @ApiOkResponse({ description: "Builder public profile" })
  @ApiNotFoundResponse({ description: "Builder not found" })
  getBuilder(
    @Param("id") id: string,
    @Query() query: CatalogLocaleQueryDto,
    @OptionalUser() user: AuthenticatedUser | null,
  ): Promise<BuilderDetail> {
    return this.buildersService.getBuilderById(id, {
      locale: query.locale,
      isAuthenticated: user != null,
    });
  }

  @Public()
  @OptionalAuth()
  @Get("buildings/:id")
  @ApiOperation({ summary: "Get a published building with floors" })
  @ApiOkResponse({ description: "Published building detail" })
  @ApiNotFoundResponse({ description: "Building not found or not published" })
  getBuilding(
    @Param("id") id: string,
    @Query() query: CatalogLocaleQueryDto,
    @OptionalUser() user: AuthenticatedUser | null,
  ): Promise<BuildingDetail> {
    return this.buildingsCatalogService.getBuildingById(id, {
      locale: query.locale,
      isAuthenticated: user != null,
    });
  }

  @Public()
  @OptionalAuth()
  @Get("floors/:id")
  @ApiOperation({ summary: "Get a published floor with apartments" })
  @ApiOkResponse({ description: "Published floor detail" })
  @ApiNotFoundResponse({ description: "Floor not found or not published" })
  getFloor(
    @Param("id") id: string,
    @Query() query: CatalogLocaleQueryDto,
    @OptionalUser() user: AuthenticatedUser | null,
  ): Promise<FloorDetail> {
    return this.floorsCatalogService.getFloorById(id, {
      locale: query.locale,
      isAuthenticated: user != null,
    });
  }
}
