'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { UserResponse } from '@toonexpo/contracts';
import { Check, Mail, Pencil, Phone, ShieldCheck, UserRound, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { useUpdateProfileMutation } from '@/features/auth/hooks/use-auth';
import {
  updateProfileFormSchema,
  type UpdateProfileFormValues,
} from '@/features/auth/schemas/update-profile.schema';
import { AccountStatusBadge } from '@/features/buyer/components/account/account-status-badge';
import { useRouter } from '@/i18n/navigation';
import { getAccountInitials } from '@/shared/lib/account-initials';
import { cn } from '@/shared/ui/cn';
import { IconButton } from '@/shared/ui/icon-button';
import { Input } from '@/shared/ui/input';
import { PhoneInput } from '@/shared/ui/phone-input';

type AccountProfileBannerProps = {
  user: UserResponse;
  className?: string | undefined;
};

type BannerDetailProps = {
  icon: typeof UserRound;
  label: string;
  children: ReactNode;
};

type EditActionsProps = {
  busy: boolean;
  onCancel: () => void;
};

const INLINE_INPUT_CLASS =
  'h-9 rounded-sm border-border/80 bg-surface-elevated px-3 text-sm shadow-none';

const BannerDetail = ({ icon: Icon, label, children }: BannerDetailProps) => (
  <div className="flex min-w-0 items-start gap-3">
    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-sm bg-brand-soft text-brand">
      <Icon className="size-3.5" aria-hidden />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </p>
      <div className="mt-0.5">{children}</div>
    </div>
  </div>
);

const EditActions = ({ busy, onCancel }: EditActionsProps) => {
  const tEdit = useTranslations('Profile.editProfile');
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <IconButton
        label={tEdit('cancel')}
        variant="outline"
        size="sm"
        type="button"
        disabled={busy}
        onClick={onCancel}
      >
        <X className="size-4" aria-hidden />
      </IconButton>
      <IconButton
        label={busy ? tEdit('submitting') : tEdit('submit')}
        variant="soft"
        size="sm"
        type="submit"
        disabled={busy}
      >
        <Check className="size-4" aria-hidden />
      </IconButton>
    </div>
  );
};

const normalizePhoneForSubmit = (phone: string): string => {
  const trimmed = phone.trim();
  if (trimmed.length === 0 || trimmed === '+') {
    return '';
  }
  return trimmed;
};

/**
 * Unified account identity banner with inline profile editing.
 */
export const AccountProfileBanner = ({ user, className }: AccountProfileBannerProps) => {
  const t = useTranslations('Profile');
  const tEdit = useTranslations('Profile.editProfile');
  const tAuth = useTranslations('Auth');
  const router = useRouter();
  const updateMutation = useUpdateProfileMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileFormSchema),
    defaultValues: { name: user.name, phone: user.phone ?? '' },
  });

  const watchedName = useWatch({ control, name: 'name' });

  useEffect(() => {
    if (!isEditing) {
      reset({ name: user.name, phone: user.phone ?? '' });
    }
  }, [isEditing, reset, user.name, user.phone]);

  const accountTypeLabel = t(`accountTypes.${user.accountType}`);
  const displayName = isEditing ? watchedName?.trim() || user.name : user.name;
  const busy = isSubmitting || updateMutation.isPending;

  const startEditing = () => {
    reset({ name: user.name, phone: user.phone ?? '' });
    setFormError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    reset({ name: user.name, phone: user.phone ?? '' });
    setFormError(null);
    setIsEditing(false);
  };

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await updateMutation.mutateAsync({
        name: values.name,
        phone: normalizePhoneForSubmit(values.phone),
      });
      setIsEditing(false);
      router.refresh();
    } catch {
      setFormError(tEdit('errors.generic'));
    }
  });

  return (
    <section
      className={cn(
        'overflow-hidden rounded-md border border-border/70 bg-surface-elevated shadow-sm',
        className,
      )}
      aria-labelledby="account-profile-banner-heading"
    >
      <form onSubmit={onSubmit} noValidate>
        <div className="flex items-start gap-4 bg-surface px-5 py-5 sm:px-6">
          <span
            className="flex size-16 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-semibold tracking-wide text-on-brand shadow-xs"
            aria-hidden
          >
            {getAccountInitials(displayName)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    id="account-profile-banner-heading"
                    className="truncate text-xl font-semibold tracking-tight text-ink"
                  >
                    {displayName}
                  </h2>
                  <AccountStatusBadge label={accountTypeLabel} tone="brand" />
                </div>
                <p className="mt-1 truncate text-sm text-ink-secondary">{user.email}</p>
              </div>
              {isEditing ? (
                <EditActions busy={busy} onCancel={cancelEditing} />
              ) : (
                <IconButton
                  label={tEdit('edit')}
                  variant="soft"
                  size="sm"
                  type="button"
                  className="shrink-0"
                  onClick={startEditing}
                >
                  <Pencil className="size-4" aria-hidden />
                </IconButton>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 border-t border-border/70 px-5 py-5 sm:grid-cols-2 sm:px-6">
          <BannerDetail icon={UserRound} label={t('fields.name')}>
            {isEditing ? (
              <>
                <Input
                  id="profile-inline-name"
                  autoComplete="name"
                  aria-invalid={Boolean(errors.name)}
                  className={INLINE_INPUT_CLASS}
                  {...register('name')}
                />
                {errors.name ? (
                  <p role="alert" className="mt-1 text-xs text-danger">
                    {tAuth('validation.name')}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="break-words text-sm font-medium text-ink">{user.name}</p>
            )}
          </BannerDetail>
          <BannerDetail icon={Mail} label={t('fields.email')}>
            <p className="break-words text-sm font-medium text-ink">{user.email}</p>
          </BannerDetail>
          <BannerDetail icon={Phone} label={t('fields.phone')}>
            {isEditing ? (
              <>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <PhoneInput
                      id="profile-inline-phone"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      aria-invalid={Boolean(errors.phone)}
                    />
                  )}
                />
                {errors.phone ? (
                  <p role="alert" className="mt-1 text-xs text-danger">
                    {tAuth('validation.phone')}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="break-words text-sm font-medium text-ink">
                {user.phone ?? t('fields.phoneEmpty')}
              </p>
            )}
          </BannerDetail>
          <BannerDetail icon={ShieldCheck} label={t('fields.accountType')}>
            <p className="break-words text-sm font-medium text-ink">{accountTypeLabel}</p>
          </BannerDetail>
        </div>

        {formError ? (
          <p
            role="alert"
            className="border-t border-border/70 px-5 py-3 text-sm text-danger sm:px-6"
          >
            {formError}
          </p>
        ) : null}
      </form>
    </section>
  );
};
