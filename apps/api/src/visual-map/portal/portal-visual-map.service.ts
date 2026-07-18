import { Injectable } from "@nestjs/common";
import type {
  PortalVisualCanvasDetail,
  PortalVisualCanvasListResponse,
  PortalVisualHotspotItem,
} from "@toonexpo/contracts";

import type { CompanyMemberContext } from "../../company/types/company-member-context.js";
import type {
  CreatePortalVisualCanvasDto,
  CreatePortalVisualHotspotDto,
  UpdatePortalVisualCanvasDto,
  UpdatePortalVisualHotspotDto,
} from "./dto/portal-visual-map.dto.js";
import { PortalVisualMapCanvasService } from "./portal-visual-map-canvas.service.js";
import { PortalVisualMapHotspotService } from "./portal-visual-map-hotspot.service.js";

@Injectable()
export class PortalVisualMapService {
  constructor(
    private readonly canvasService: PortalVisualMapCanvasService,
    private readonly hotspotService: PortalVisualMapHotspotService,
  ) {}

  listByProject(
    member: CompanyMemberContext,
    projectId: string,
  ): Promise<PortalVisualCanvasListResponse> {
    return this.canvasService.listByProject(member, projectId);
  }

  create(
    member: CompanyMemberContext,
    userId: string,
    projectId: string,
    dto: CreatePortalVisualCanvasDto,
  ): Promise<PortalVisualCanvasDetail> {
    return this.canvasService.create(member, userId, projectId, dto);
  }

  getById(
    member: CompanyMemberContext,
    canvasId: string,
  ): Promise<PortalVisualCanvasDetail> {
    return this.canvasService.getById(member, canvasId);
  }

  update(
    member: CompanyMemberContext,
    userId: string,
    canvasId: string,
    dto: UpdatePortalVisualCanvasDto,
  ): Promise<PortalVisualCanvasDetail> {
    return this.canvasService.update(member, userId, canvasId, dto);
  }

  remove(member: CompanyMemberContext, canvasId: string): Promise<void> {
    return this.canvasService.remove(member, canvasId);
  }

  createHotspot(
    member: CompanyMemberContext,
    userId: string,
    canvasId: string,
    dto: CreatePortalVisualHotspotDto,
  ): Promise<PortalVisualHotspotItem> {
    return this.hotspotService.create(member, userId, canvasId, dto);
  }

  updateHotspot(
    member: CompanyMemberContext,
    userId: string,
    canvasId: string,
    hotspotId: string,
    dto: UpdatePortalVisualHotspotDto,
  ): Promise<PortalVisualHotspotItem> {
    return this.hotspotService.update(member, userId, canvasId, hotspotId, dto);
  }

  removeHotspot(
    member: CompanyMemberContext,
    canvasId: string,
    hotspotId: string,
  ): Promise<void> {
    return this.hotspotService.remove(member, canvasId, hotspotId);
  }
}
