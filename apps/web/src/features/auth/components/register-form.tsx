'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { AuthFormSwitch } from '@/features/auth/components/auth-form-switch';
import {
  AUTH_CONTROL_CLASS,
  AUTH_LABEL_CLASS,
  AUTH_PHONE_CLASS,
  AUTH_SUBMIT_CLASS,
} from '@/features/auth/constants/auth-form-styles';
import { useRegisterMutation } from '@/features/auth/hooks/use-auth';
import {
  registerSchema,
  toRegisterRequest,
  type RegisterFormValues,
} from '@/features/auth/schemas/register.schema';
import { mapAuthError } from '@/features/auth/utils/map-auth-error';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { PasswordInput } from '@/shared/ui/password-input';
import { PhoneInput } from '@/shared/ui/phone-input';

/**
 * Buyer self-registration form with NestJS-backed session cookie.
 */
export const RegisterForm = () => {
  const t = useTranslations('Auth');
  const router = useRouter();
  const registerMutation = useRegisterMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      surname: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await registerMutation.mutateAsync(toRegisterRequest(values));
      router.push('/dashboard');
    } catch (error) {
      setFormError(t(`errors.${mapAuthError(error)}`));
    }
  });

  const busy = isSubmitting || registerMutation.isPending;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3.5 sm:gap-4" noValidate>
      <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-3">
        <FormField
          id="register-first-name"
          label={t('fields.firstName')}
          labelClassName={AUTH_LABEL_CLASS}
          error={errors.firstName ? t('validation.firstName') : undefined}
        >
          <Input
            id="register-first-name"
            autoComplete="given-name"
            placeholder={t('register.placeholders.firstName')}
            aria-invalid={Boolean(errors.firstName)}
            className={AUTH_CONTROL_CLASS}
            {...register('firstName')}
          />
        </FormField>

        <FormField
          id="register-surname"
          label={t('fields.surname')}
          labelClassName={AUTH_LABEL_CLASS}
          error={errors.surname ? t('validation.surname') : undefined}
        >
          <Input
            id="register-surname"
            autoComplete="family-name"
            placeholder={t('register.placeholders.surname')}
            aria-invalid={Boolean(errors.surname)}
            className={AUTH_CONTROL_CLASS}
            {...register('surname')}
          />
        </FormField>
      </div>

      <FormField
        id="register-phone"
        label={t('fields.phone')}
        labelClassName={AUTH_LABEL_CLASS}
        error={errors.phone ? t('validation.phone') : undefined}
      >
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <PhoneInput
              id="register-phone"
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              ref={field.ref}
              placeholder={t('register.placeholders.phone')}
              aria-invalid={Boolean(errors.phone)}
              className={AUTH_PHONE_CLASS}
              onChange={field.onChange}
            />
          )}
        />
      </FormField>

      <FormField
        id="register-email"
        label={t('fields.email')}
        labelClassName={AUTH_LABEL_CLASS}
        error={errors.email ? t('validation.email') : undefined}
      >
        <Input
          id="register-email"
          type="email"
          autoComplete="email"
          placeholder={t('register.placeholders.email')}
          aria-invalid={Boolean(errors.email)}
          className={AUTH_CONTROL_CLASS}
          {...register('email')}
        />
      </FormField>

      <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-3">
        <FormField
          id="register-password"
          label={t('fields.password')}
          labelClassName={AUTH_LABEL_CLASS}
          error={errors.password ? t('validation.password') : undefined}
        >
          <PasswordInput
            id="register-password"
            autoComplete="new-password"
            placeholder={t('register.placeholders.password')}
            aria-invalid={Boolean(errors.password)}
            className={AUTH_CONTROL_CLASS}
            revealLabel={t('fields.showPassword')}
            hideLabel={t('fields.hidePassword')}
            {...register('password')}
          />
        </FormField>

        <FormField
          id="register-confirm-password"
          label={t('fields.confirmPassword')}
          labelClassName={AUTH_LABEL_CLASS}
          error={errors.confirmPassword ? t('validation.confirmPassword') : undefined}
        >
          <PasswordInput
            id="register-confirm-password"
            autoComplete="new-password"
            placeholder={t('register.placeholders.confirmPassword')}
            aria-invalid={Boolean(errors.confirmPassword)}
            className={AUTH_CONTROL_CLASS}
            revealLabel={t('fields.showPassword')}
            hideLabel={t('fields.hidePassword')}
            {...register('confirmPassword')}
          />
        </FormField>
      </div>

      {formError ? (
        <p role="alert" className="rounded-md bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
          {formError}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="secondary"
        size="lg"
        disabled={busy}
        className={AUTH_SUBMIT_CLASS}
      >
        {busy ? t('register.submitting') : t('register.submit')}
      </Button>

      <AuthFormSwitch
        prompt={t('register.hasAccount')}
        href="/auth/login"
        linkLabel={t('register.loginLink')}
      />
    </form>
  );
};
