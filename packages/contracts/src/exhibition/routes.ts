export type RouteNodeType =
  | "entrance"
  | "intersection"
  | "booth"
  | "info"
  | "other";

export type RouteNodeInput = {
  id?: string;
  code?: string;
  label?: string;
  xPercent: number;
  yPercent: number;
  type: RouteNodeType;
  boothId?: string;
};

export type RouteEdgeInput = {
  fromNodeId: string;
  toNodeId: string;
  weight?: number;
  accessible?: boolean;
};

export type RouteGraphPayload = {
  nodes: RouteNodeInput[];
  edges: RouteEdgeInput[];
};

export type RouteNodeSummary = {
  id: string;
  venueMapId: string;
  code: string | null;
  label: string | null;
  xPercent: string;
  yPercent: string;
  type: RouteNodeType;
  boothId: string | null;
};

export type RouteEdgeSummary = {
  id: string;
  venueMapId: string;
  fromNodeId: string;
  toNodeId: string;
  weight: string | null;
  accessible: boolean | null;
};

export type RouteGraphResponse = {
  nodes: RouteNodeSummary[];
  edges: RouteEdgeSummary[];
};

export type RoutePathNode = {
  id: string;
  xPercent: string;
  yPercent: string;
  label: string | null;
  type: RouteNodeType;
};

export type RoutePathResponse = {
  routeAvailable: boolean;
  nodes: RoutePathNode[];
};

export type PublicEntranceNode = {
  id: string;
  code: string | null;
  label: string | null;
  xPercent: string;
  yPercent: string;
};

export type PublicEntranceNodeListResponse = {
  data: PublicEntranceNode[];
};
