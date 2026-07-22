import type { AccountType } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { getAccountInitials } from '@/features/buyer/utils/account-initials';
import { cn } from '@/shared/ui/cn';

type AccountUserSummaryProps = {
  name: string;
  email: string;
  accountType: AccountType;
  className?: string | undefined;
};

/**
 * Compact identity block for the account sidebar rail.
 */
export const AccountUserSummary = ({
  name,
  email,
  accountType,
  className,
}: AccountUserSummaryProps) => {
  const t = useTranslations('Profile');
  const initials = getAccountInitials(name);

  return (
    <div className={cn('flex items-center gap-3 px-1', className)}>
      <span
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-sm font-semibold text-brand-secondary shadow-xs"
        aria-hidden
      >
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-on-dark">{name}</p>
        <p className="truncate text-xs text-on-dark/65">{email}</p>
        <p className="mt-1 inline-flex rounded-pill bg-on-dark/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-on-dark/80">
          {t(`accountTypes.${accountType}`)}
        </p>
      </div>
    </div>
  );
};
