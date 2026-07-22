import type { LucideIcon } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { Card } from '@/shared/ui/card';
import { cn } from '@/shared/ui/cn';

type AccountStatCardProps = {
  href: string;
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string | undefined;
  className?: string | undefined;
};

/**
 * Quick-link statistic tile for the account overview.
 */
export const AccountStatCard = ({
  href,
  icon: Icon,
  label,
  value,
  hint,
  className,
}: AccountStatCardProps) => {
  return (
    <Link
      href={href}
      className={cn(
        'group block rounded-md focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-brand/40 focus-visible:ring-offset-2',
        className,
      )}
    >
      <Card
        variant="elevated"
        padding="sm"
        className="h-full transition-[box-shadow,transform] duration-[var(--duration-fast)] group-hover:shadow-sm group-hover:-translate-y-0.5"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-brand-soft text-brand">
            <Icon className="size-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</p>
            <p className="mt-1 truncate text-lg font-semibold text-ink">{value}</p>
            {hint ? <p className="mt-0.5 truncate text-xs text-ink-secondary">{hint}</p> : null}
          </div>
        </div>
      </Card>
    </Link>
  );
};
