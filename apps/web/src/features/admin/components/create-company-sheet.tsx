'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { CreateCompanyForm } from '@/features/admin/components/create-company-form';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { Button } from '@/shared/ui/button';
import { SIDE_SHEET_PANEL_TRANSITION_MS } from '@/shared/ui/side-sheet.constants';

type CreateCompanySheetProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Compact right-side sheet to provision a builder company without an invite email.
 */
export const CreateCompanySheet = ({ open, onClose }: CreateCompanySheetProps) => {
  const t = useTranslations('Admin.companies');
  const [created, setCreated] = useState(false);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleClose = (): void => {
    onClose();
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = window.setTimeout(() => {
      resetTimerRef.current = null;
      setCreated(false);
    }, SIDE_SHEET_PANEL_TRANSITION_MS);
  };

  return (
    <AdminCreateSheet
      open={open}
      onClose={handleClose}
      size="comfortable"
      title={created ? t('createSuccess.title') : t('new.title')}
    >
      {created ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-ink-secondary">{t('createSuccess.message')}</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={handleClose}>
              {t('createSuccess.backToList')}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setCreated(false)}>
              {t('createSuccess.createAnother')}
            </Button>
          </div>
        </div>
      ) : (
        <CreateCompanyForm onSuccess={() => setCreated(true)} />
      )}
    </AdminCreateSheet>
  );
};
