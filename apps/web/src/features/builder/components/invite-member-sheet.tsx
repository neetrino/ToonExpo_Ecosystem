'use client';

import { useTranslations } from 'next-intl';

import { InviteMemberForm } from '@/features/builder/components/invite-member-form';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';

type InviteMemberSheetProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
};

/**
 * Right-side sheet to invite a company team member.
 */
export const InviteMemberSheet = ({ open, onClose, onSuccess }: InviteMemberSheetProps) => {
  const t = useTranslations('Builder.team');

  return (
    <AdminCreateSheet open={open} onClose={onClose} title={t('inviteSheetTitle')}>
      <InviteMemberForm
        onSuccess={(email) => {
          onSuccess(email);
          onClose();
        }}
      />
    </AdminCreateSheet>
  );
};
