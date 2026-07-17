import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  favoriteToggleInputSchema,
  type FavoriteListItem,
  type FavoriteMutationResponse,
  type FavoriteStatusResponse,
  type FavoriteToggleInput,
} from '@toonexpo/contracts';

import { AppOriginGuard } from '../auth/app-origin.guard';
import { CsrfGuard } from '../auth/csrf.guard';
import { SessionAuthGuard, type RequestWithAuth } from '../auth/session-auth.guard';
import { allowFavoriteToggleRequest } from './favorites-rate-limit';
import { FavoritesService } from './favorites.service';

@ApiTags('favorites')
@ApiCookieAuth()
@Controller('favorites')
@UseGuards(AppOriginGuard, SessionAuthGuard, CsrfGuard)
export class FavoritesController {
  constructor(@Inject(FavoritesService) private readonly favorites: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'List the signed-in buyer favorites' })
  list(@Req() request: RequestWithAuth): Promise<FavoriteListItem[]> {
    return this.favorites.list(requireBuyerId(request));
  }

  @Get('status')
  @ApiOperation({ summary: 'Get favorite state for a project or apartment' })
  async status(
    @Query() query: unknown,
    @Req() request: RequestWithAuth,
  ): Promise<FavoriteStatusResponse> {
    const input = parseInput(query);
    const favorited = await this.favorites.isFavorited(requireBuyerId(request), input);
    return { favorited };
  }

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Add a buyer favorite' })
  add(@Body() body: unknown, @Req() request: RequestWithAuth): Promise<FavoriteMutationResponse> {
    return this.runMutation(request, parseInput(body), 'add');
  }

  @Post('toggle')
  @HttpCode(200)
  @ApiOperation({ summary: 'Toggle a buyer favorite' })
  toggle(
    @Body() body: unknown,
    @Req() request: RequestWithAuth,
  ): Promise<FavoriteMutationResponse> {
    return this.runMutation(request, parseInput(body), 'toggle');
  }

  @Delete()
  @HttpCode(200)
  @ApiOperation({ summary: 'Remove a buyer favorite' })
  remove(
    @Body() body: unknown,
    @Req() request: RequestWithAuth,
  ): Promise<FavoriteMutationResponse> {
    return this.runMutation(request, parseInput(body), 'remove');
  }

  @ApiResponse({ status: 400, description: 'Invalid favorite target' })
  @ApiResponse({ status: 401, description: 'Buyer authentication required' })
  @ApiResponse({ status: 404, description: 'Published target not found' })
  @ApiResponse({ status: 429, description: 'Rate limited' })
  private async runMutation(
    request: RequestWithAuth,
    input: FavoriteToggleInput,
    action: 'add' | 'remove' | 'toggle',
  ): Promise<FavoriteMutationResponse> {
    const userId = requireBuyerId(request);
    if (!(await allowFavoriteToggleRequest(userId))) {
      throwApiError('rateLimited', HttpStatus.TOO_MANY_REQUESTS);
    }

    const result = await this.favorites[action](userId, input);
    if (!result) {
      throwApiError('notFound', HttpStatus.NOT_FOUND);
    }
    return result;
  }
}

function requireBuyerId(request: RequestWithAuth): string {
  const session = request.authSession;
  if (!session || session.user.role !== 'BUYER') {
    throw new UnauthorizedException({ error: 'unauthorized' });
  }
  return session.user.id;
}

function parseInput(raw: unknown): FavoriteToggleInput {
  const parsed = favoriteToggleInputSchema.safeParse(raw);
  if (!parsed.success) {
    throwApiError('invalidInput', HttpStatus.BAD_REQUEST);
  }
  return parsed.data;
}

function throwApiError(error: string, status: HttpStatus): never {
  throw new HttpException({ error }, status);
}
