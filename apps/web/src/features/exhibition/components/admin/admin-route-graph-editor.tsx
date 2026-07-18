"use client";

import type {
  RouteEdgeSummary,
  RouteGraphPayload,
  RouteNodeSummary,
} from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { AdminRouteGraphEdgesTable } from "@/features/exhibition/components/admin/admin-route-graph-edges-table";
import { AdminRouteGraphNodesTable } from "@/features/exhibition/components/admin/admin-route-graph-nodes-table";
import {
  toEditableRouteEdge,
  toEditableRouteNode,
  type EditableRouteEdge,
  type EditableRouteNode,
} from "@/features/exhibition/components/admin/admin-route-graph-types";
import { useReplaceAdminRouteGraphMutation } from "@/features/exhibition/hooks/use-exhibition";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

type AdminRouteGraphEditorProps = {
  mapId: string;
  initialNodes: RouteNodeSummary[];
  initialEdges: RouteEdgeSummary[];
  boothOptions: { id: string; code: string }[];
};

/**
 * Table-based route graph editor (nodes + edges).
 */
export const AdminRouteGraphEditor = ({
  mapId,
  initialNodes,
  initialEdges,
  boothOptions,
}: AdminRouteGraphEditorProps) => {
  const t = useTranslations("Admin.events.routeGraph");
  const mutation = useReplaceAdminRouteGraphMutation(mapId);
  const [nodes, setNodes] = useState<EditableRouteNode[]>(() =>
    initialNodes.map(toEditableRouteNode),
  );
  const [edges, setEdges] = useState<EditableRouteEdge[]>(() =>
    initialEdges.map(toEditableRouteEdge),
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setNodes(initialNodes.map(toEditableRouteNode));
    setEdges(initialEdges.map(toEditableRouteEdge));
  }, [initialNodes, initialEdges]);

  const nodeIds = nodes.map((node) => node.localId);

  const onSave = async () => {
    const payload: RouteGraphPayload = {
      nodes: nodes.map((node) => ({
        ...(node.id ? { id: node.id } : {}),
        ...(node.code ? { code: node.code } : {}),
        ...(node.label ? { label: node.label } : {}),
        type: node.type,
        xPercent: node.xPercent,
        yPercent: node.yPercent,
        ...(node.boothId ? { boothId: node.boothId } : {}),
      })),
      edges: edges.map((edge) => ({
        fromNodeId: edge.fromNodeId,
        toNodeId: edge.toNodeId,
        ...(edge.weight ? { weight: Number(edge.weight) } : {}),
        accessible: edge.accessible,
      })),
    };
    await mutation.mutateAsync(payload);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink">{t("title")}</h3>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={mutation.isPending}
          onClick={() => {
            void onSave();
          }}
        >
          {mutation.isPending ? t("saving") : t("save")}
        </Button>
      </div>
      {saved ? <p className="text-sm text-success">{t("saved")}</p> : null}
      <AdminRouteGraphNodesTable
        nodes={nodes}
        boothOptions={boothOptions}
        onChange={setNodes}
      />
      <AdminRouteGraphEdgesTable
        edges={edges}
        nodeIds={nodeIds}
        onChange={setEdges}
      />
    </Card>
  );
};
