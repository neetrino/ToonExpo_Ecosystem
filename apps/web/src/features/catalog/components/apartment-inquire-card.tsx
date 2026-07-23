'use client';

import type { FormEvent } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useMeQuery } from '@/features/auth/hooks/use-auth';
import { ApartmentDetailFavorite } from '@/features/buyer/components/apartment-detail-favorite';
import { useCreateBuyerRequestMutation } from '@/features/buyer/hooks/use-buyer';
import { isNonBuyerStaff } from '@/features/buyer/utils/is-buyer-account';
import { getAccountInitials } from '@/shared/lib/account-initials';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';

type ApartmentInquireCardProps = {
  apartmentId: string;
  projectId: string;
  projectName: string;
  builderName: string;
  builderLogoUrl: string | null;
  className?: string | undefined;
};

const FIELD_CLASS = cn(
  'h-[42px] rounded-[12px] border-header-border bg-canvas px-3 py-2.5 text-sm',
  'placeholder:text-ink-muted',
  'focus-visible:border-brand focus-visible:ring-brand/20',
);

/**
 * Figma apartment inquire card (`89:805`) — agent header, lead form, CTAs.
 */
export const ApartmentInquireCard = ({
  apartmentId,
  projectId,
  projectName,
  builderName,
  builderLogoUrl,
  className,
}: ApartmentInquireCardProps) => {
  const t = useTranslations('Catalog.apartment');
  const tRequest = useTranslations('Catalog.request');
  const pathname = usePathname();
  const { data: user, isLoading } = useMeQuery();
  const mutation = useCreateBuyerRequestMutation();

  const defaultMessage = t('inquireMessageDefault', { project: projectName });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(defaultMessage);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }
    setName((current) => (current.trim() === '' ? user.name : current));
    setEmail((current) => (current.trim() === '' ? user.email : current));
    setPhone((current) => (current.trim() === '' ? (user.phone ?? '') : current));
  }, [user]);

  useEffect(() => {
    setMessage(defaultMessage);
  }, [defaultMessage]);

  if (isLoading) {
    return (
      <aside
        className={cn(
          'h-80 animate-pulse rounded-[20px] border border-header-border bg-surface-elevated',
          className,
        )}
        aria-hidden
      />
    );
  }

  const isStaff = isNonBuyerStaff(user?.accountType);
  const initials = getAccountInitials(builderName);
  const loginHref = `/auth/login?returnUrl=${encodeURIComponent(pathname)}`;

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setFormError(null);

    if (isStaff) {
      setFormError(t('inquireStaffBlocked'));
      return;
    }

    if (!user) {
      window.location.assign(loginHref);
      return;
    }

    if (user.accountType !== 'buyer') {
      setFormError(tRequest('errors.generic'));
      return;
    }

    const note = buildInquiryNote({ name, email, phone, message });
    try {
      await mutation.mutateAsync({
        projectId,
        apartmentId,
        ...(note.length > 0 ? { note } : {}),
      });
      setSuccess(true);
    } catch {
      setFormError(tRequest('errors.generic'));
    }
  };

  return (
    <aside
      className={cn(
        'rounded-[20px] border border-header-border bg-surface-elevated p-6',
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {builderLogoUrl ? (
            <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-brand-deep">
              <Image
                src={builderLogoUrl}
                alt={builderName}
                fill
                className="object-cover"
                sizes="48px"
              />
            </span>
          ) : (
            <span className="grid size-12 place-items-center rounded-full bg-brand-deep font-brand text-lg font-bold text-on-dark">
              {initials}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-ink-navy">{builderName}</p>
            <p className="text-xs text-header-muted">{t('inquireAgentMeta')}</p>
          </div>
        </div>
        <ApartmentDetailFavorite apartmentId={apartmentId} />
      </div>

      {success ? (
        <p className="text-sm text-ink-navy" role="status">
          {tRequest('success.created')}
        </p>
      ) : (
        <form className="space-y-3" onSubmit={(event) => void onSubmit(event)} noValidate>
          <Input
            name="name"
            autoComplete="name"
            placeholder={t('inquireNamePlaceholder')}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={FIELD_CLASS}
            required
          />
          <Input
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t('inquireEmailPlaceholder')}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={FIELD_CLASS}
            required
          />
          <Input
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder={t('inquirePhonePlaceholder')}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={FIELD_CLASS}
          />
          <Textarea
            name="message"
            rows={3}
            placeholder={t('inquireMessagePlaceholder')}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className={cn(FIELD_CLASS, 'min-h-[82px] resize-y py-2.5 leading-5')}
            required
          />

          {formError ? (
            <p role="alert" className="text-sm text-danger">
              {formError}
            </p>
          ) : null}

          {!user ? (
            <p className="text-xs text-header-muted">
              {t('inquireLoginHint')}{' '}
              <Link href={loginHref} className="font-medium text-brand-deep hover:underline">
                {t('inquireLoginLink')}
              </Link>
            </p>
          ) : null}

          <button
            type="submit"
            disabled={mutation.isPending}
            className={cn(
              'flex h-11 w-full items-center justify-center rounded-[12px]',
              'bg-brand-deep text-sm font-semibold text-on-dark',
              'transition-colors hover:bg-brand-deep/90',
              'disabled:pointer-events-none disabled:opacity-50',
            )}
          >
            {mutation.isPending ? t('inquireSubmitting') : t('inquireSubmit')}
          </button>

          <Link
            href="/mortgage"
            className={cn(
              'flex h-11 w-full items-center justify-center rounded-[12px]',
              'border border-header-border text-sm font-semibold text-ink-navy',
              'transition-colors hover:border-brand/40',
            )}
          >
            {t('inquireMortgage')}
          </Link>
        </form>
      )}
    </aside>
  );
};

const buildInquiryNote = (input: {
  name: string;
  email: string;
  phone: string;
  message: string;
}): string => {
  const lines = [
    input.message.trim(),
    input.name.trim() ? `Name: ${input.name.trim()}` : '',
    input.email.trim() ? `Email: ${input.email.trim()}` : '',
    input.phone.trim() ? `Phone: ${input.phone.trim()}` : '',
  ].filter((line) => line.length > 0);
  return lines.join('\n');
};
