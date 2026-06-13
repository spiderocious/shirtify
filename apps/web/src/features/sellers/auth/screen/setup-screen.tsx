import { ROUTES, type SubmitBusinessBody } from '@shirtify/core';
import {
  AppText,
  AppField,
  AppInput,
  AppTextarea,
  AppButton,
  AppColourSwatches,
  DrawerService,
} from '@shirtify/ui';
import { Show } from '@shirtify/ui/flow';
import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { toApiError } from '@shared/api/api-error.ts';

import { useSubmitBusiness } from '../api/use-submit-business.ts';
import { useLogout } from '../api/use-logout.ts';
import { FontControl } from '../../../design/widgets/font-picker-modal.tsx';
import { LogoUpload } from './parts/logo-upload.tsx';

const COLORS = ['#1F6BFF', '#C6F24E', '#FF5252', '#ea580c', '#9333ea', '#0d9488', '#16140F'];

/** Unskippable store-setup page (registration stage 2). */
export default function SetupScreen() {
  const navigate = useNavigate();
  const submit = useSubmitBusiness();
  const logout = useLogout();

  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#1F6BFF');
  const [font, setFont] = useState('archivo-black');
  const [logoKey, setLogoKey] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    const body: SubmitBusinessBody = {
      business_name: businessName,
      ...(description.trim() && { description: description.trim() }),
      storefront_color: color,
      storefront_font: font,
      ...(logoKey && { brand_logo_key: logoKey }),
    };
    try {
      await submit.mutateAsync(body);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      const apiError = await toApiError(err);
      setFieldErrors(apiError.field_errors ?? {});
      if (!apiError.field_errors) DrawerService.toast(apiError.message, { tone: 'warn' });
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <AppText variant="overline">Step 2 of 2 · Set up your store</AppText>
          <AppText variant="display-2" className="mt-1.5">
            Tell us about your shop
          </AppText>
          <AppText variant="body-sm" className="mt-2">
            This is how customers will see your storefront. You can change it later.
          </AppText>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-5 border-3 border-ink bg-paper-warm p-6 shadow-pop">
          <AppField label="Logo">
            <LogoUpload value={logoKey} onChange={setLogoKey} />
          </AppField>

          <AppField label="Business name" error={fieldErrors.business_name?.[0]}>
            <AppInput
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Aba Threads"
              autoFocus
            />
          </AppField>

          <AppField label="Description" hint="A line customers see on your storefront.">
            <AppTextarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Owambe-ready custom shirts, made in Aba."
            />
          </AppField>

          <AppField label="Storefront accent colour">
            <AppColourSwatches colours={COLORS} value={color} onChange={setColor} />
          </AppField>

          <AppField label="Storefront font">
            <FontControl value={font} onChange={setFont} />
          </AppField>

          <Show when={fieldErrors._root !== undefined}>
            <p className="font-mono text-[11px] text-crit">{fieldErrors._root?.[0]}</p>
          </Show>

          <AppButton type="submit" variant="primary" block size="lg" loading={submit.isPending}>
            Finish setup →
          </AppButton>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => logout.mutateAsync().then(() => navigate(ROUTES.LOGIN))}
            className="font-mono text-[11px] text-ink-3 underline"
          >
            Log out
          </button>
        </div>
      </div>
    </main>
  );
}
