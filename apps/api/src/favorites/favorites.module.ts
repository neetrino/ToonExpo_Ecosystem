import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module.js";
import { BuyerFavoritesController } from "./buyer-favorites.controller.js";
import { BuyerFavoritesService } from "./buyer-favorites.service.js";

@Module({
  imports: [PrismaModule],
  controllers: [BuyerFavoritesController],
  providers: [BuyerFavoritesService],
})
export class FavoritesModule {}
