import type { LucideIcon } from 'lucide-react';

type AccountSectionHeadingProps = {
  icon: LucideIcon;
  title: string;
  subtitle?: string | undefined;
  headingId?: string | undefined;
};

/**
 * Icon + title block for account settings sections.
 */
export const AccountSectionHeading = ({
  icon: Icon,
  title,
  subtitle,
  headingId,
}: AccountSectionHeadingProps) => {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-brand-soft text-brand">
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <h2 id={headingId} className="text-lg font-semibold tracking-tight text-ink">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-0.5 text-sm leading-relaxed text-ink-secondary">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
};
