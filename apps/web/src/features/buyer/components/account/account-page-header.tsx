'use client';

import {
  Heart,
  Inbox,
  LayoutDashboard,
  QrCode,
  ScanLine,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { AccountMobileBackLink } from '@/features/buyer/components/account/account-mobile-back-link';
import { useAccountMobileStackBack } from '@/features/buyer/components/account/account-mobile-stack-context';
import { cn } from '@/shared/ui/cn';
import { Reveal } from '@/shared/ui/motion';
import { PageTitleIcon } from '@/shared/ui/page-title-icon';

/** Serializable icon keys for RSC → client headers (cannot pass Lucide components). */
export type AccountPageTitleIconName =
  | 'dashboard'
  | 'qr'
  | 'favorites'
  | 'requests'
  | 'checkin'
  | 'settings';

const ACCOUNT_PAGE_TITLE_ICONS: Record<AccountPageTitleIconName, LucideIcon> = {
  dashboard: LayoutDashboard,
  qr: QrCode,
  favorites: Heart,
  requests: Inbox,
  checkin: ScanLine,
  settings: Settings,
};

type AccountPageHeaderProps = {
  title: string;
  subtitle?: string | undefined;
  /** Prefer for client-only parents. */
  icon?: LucideIcon | undefined;
  /** Prefer from Server Components — resolved on the client. */
  iconName?: AccountPageTitleIconName | undefined;
  actions?: ReactNode | undefined;
  className?: string | undefined;
  /** Heading level for the page title. */
  headingLevel?: 'h1' | 'h2' | undefined;
};

/**
 * Consistent page title block for account cabinet sections.
 * On mobile sheets, back arrow sits above the title.
 */
export const AccountPageHeader = ({
  title,
  subtitle,
  icon,
  iconName,
  actions,
  className,
  headingLevel = 'h1',
}: AccountPageHeaderProps) => {
  const HeadingTag = headingLevel;
  const onBack = useAccountMobileStackBack();
  const resolvedIcon = icon ?? (iconName ? ACCOUNT_PAGE_TITLE_ICONS[iconName] : undefined);

  return (
    <Reveal force>
      <div
        className={cn('flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between', className)}
      >
        <div className="flex min-w-0 flex-col gap-1">
          {onBack ? <AccountMobileBackLink onBack={onBack} className="-ml-2 mb-3 md:hidden" /> : null}
          <div className="flex min-w-0 items-start gap-3">
            {resolvedIcon ? <PageTitleIcon icon={resolvedIcon} /> : null}
            <div className="flex min-w-0 flex-col gap-1">
              <HeadingTag className="text-page-title min-w-0 text-ink">{title}</HeadingTag>
              {subtitle ? (
                <p className="max-w-2xl text-sm leading-relaxed text-ink-secondary">{subtitle}</p>
              ) : null}
            </div>
          </div>
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </Reveal>
  );
};
