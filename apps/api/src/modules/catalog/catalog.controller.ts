import { Controller, Get, Inject, NotFoundException, Param, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { slugSchema } from '@toonexpo/contracts';
import { PARTNER_TYPES, type PartnerType } from '@toonexpo/domain';
import type { Request } from 'express';

import { SESSION_COOKIE_NAME } from '../auth/auth.constants';
import { SessionService } from '../auth/session.service';
import { CatalogBuildersService } from './catalog-builders.service';
import { CatalogPartnersService } from './catalog-partners.service';
import { APARTMENT_ID_PATTERN, CatalogProjectsService } from './catalog-projects.service';
import { CatalogSettingsService } from './catalog-settings.service';

const CITY_FILTER_MAX_LENGTH = 80;

type RequestWithCookies = Request & {
  cookies?: Record<string, unknown>;
};

@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  constructor(
    @Inject(CatalogProjectsService) private readonly projects: CatalogProjectsService,
    @Inject(CatalogBuildersService) private readonly builders: CatalogBuildersService,
    @Inject(CatalogPartnersService) private readonly partners: CatalogPartnersService,
    @Inject(CatalogSettingsService) private readonly settings: CatalogSettingsService,
    @Inject(SessionService) private readonly sessions: SessionService,
  ) {}

  @Get('projects')
  @ApiOperation({ summary: 'List published projects' })
  listProjects(@Query('city') city?: string, @Query('builder') builder?: string) {
    return this.projects.list({
      city: normalizeCity(city),
      builderSlug: parseSlug(builder),
    });
  }

  @Get('projects/:companySlug/:projectSlug/apartments/:apartmentId')
  @ApiOperation({ summary: 'Get a published apartment' })
  @ApiResponse({ status: 404, description: 'Published apartment not found' })
  async getApartment(
    @Param('companySlug') companySlug: string,
    @Param('projectSlug') projectSlug: string,
    @Param('apartmentId') apartmentId: string,
    @Req() request: RequestWithCookies,
  ) {
    const parsedCompany = slugSchema.safeParse(companySlug);
    const parsedProject = slugSchema.safeParse(projectSlug);
    if (
      !parsedCompany.success ||
      !parsedProject.success ||
      !APARTMENT_ID_PATTERN.test(apartmentId)
    ) {
      throw new NotFoundException();
    }
    const authenticated = await this.isAuthenticated(request);
    const result = await this.projects.apartment(
      parsedCompany.data,
      parsedProject.data,
      apartmentId,
      authenticated,
    );
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  @Get('projects/:companySlug/:projectSlug')
  @ApiOperation({ summary: 'Get a published project' })
  @ApiResponse({ status: 404, description: 'Published project not found' })
  async getProject(
    @Param('companySlug') companySlug: string,
    @Param('projectSlug') projectSlug: string,
    @Req() request: RequestWithCookies,
  ) {
    const parsedCompany = slugSchema.safeParse(companySlug);
    const parsedProject = slugSchema.safeParse(projectSlug);
    if (!parsedCompany.success || !parsedProject.success) {
      throw new NotFoundException();
    }
    const authenticated = await this.isAuthenticated(request);
    const result = await this.projects.detail(
      parsedCompany.data,
      parsedProject.data,
      authenticated,
    );
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  @Get('builders')
  @ApiOperation({ summary: 'List public builders' })
  listBuilders() {
    return this.builders.list();
  }

  @Get('builders/:slug')
  @ApiOperation({ summary: 'Get a public builder' })
  async getBuilder(@Param('slug') slug: string) {
    const parsed = slugSchema.safeParse(slug);
    const result = parsed.success ? await this.builders.detail(parsed.data) : null;
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  @Get('partners')
  @ApiOperation({ summary: 'List published partners' })
  listPartners(@Query('type') type?: string) {
    return this.partners.list(parsePartnerType(type));
  }

  @Get('partners/:slug')
  @ApiOperation({ summary: 'Get a published partner' })
  async getPartner(@Param('slug') slug: string) {
    const parsed = slugSchema.safeParse(slug);
    const result = parsed.success ? await this.partners.detail(parsed.data) : null;
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  @Get('bank-offers')
  @ApiOperation({ summary: 'List published bank offers' })
  listBankOffers() {
    return this.partners.bankOffers();
  }

  @Get('platform-settings')
  @ApiOperation({ summary: 'Get public platform settings' })
  getPlatformSettings() {
    return this.settings.load();
  }

  private async isAuthenticated(request: RequestWithCookies): Promise<boolean> {
    const rawToken = request.cookies?.[SESSION_COOKIE_NAME];
    const token = typeof rawToken === 'string' ? rawToken : undefined;
    return Boolean(await this.sessions.resolveSession(token));
  }
}

function normalizeCity(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length <= CITY_FILTER_MAX_LENGTH ? trimmed : undefined;
}

function parseSlug(value?: string): string | undefined {
  const parsed = slugSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

function parsePartnerType(value?: string): PartnerType | undefined {
  return PARTNER_TYPES.find((type) => type === value);
}
