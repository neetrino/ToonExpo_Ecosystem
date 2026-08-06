'use client';

import type { InteractiveMappingProjectSummary } from '@toonexpo/contracts';
import { Building2, Layers, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  ADMIN_INVENTORY_CARD_CLASS,
  AdminInventoryCardMetaRow,
  AdminInventoryCardStat,
  AdminInventoryPublicationBadge,
} from '@/features/admin/components/admin-inventory-card';
import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type InteractiveMappingProjectCardProps = {
  project: InteractiveMappingProjectSummary;
  href: string;
};

/**
 * Project card for interactive-mapping lists — same chrome as admin user cards.
 */
export const InteractiveMappingProjectCard = ({
  project,
  href,
}: InteractiveMappingProjectCardProps) => {
  const t = useTranslations('Admin.interactiveMapping');

  return (
    <Link href={href} className={cn(ADMIN_INVENTORY_CARD_CLASS)}>
      <div className="flex flex-1 gap-2 p-4">
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="text-base font-semibold tracking-tight text-ink">{project.name}</h2>
          <div className="mt-2 flex flex-col gap-1 text-sm text-ink-secondary">
            <AdminInventoryCardMetaRow icon={<Layers className="size-3.5" aria-hidden />}>
              {project.activePhase
                ? t('continuePhase', { phase: project.activePhase })
                : t('allPhasesDone')}
            </AdminInventoryCardMetaRow>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <AdminInventoryPublicationBadge status={project.publicationStatus} />
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border px-4 py-3">
        <AdminInventoryCardStat
          icon={<MapPin className="size-4" strokeWidth={2} />}
          label={t('phases.districts')}
          value={project.districtCount}
        />
        <AdminInventoryCardStat
          icon={<Building2 className="size-4" strokeWidth={2} />}
          label={t('phases.buildings')}
          value={project.buildingCount}
        />
      </div>
    </Link>
  );
};
