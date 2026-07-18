import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
} from "@nestjs/common";
import {
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type {
  BuyerFavoritesListResponse,
  BuyerFavoritesStatusResponse,
} from "@toonexpo/contracts";

import { AccountTypes } from "../auth/decorators/account-types.decorator.js";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.js";
import { BuyerFavoritesService } from "./buyer-favorites.service.js";
import {
  FavoriteTargetParamsDto,
  FavoritesLocaleQueryDto,
  FavoritesStatusQueryDto,
  parseFavoritesStatusTargets,
} from "./dto/favorites.dto.js";

@ApiTags("buyer-favorites")
@AccountTypes("buyer")
@Controller("buyer/favorites")
export class BuyerFavoritesController {
  constructor(private readonly favorites: BuyerFavoritesService) {}

  @Put(":targetType/:targetId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Add favorite (idempotent)" })
  @ApiNoContentResponse({ description: "Favorite saved" })
  add(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: FavoriteTargetParamsDto,
  ): Promise<void> {
    return this.favorites.add(user.id, params.targetType, params.targetId);
  }

  @Delete(":targetType/:targetId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove favorite (idempotent)" })
  @ApiNoContentResponse({ description: "Favorite removed if present" })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: FavoriteTargetParamsDto,
  ): Promise<void> {
    return this.favorites.remove(user.id, params.targetType, params.targetId);
  }

  @Get()
  @ApiOperation({
    summary: "List my favorites with catalog card data (newest first)",
  })
  @ApiOkResponse({ description: "Flat favorites list" })
  listMine(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: FavoritesLocaleQueryDto,
  ): Promise<BuyerFavoritesListResponse> {
    return this.favorites.listMine(user.id, query.locale);
  }

  @Get("status")
  @ApiOperation({ summary: "Batch favorite status for catalog heart icons" })
  @ApiOkResponse({ description: "Favorited target keys" })
  statusBatch(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: FavoritesStatusQueryDto,
  ): Promise<BuyerFavoritesStatusResponse> {
    const targets = parseFavoritesStatusTargets(query.targets);
    return this.favorites.statusBatch(user.id, targets);
  }
}
