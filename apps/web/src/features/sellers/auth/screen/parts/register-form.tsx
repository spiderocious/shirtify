import { ROUTES } from '@shirtify/core';
import { AppButton, AppField, AppInput } from '@shirtify/ui';
import { Show } from '@shirtify/ui/flow';
import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { toApiError } from '@shared/api/api-error.ts';

import { useRegister } from '../../api/use-register.ts';

export function RegisterForm() {
  const navigate = useNavigate();
  const register = useRegister();
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setFormError(null);
    try {
      await register.mutateAsync({
        business_name: businessName,
        email,
        password,
      });
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      const apiError = await toApiError(err);
      setFieldErrors(apiError.field_errors ?? {});
      if (!apiError.field_errors) setFormError(apiError.message);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <AppField
        label="Business name"
        error={fieldErrors.business_name?.[0]}
        htmlFor="business_name"
      >
        <AppInput
          id="business_name"
          value={businessName}
          invalid={Boolean(fieldErrors.business_name)}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Aba Tees"
        />
      </AppField>

      <AppField label="Email" error={fieldErrors.email?.[0]} htmlFor="email">
        <AppInput
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          invalid={Boolean(fieldErrors.email)}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourshop.com"
        />
      </AppField>

      <AppField
        label="Password"
        hint="At least 8 characters."
        error={fieldErrors.password?.[0]}
        htmlFor="password"
      >
        <AppInput
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          invalid={Boolean(fieldErrors.password)}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </AppField>

      <Show when={formError !== null}>
        <p className="font-mono text-[11px] text-crit">{formError}</p>
      </Show>

      <AppButton type="submit" variant="primary" block loading={register.isPending}>
        Create account
      </AppButton>
    </form>
  );
}
