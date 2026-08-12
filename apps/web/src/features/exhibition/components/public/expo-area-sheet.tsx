'use client';

import type { PublicVenueMapArea } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { resolveVenueMapAreaTitle } from '@/features/exhibition/utils/resolve-venue-map-area-title';
import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';

type ExpoAreaSheetProps = {
  area: PublicVenueMapArea;
  onClose: () => void;
};

/**
 * Selected-area details for the public venue map.
 */
export const ExpoAreaSheet = ({ area, onClose }: ExpoAreaSheetProps) => {
  const t = useTranslations('Expo.area');
  const title = resolveVenueMapAreaTitle(area);
  const showOccupant = area.displayMode !== 'hidden';

  return (
    <Card className="flex flex-col gap-3 border-t-4 border-brand px-4 py-4 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            {t(`modes.${area.displayMode}`)}
          </p>
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <p className="text-sm text-ink-secondary">{t('code', { code: area.code })}</p>
          <p className="text-sm text-ink-secondary">{t('areaSqm', { value: area.areaSqm })}</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          {t('close')}
        </Button>
      </div>
      {showOccupant && area.company?.href ? (
        <Link href={area.company.href}>
          <Button type="button" size="sm" variant="secondary">
            {t('openProfile')}
          </Button>
        </Link>
      ) : null}
    </Card>
  );
};
