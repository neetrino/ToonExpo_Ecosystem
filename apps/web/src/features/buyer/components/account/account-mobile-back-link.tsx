'use client';

import { useTranslations } from 'next-intl';

import { BackLink } from '@/shared/ui/back-link';
import { cn } from '@/shared/ui/cn';

type AccountMobileBackLinkProps = {
  onBack: () => void;
  className?: string | undefined;
};

/**
 * Mobile-only back control for portal sheet stacks.
 */
export const AccountMobileBackLink = ({ onBack, className }: AccountMobileBackLinkProps) => {
  const t = useTranslations('Profile.nav');

  return (
    <BackLink
      variant="icon"
      tone="subtle"
      label={t('back')}
      onClick={onBack}
      className={cn(className)}
    />
  );
};
