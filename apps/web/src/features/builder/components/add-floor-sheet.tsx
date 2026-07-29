'use client';

import { useTranslations } from 'next-intl';

import { AddFloorForm } from '@/features/builder/components/add-floor-form';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';

type AddFloorSheetProps = {
  open: boolean;
  onClose: () => void;
  projectId: string;
  buildingId: string;
};

/**
 * Side sheet to add a floor to a building.
 */
export const AddFloorSheet = ({ open, onClose, projectId, buildingId }: AddFloorSheetProps) => {
  const t = useTranslations('Builder.inventory');

  return (
    <AdminCreateSheet open={open} onClose={onClose} title={t('addFloor')} size="comfortable">
      <AddFloorForm projectId={projectId} buildingId={buildingId} onSuccess={onClose} />
    </AdminCreateSheet>
  );
};
