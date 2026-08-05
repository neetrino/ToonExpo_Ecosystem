'use client';

import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { MouseEventHandler, ReactNode } from 'react';

import { Link, useRouter } from '@/i18n/navigation';
import {
  BACK_LINK_BASE_CLASS,
  BACK_LINK_ICON_CLASS,
  BACK_LINK_ICON_SIZE,
  BACK_LINK_TONE_CLASS,
  BACK_LINK_VARIANT_CLASS,
  type BackLinkTone,
  type BackLinkVariant,
} from '@/shared/ui/back-link.constants';
import { cn } from '@/shared/ui/cn';

type BackLinkBaseProps = {
  /** Visible label for standard/compact. Defaults to Common.back. */
  label?: string | undefined;
  /** Accessible name; required for icon-only when label is omitted. Defaults to label. */
  ariaLabel?: string | undefined;
  variant?: BackLinkVariant | undefined;
  tone?: BackLinkTone | undefined;
  className?: string | undefined;
  disabled?: boolean | undefined;
  /** Fallback when navigating via browser history and history is empty/unsafe. */
  fallbackHref?: string | undefined;
};

type BackLinkWithHref = BackLinkBaseProps & {
  href: string;
  onClick?: MouseEventHandler<HTMLAnchorElement> | undefined;
};

type BackLinkWithAction = BackLinkBaseProps & {
  href?: undefined;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

type BackLinkHistory = BackLinkBaseProps & {
  href?: undefined;
  onClick?: undefined;
  fallbackHref: string;
};

export type BackLinkProps = BackLinkWithHref | BackLinkWithAction | BackLinkHistory;

/**
 * Shared Back control for public, portal, and admin surfaces.
 * Prefer an explicit `href` when the parent route is known and safe.
 */
export const BackLink = (props: BackLinkProps) => {
  const t = useTranslations('Common');
  const {
    label,
    ariaLabel,
    variant = 'standard',
    tone = 'default',
    className,
    disabled = false,
  } = props;

  const resolvedLabel = label ?? t('back');
  const accessibleName = ariaLabel ?? resolvedLabel;
  const showLabel = variant !== 'icon';

  const classNames = cn(
    BACK_LINK_BASE_CLASS,
    BACK_LINK_VARIANT_CLASS[variant],
    BACK_LINK_TONE_CLASS[tone],
    className,
  );

  const content = <BackLinkContent variant={variant} showLabel={showLabel} label={resolvedLabel} />;

  if (isHrefBackLink(props)) {
    return (
      <Link
        href={props.href}
        aria-label={accessibleName}
        title={variant === 'icon' ? accessibleName : undefined}
        className={classNames}
        onClick={props.onClick}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
      >
        {content}
      </Link>
    );
  }

  if (isActionBackLink(props)) {
    return (
      <button
        type="button"
        aria-label={accessibleName}
        title={variant === 'icon' ? accessibleName : undefined}
        className={classNames}
        disabled={disabled}
        onClick={props.onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <HistoryBackButton
      ariaLabel={accessibleName}
      title={variant === 'icon' ? accessibleName : undefined}
      className={classNames}
      disabled={disabled}
      fallbackHref={props.fallbackHref}
    >
      {content}
    </HistoryBackButton>
  );
};

const isHrefBackLink = (props: BackLinkProps): props is BackLinkWithHref => {
  return typeof props.href === 'string' && props.href.length > 0;
};

const isActionBackLink = (props: BackLinkProps): props is BackLinkWithAction => {
  return typeof props.onClick === 'function' && !isHrefBackLink(props);
};

type BackLinkContentProps = {
  variant: BackLinkVariant;
  showLabel: boolean;
  label: string;
};

const BackLinkContent = ({ variant, showLabel, label }: BackLinkContentProps) => {
  return (
    <>
      <ArrowLeft
        className={cn(BACK_LINK_ICON_CLASS, BACK_LINK_ICON_SIZE[variant])}
        strokeWidth={variant === 'icon' ? 2.25 : 2}
        aria-hidden
      />
      {showLabel ? <span className="min-w-0 truncate">{label}</span> : null}
    </>
  );
};

type HistoryBackButtonProps = {
  ariaLabel: string;
  title?: string | undefined;
  className: string;
  disabled: boolean;
  fallbackHref: string;
  children: ReactNode;
};

const HistoryBackButton = ({
  ariaLabel,
  title,
  className,
  disabled,
  fallbackHref,
  children,
}: HistoryBackButtonProps) => {
  const router = useRouter();

  const handleClick = (): void => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.replace(fallbackHref);
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      title={title}
      className={className}
      disabled={disabled}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};
