'use client';

import type { PublicationStatus } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { PublicationStatusSwitcher } from '@/features/builder/components/publication-status-switcher';
import { Switch } from '@/shared/ui/switch';

type InventoryStatusControlsProps = {
  publicationStatus: PublicationStatus;
  verified: boolean;
  verifiedSwitchId: string;
  busy: boolean;
  onChangeStatus: (status: 'published' | 'draft') => void;
  onChangeVerified: (verified: boolean) => void;
};

/**
 * Draft / Published switcher plus Verified toggle — shared catalog header chrome.
 */
export const InventoryStatusControls = ({
  publicationStatus,
  verified,
  verifiedSwitchId,
  busy,
  onChangeStatus,
  onChangeVerified,
}: InventoryStatusControlsProps) => {
  const tVerified = useTranslations('Builder.verified');

  return (
    <div className="flex flex-wrap items-center gap-3">
      <PublicationStatusSwitcher
        value={publicationStatus}
        disabled={busy}
        onChange={onChangeStatus}
      />
      <label htmlFor={verifiedSwitchId} className="flex items-center gap-2 text-sm text-ink">
        <span>{tVerified('label')}</span>
        <Switch
          id={verifiedSwitchId}
          checked={verified}
          disabled={busy}
          aria-label={tVerified('label')}
          onCheckedChange={onChangeVerified}
        />
      </label>
    </div>
  );
};
