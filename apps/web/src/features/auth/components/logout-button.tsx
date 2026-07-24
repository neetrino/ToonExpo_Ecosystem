'use client';

import { useTranslations } from 'next-intl';

import { useLogoutMutation } from '@/features/auth/hooks/use-auth';
import { Button } from '@/shared/ui/button';

type LogoutButtonProps = {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'md' | 'sm';
  className?: string | undefined;
};

/**
 * Clears the NestJS session cookie and returns to the public home.
 */
export const LogoutButton = ({ variant = 'ghost', size = 'sm', className }: LogoutButtonProps) => {
  const t = useTranslations('Auth');
  const logoutMutation = useLogoutMutation();

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      disabled={logoutMutation.isPending}
      onClick={() => {
        void logoutMutation.mutateAsync();
      }}
    >
      {logoutMutation.isPending ? t('logout.submitting') : t('logout.submit')}
    </Button>
  );
};
