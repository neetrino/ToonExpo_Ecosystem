'use client';

import { useTranslations } from 'next-intl';

import { BulkApartmentsForm } from '@/features/builder/components/bulk-apartments-form';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';

type AddApartmentsSheetProps = {
  open: boolean;
  onClose: () => void;
  projectId: string;
  floorId: string;
};

/**
 * Side sheet to bulk-add apartments to a floor.
 */
export const AddApartmentsSheet = ({
  open,
  onClose,
  projectId,
  floorId,
}: AddApartmentsSheetProps) => {
  const t = useTranslations('Builder.inventory');

  return (
    <AdminCreateSheet open={open} onClose={onClose} title={t('addApartments')} size="comfortable">
      <BulkApartmentsForm projectId={projectId} floorId={floorId} onSuccess={onClose} />
    </AdminCreateSheet>
  );
};
