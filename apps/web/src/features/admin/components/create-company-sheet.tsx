'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { CreateCompanyForm } from '@/features/admin/components/create-company-form';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { Button } from '@/shared/ui/button';
import { SIDE_SHEET_PANEL_TRANSITION_MS } from '@/shared/ui/side-sheet.constants';

type CreateCompanySheetProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Compact right-side sheet to provision a company + invite the first admin.
 */
export const CreateCompanySheet = ({ open, onClose }: CreateCompanySheetProps) => {
  const t = useTranslations('Admin.companies');
  const [invitedEmail, setInvitedEmail] = useState<string | null>(null);

  const handleClose = (): void => {
    onClose();
    window.setTimeout(() => setInvitedEmail(null), SIDE_SHEET_PANEL_TRANSITION_MS);
  };

  return (
    <AdminCreateSheet
      open={open}
      onClose={handleClose}
      title={invitedEmail ? t('inviteSuccess.title') : t('new.title')}
    >
      {invitedEmail ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-ink-secondary">
            {t('inviteSuccess.message', { email: invitedEmail })}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={handleClose}>
              {t('inviteSuccess.backToList')}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setInvitedEmail(null)}>
              {t('inviteSuccess.createAnother')}
            </Button>
          </div>
        </div>
      ) : (
        <CreateCompanyForm onSuccess={setInvitedEmail} />
      )}
    </AdminCreateSheet>
  );
};
