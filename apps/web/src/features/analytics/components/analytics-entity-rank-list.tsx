import Image from 'next/image';
import { Building2 } from 'lucide-react';

import { cn } from '@/shared/ui/cn';

const THUMB_PX = 36;

type AnalyticsEntityRankListProps = {
  items: {
    entityId: string;
    name: string | null;
    viewCount: number;
    coverUrl?: string | null;
  }[];
  rankLabel: string;
  nameLabel: string;
  viewsLabel: string;
  emptyLabel: string;
  showCovers?: boolean;
};

/**
 * Compact ranked table for top entities by view count.
 */
export const AnalyticsEntityRankList = ({
  items,
  rankLabel,
  nameLabel,
  viewsLabel,
  emptyLabel,
  showCovers = false,
}: AnalyticsEntityRankListProps) => {
  if (items.length === 0) {
    return <p className="text-sm text-ink-secondary">{emptyLabel}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-[11px] tracking-wide text-ink-muted uppercase">
            <th className="w-10 px-2 py-2.5 font-medium">{rankLabel}</th>
            <th className="px-2 py-2.5 font-medium">{nameLabel}</th>
            <th className="px-2 py-2.5 text-right font-medium">{viewsLabel}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const name = item.name?.trim() || '—';
            return (
              <tr
                key={item.entityId}
                className="border-b border-border/70 last:border-0"
              >
                <td className="px-2 py-3 text-ink-muted tabular-nums">{index + 1}</td>
                <td className="px-2 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {showCovers ? (
                      <span
                        className={cn(
                          'relative inline-flex size-9 shrink-0 items-center justify-center',
                          'overflow-hidden rounded-md bg-surface text-ink-muted',
                        )}
                      >
                        {item.coverUrl ? (
                          <Image
                            src={item.coverUrl}
                            alt=""
                            width={THUMB_PX}
                            height={THUMB_PX}
                            className="size-full object-cover"
                          />
                        ) : (
                          <Building2 className="size-4" aria-hidden />
                        )}
                      </span>
                    ) : null}
                    <span className="truncate font-medium text-ink">{name}</span>
                  </div>
                </td>
                <td className="px-2 py-3 text-right tabular-nums text-ink-secondary">
                  {item.viewCount}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
