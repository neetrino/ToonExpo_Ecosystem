'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/shared/ui/cn';

/** Matches admin Analytics page title icon chrome. */
const PAGE_TITLE_ICON_BOX_CLASS =
  'mt-0.5 inline-flex size-14 shrink-0 items-center justify-center rounded-md bg-[#d3f6f6] text-[#2bb5ad]';

type PageTitleIconProps = {
  icon: LucideIcon;
  className?: string | undefined;
};

/**
 * Soft teal icon tile used beside portal page titles (Analytics pattern).
 */
export const PageTitleIcon = ({ icon: Icon, className }: PageTitleIconProps) => {
  return (
    <span className={cn(PAGE_TITLE_ICON_BOX_CLASS, className)}>
      <Icon className="size-7" strokeWidth={2} aria-hidden />
    </span>
  );
};

type PageTitleBlockProps = {
  title: string;
  subtitle?: string | undefined;
  icon?: LucideIcon | undefined;
  className?: string | undefined;
  children?: ReactNode | undefined;
};

/**
 * Page title row with optional Analytics-style leading icon.
 */
export const PageTitleBlock = ({
  title,
  subtitle,
  icon,
  className,
  children,
}: PageTitleBlockProps) => {
  return (
    <div className={cn('flex min-w-0 items-start gap-3', className)}>
      {icon ? <PageTitleIcon icon={icon} /> : null}
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-page-title text-ink">{title}</h1>
        {subtitle ? <p className="text-sm text-ink-secondary">{subtitle}</p> : null}
        {children}
      </div>
    </div>
  );
};
