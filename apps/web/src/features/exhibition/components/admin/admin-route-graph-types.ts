import type { RouteEdgeSummary, RouteNodeSummary, RouteNodeType } from "@toonexpo/contracts";

export type EditableRouteNode = {
  localId: string;
  id?: string | undefined;
  code: string;
  label: string;
  type: RouteNodeType;
  xPercent: number;
  yPercent: number;
  boothId: string;
};

export type EditableRouteEdge = {
  fromNodeId: string;
  toNodeId: string;
  weight: string;
  accessible: boolean;
};

export const toEditableRouteNode = (node: RouteNodeSummary): EditableRouteNode => ({
  localId: node.id,
  id: node.id,
  code: node.code ?? "",
  label: node.label ?? "",
  type: node.type,
  xPercent: Number(node.xPercent),
  yPercent: Number(node.yPercent),
  boothId: node.boothId ?? "",
});

export const toEditableRouteEdge = (edge: RouteEdgeSummary): EditableRouteEdge => ({
  fromNodeId: edge.fromNodeId,
  toNodeId: edge.toNodeId,
  weight: edge.weight ?? "",
  accessible: edge.accessible ?? true,
});
