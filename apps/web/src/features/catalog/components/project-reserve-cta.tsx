'use client';

import type { FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useMeQuery } from '@/features/auth/hooks/use-auth';
import { useCreateBuyerRequestMutation } from '@/features/buyer/hooks/use-buyer';
import { isNonBuyerStaff } from '@/features/buyer/utils/is-buyer-account';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';
import { Input } from '@/shared/ui/input';

type ProjectReserveCtaProps = {
  projectId: string;
  projectName: string;
};

const FIELD_CLASS = cn(
  'h-10 w-full rounded-xl border-0 bg-canvas/20 px-3 text-sm text-on-dark',
  'placeholder:text-on-dark/50',
  'focus-visible:ring-2 focus-visible:ring-canvas/40',
);

/**
 * Dark reserve band with callback form — Figma `89:876`.
 */
export const ProjectReserveCta = ({ projectId, projectName }: ProjectReserveCtaProps) => {
  const t = useTranslations('Catalog.projectDetail');
  const tRequest = useTranslations('Catalog.request');
  const pathname = usePathname();
  const { data: user, isLoading } = useMeQuery();
  const mutation = useCreateBuyerRequestMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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

  const isStaff = isNonBuyerStaff(user?.accountType);
  const loginHref = `/auth/login?returnUrl=${encodeURIComponent(pathname)}`;

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setFormError(null);

    if (isStaff) {
      setFormError(t('reserveStaffBlocked'));
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

    const note = [name, email, phone]
      .map((part) => part.trim())
      .filter((part) => part.length > 0)
      .join(' · ');

    try {
      await mutation.mutateAsync({
        projectId,
        ...(note.length > 0 ? { note: `${t('reserveNotePrefix')}: ${note}` } : {}),
      });
      setSuccess(true);
    } catch {
      setFormError(tRequest('errors.generic'));
    }
  };

  const scrollToForm = (): void => {
    document.getElementById('project-reserve-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="page-container py-16">
      <div className="grid grid-cols-1 gap-8 overflow-hidden rounded-[24px] bg-brand-deep p-6 text-on-dark sm:p-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div>
          <h2 className="font-brand text-[clamp(1.75rem,3vw,2.25rem)] font-bold tracking-[-0.02em] leading-tight">
            {t('reserveTitle', { project: projectName })}
          </h2>
          <p className="mt-3 max-w-md text-base leading-6 text-on-dark/70">
            {t('reserveSubtitle')}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={scrollToForm}
              className="rounded-2xl bg-canvas px-5 py-3 text-sm font-semibold text-ink-navy transition-opacity hover:opacity-90"
            >
              {t('downloadBrochure')}
            </button>
            <button
              type="button"
              onClick={scrollToForm}
              className="rounded-2xl border border-on-dark/20 px-5 py-3 text-sm font-semibold text-on-dark transition-colors hover:bg-on-dark/10"
            >
              {t('scheduleVisit')}
            </button>
          </div>
        </div>

        <div id="project-reserve-form" className="rounded-[20px] bg-canvas/10 p-5">
          {isLoading ? (
            <div className="h-48 animate-pulse rounded-xl bg-canvas/10" aria-hidden />
          ) : success ? (
            <p className="text-sm text-on-dark" role="status">
              {tRequest('success.created')}
            </p>
          ) : (
            <form className="space-y-3" onSubmit={(event) => void onSubmit(event)} noValidate>
              <Input
                name="name"
                autoComplete="name"
                placeholder={t('reserveName')}
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={FIELD_CLASS}
                required
              />
              <Input
                name="email"
                type="email"
                autoComplete="email"
                placeholder={t('reserveEmail')}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={FIELD_CLASS}
                required
              />
              <Input
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder={t('reservePhone')}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className={FIELD_CLASS}
              />
              {formError ? (
                <p className="text-sm text-[#fecaca]" role="alert">
                  {formError}
                </p>
              ) : null}
              {!user ? (
                <p className="text-xs text-on-dark/70">
                  {t('reserveLoginHint')}{' '}
                  <Link href={loginHref} className="font-semibold underline">
                    {t('reserveLoginLink')}
                  </Link>
                </p>
              ) : null}
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex h-11 w-full items-center justify-center rounded-xl bg-canvas text-sm font-semibold text-ink-navy transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {mutation.isPending ? t('reserveSubmitting') : t('reserveSubmit')}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
