'use client';

import { useTranslations } from 'next-intl';

import { EXHIBITION_ROUTE_NODE_TYPES } from '@/features/exhibition/constants';
import type { EditableRouteNode } from '@/features/exhibition/components/admin/admin-route-graph-types';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';

type AdminRouteGraphNodesTableProps = {
  nodes: EditableRouteNode[];
  boothOptions: { id: string; code: string }[];
  onChange: (nodes: EditableRouteNode[]) => void;
};

/**
 * Editable route node rows for the admin route graph editor.
 */
export const AdminRouteGraphNodesTable = ({
  nodes,
  boothOptions,
  onChange,
}: AdminRouteGraphNodesTableProps) => {
  const t = useTranslations('Admin.events.routeGraph');

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase text-ink-muted">{t('nodes')}</p>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            onChange([
              ...nodes,
              {
                localId: `new-${Date.now()}`,
                code: '',
                label: '',
                type: 'entrance',
                xPercent: 50,
                yPercent: 50,
                boothId: '',
              },
            ]);
          }}
        >
          {t('addNode')}
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-ink-muted">
              <th className="px-2 py-2">{t('code')}</th>
              <th className="px-2 py-2">{t('label')}</th>
              <th className="px-2 py-2">{t('type')}</th>
              <th className="px-2 py-2 text-center">X</th>
              <th className="px-2 py-2 text-center">Y</th>
              <th className="px-2 py-2 text-center">{t('booth')}</th>
            </tr>
          </thead>
          <tbody>
            {nodes.map((node, index) => (
              <tr key={node.localId} className="border-b border-border">
                <td className="px-2 py-2">
                  <Input
                    value={node.code}
                    onChange={(event) => {
                      const next = [...nodes];
                      next[index] = { ...node, code: event.target.value };
                      onChange(next);
                    }}
                  />
                </td>
                <td className="px-2 py-2">
                  <Input
                    value={node.label}
                    onChange={(event) => {
                      const next = [...nodes];
                      next[index] = { ...node, label: event.target.value };
                      onChange(next);
                    }}
                  />
                </td>
                <td className="px-2 py-2">
                  <Select
                    value={node.type}
                    aria-label={t('type')}
                    onChange={(event) => {
                      const next = [...nodes];
                      next[index] = {
                        ...node,
                        type: event.target.value as EditableRouteNode['type'],
                      };
                      onChange(next);
                    }}
                  >
                    {EXHIBITION_ROUTE_NODE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {t(`nodeTypes.${type}`)}
                      </option>
                    ))}
                  </Select>
                </td>
                <td className="px-2 py-2 text-center">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    className="text-center"
                    value={node.xPercent}
                    onChange={(event) => {
                      const next = [...nodes];
                      next[index] = {
                        ...node,
                        xPercent: Number(event.target.value),
                      };
                      onChange(next);
                    }}
                  />
                </td>
                <td className="px-2 py-2 text-center">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    className="text-center"
                    value={node.yPercent}
                    onChange={(event) => {
                      const next = [...nodes];
                      next[index] = {
                        ...node,
                        yPercent: Number(event.target.value),
                      };
                      onChange(next);
                    }}
                  />
                </td>
                <td className="px-2 py-2 text-center">
                  <Select
                    value={node.boothId}
                    aria-label={t('booth')}
                    className="text-center"
                    onChange={(event) => {
                      const next = [...nodes];
                      next[index] = { ...node, boothId: event.target.value };
                      onChange(next);
                    }}
                  >
                    <option value="">{t('noBooth')}</option>
                    {boothOptions.map((booth) => (
                      <option key={booth.id} value={booth.id}>
                        {booth.code}
                      </option>
                    ))}
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
