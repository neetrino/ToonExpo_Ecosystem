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

import { Public } from "../auth/decorators/public.decorator.js";
import { ApartmentsService } from "./apartments.service.js";
import { BuildersService } from "./builders.service.js";
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
  @Get("projects")
  @ApiOperation({ summary: "List published projects with filters" })
  @ApiOkResponse({ description: "Paginated published projects" })
  listProjects(
    @Query() query: ListProjectsQueryDto,
  ): Promise<PaginatedResponse<ProjectListItem>> {
    return this.projectsService.listProjects(query);
  }

  @Public()
  @Get("projects/:id")
  @ApiOperation({ summary: "Get a published project with buildings and floors" })
  @ApiOkResponse({ description: "Published project detail" })
  @ApiNotFoundResponse({ description: "Project not found or not published" })
  getProject(@Param("id") id: string): Promise<ProjectDetail> {
    return this.projectsService.getProjectById(id);
  }

  @Public()
  @Get("apartments/:id")
  @ApiOperation({ summary: "Get a published apartment detail" })
  @ApiOkResponse({ description: "Published apartment detail" })
  @ApiNotFoundResponse({ description: "Apartment not found or not published" })
  getApartment(@Param("id") id: string): Promise<ApartmentDetail> {
    return this.apartmentsService.getApartmentById(id);
  }

  @Public()
  @Get("builders")
  @ApiOperation({ summary: "List active builder companies" })
  @ApiOkResponse({ description: "Active builders with published project counts" })
  listBuilders(): Promise<BuilderSummary[]> {
    return this.buildersService.listBuilders();
  }
}
