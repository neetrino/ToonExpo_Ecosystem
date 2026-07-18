"use client";

import { useTranslations } from "next-intl";

import type { EditableRouteEdge } from "@/features/exhibition/components/admin/admin-route-graph-types";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

type AdminRouteGraphEdgesTableProps = {
  edges: EditableRouteEdge[];
  nodeIds: string[];
  onChange: (edges: EditableRouteEdge[]) => void;
};

type NodeSelectProps = {
  value: string;
  nodeIds: string[];
  onChange: (value: string) => void;
};

const NodeSelect = ({ value, nodeIds, onChange }: NodeSelectProps) => (
  <select
    className="h-10 w-full rounded-sm border border-border bg-background px-2 text-xs"
    value={value}
    onChange={(event) => onChange(event.target.value)}
  >
    {nodeIds.map((id) => (
      <option key={id} value={id}>
        {id.slice(0, 8)}
      </option>
    ))}
  </select>
);

/**
 * Editable route edge rows for the admin route graph editor.
 */
export const AdminRouteGraphEdgesTable = ({
  edges,
  nodeIds,
  onChange,
}: AdminRouteGraphEdgesTableProps) => {
  const t = useTranslations("Admin.events.routeGraph");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase text-ink-muted">{t("edges")}</p>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            onChange([
              ...edges,
              {
                fromNodeId: nodeIds[0] ?? "",
                toNodeId: nodeIds[1] ?? nodeIds[0] ?? "",
                weight: "",
                accessible: true,
              },
            ]);
          }}
        >
          {t("addEdge")}
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-ink-muted">
              <th className="px-2 py-2">{t("from")}</th>
              <th className="px-2 py-2">{t("to")}</th>
              <th className="px-2 py-2">{t("weight")}</th>
              <th className="px-2 py-2">{t("accessible")}</th>
            </tr>
          </thead>
          <tbody>
            {edges.map((edge, index) => (
              <tr
                key={`${edge.fromNodeId}-${edge.toNodeId}-${index}`}
                className="border-b border-border"
              >
                <td className="px-2 py-2">
                  <NodeSelect
                    value={edge.fromNodeId}
                    nodeIds={nodeIds}
                    onChange={(value) => {
                      const next = [...edges];
                      next[index] = { ...edge, fromNodeId: value };
                      onChange(next);
                    }}
                  />
                </td>
                <td className="px-2 py-2">
                  <NodeSelect
                    value={edge.toNodeId}
                    nodeIds={nodeIds}
                    onChange={(value) => {
                      const next = [...edges];
                      next[index] = { ...edge, toNodeId: value };
                      onChange(next);
                    }}
                  />
                </td>
                <td className="px-2 py-2">
                  <Input
                    type="number"
                    min={0}
                    value={edge.weight}
                    onChange={(event) => {
                      const next = [...edges];
                      next[index] = { ...edge, weight: event.target.value };
                      onChange(next);
                    }}
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="checkbox"
                    checked={edge.accessible}
                    onChange={(event) => {
                      const next = [...edges];
                      next[index] = { ...edge, accessible: event.target.checked };
                      onChange(next);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
