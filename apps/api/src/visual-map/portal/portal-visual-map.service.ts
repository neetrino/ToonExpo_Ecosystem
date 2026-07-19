import { Injectable } from '@nestjs/common';
import type {
  PortalVisualCanvasDetail,
  PortalVisualCanvasListResponse,
  PortalVisualHotspotItem,
} from '@toonexpo/contracts';

import type {
  CreatePortalVisualCanvasDto,
  CreatePortalVisualHotspotDto,
  UpdatePortalVisualCanvasDto,
  UpdatePortalVisualHotspotDto,
} from './dto/portal-visual-map.dto.js';
import { PortalVisualMapCanvasService } from './portal-visual-map-canvas.service.js';
import { PortalVisualMapHotspotService } from './portal-visual-map-hotspot.service.js';

@Injectable()
export class PortalVisualMapService {
  constructor(
    private readonly canvasService: PortalVisualMapCanvasService,
    private readonly hotspotService: PortalVisualMapHotspotService,
  ) {}

  listByProject(companyId: string, projectId: string): Promise<PortalVisualCanvasListResponse> {
    return this.canvasService.listByProject(companyId, projectId);
  }

  create(
    companyId: string,
    userId: string,
    projectId: string,
    dto: CreatePortalVisualCanvasDto,
  ): Promise<PortalVisualCanvasDetail> {
    return this.canvasService.create(companyId, userId, projectId, dto);
  }

  getById(companyId: string, canvasId: string): Promise<PortalVisualCanvasDetail> {
    return this.canvasService.getById(companyId, canvasId);
  }

  update(
    companyId: string,
    userId: string,
    canvasId: string,
    dto: UpdatePortalVisualCanvasDto,
  ): Promise<PortalVisualCanvasDetail> {
    return this.canvasService.update(companyId, userId, canvasId, dto);
  }

  remove(companyId: string, canvasId: string): Promise<void> {
    return this.canvasService.remove(companyId, canvasId);
  }

  createHotspot(
    companyId: string,
    userId: string,
    canvasId: string,
    dto: CreatePortalVisualHotspotDto,
  ): Promise<PortalVisualHotspotItem> {
    return this.hotspotService.create(companyId, userId, canvasId, dto);
  }

  updateHotspot(
    companyId: string,
    userId: string,
    canvasId: string,
    hotspotId: string,
    dto: UpdatePortalVisualHotspotDto,
  ): Promise<PortalVisualHotspotItem> {
    return this.hotspotService.update(companyId, userId, canvasId, hotspotId, dto);
  }

  removeHotspot(companyId: string, canvasId: string, hotspotId: string): Promise<void> {
    return this.hotspotService.remove(companyId, canvasId, hotspotId);
  }
}
