import { Module } from '@nestjs/common';

import { InventoryHubService } from './inventory-hub.service.js';

@Module({
  providers: [InventoryHubService],
  exports: [InventoryHubService],
})
export class InventoryHubModule {}
