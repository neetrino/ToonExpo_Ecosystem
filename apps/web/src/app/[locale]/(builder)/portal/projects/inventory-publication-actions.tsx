'use client';

import type { PublicationStatus } from '@toonexpo/domain';

import { publicationActionsFor } from '@/lib/shared/publication';

import { InventoryPublicationActionButton } from './inventory-publication-action-button';

type InventoryPublicationActionsProps = {
  locale: string;
  entityKind: 'building' | 'floor';
  entityId: string;
  status: PublicationStatus;
  labels: {
    publish: string;
    archive: string;
    draft: string;
    confirm: {
      publish: string;
      archive: string;
      draft: string;
    };
  };
};

export function InventoryPublicationActions({
  locale,
  entityKind,
  entityId,
  status,
  labels,
}: InventoryPublicationActionsProps) {
  const actions = publicationActionsFor(status);

  return (
    <div className="portal-actions">
      {actions.map((action) => (
        <InventoryPublicationActionButton
          key={action.actionKey}
          locale={locale}
          entityKind={entityKind}
          entityId={entityId}
          targetStatus={action.targetStatus}
          actionKey={action.actionKey}
          confirmMessage={labels.confirm[action.actionKey]}
          label={labels[action.actionKey]}
        />
      ))}
    </div>
  );
}
