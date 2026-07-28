'use client';

import { useTranslations } from 'next-intl';

import { AddBuildingForm } from '@/features/builder/components/add-building-form';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';

type AddBuildingSheetProps = {
  open: boolean;
  onClose: () => void;
  projectId: string;
};

/**
 * Side sheet to add a building to a project.
 */
export const AddBuildingSheet = ({ open, onClose, projectId }: AddBuildingSheetProps) => {
  const t = useTranslations('Builder.inventory');

  return (
    <AdminCreateSheet open={open} onClose={onClose} title={t('addBuilding')} size="comfortable">
      <AddBuildingForm projectId={projectId} onSuccess={onClose} />
    </AdminCreateSheet>
  );
};
