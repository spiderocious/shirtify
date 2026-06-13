import { type Seller, type UpdateBrandBody } from '@shirtify/core';
import {
  AppField,
  AppInput,
  AppTextarea,
  AppButton,
  AppText,
  AppColourSwatches,
  DrawerService,
} from '@shirtify/ui';
import { type FormEvent, useState } from 'react';

import { toApiError } from '@shared/api/api-error.ts';

import { useUpdateBrand } from '../../../auth/api/use-update-brand.ts';
import { LogoUpload } from '../../../auth/screen/parts/logo-upload.tsx';
import { FontControl } from '../../../../design/widgets/font-picker-modal.tsx';

const STOREFRONT_COLORS = ['#1F6BFF', '#C6F24E', '#FF5252', '#ea580c', '#9333ea', '#0d9488', '#16140F'];

/** Edits the seller's brand/storefront presentation. */
export function BrandForm({ seller }: { seller: Seller }) {
  const update = useUpdateBrand();
  const [businessName, setBusinessName] = useState(seller.business_name);
  const [description, setDescription] = useState(seller.description ?? '');
  const [welcome, setWelcome] = useState(seller.welcome_voice ?? '');
  const [color, setColor] = useState(seller.storefront_color ?? '#1F6BFF');
  const [font, setFont] = useState(seller.storefront_font ?? 'archivo-black');
  const [logoKey, setLogoKey] = useState<string | null>(seller.brand_logo_key);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    const body: UpdateBrandBody = {
      business_name: businessName,
      description: description.trim() || null,
      welcome_voice: welcome.trim() || null,
      storefront_color: color,
      storefront_font: font,
      brand_logo_key: logoKey,
    };
    try {
      await update.mutateAsync(body);
      DrawerService.toast('Storefront updated', { tone: 'go' });
    } catch (err) {
      const apiError = await toApiError(err);
      setFieldErrors(apiError.field_errors ?? {});
      DrawerService.toast(apiError.message, { tone: 'warn' });
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <AppField label="Logo">
        <LogoUpload value={logoKey} onChange={setLogoKey} />
      </AppField>

      <AppField label="Business title" error={fieldErrors.business_name?.[0]}>
        <AppInput value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
      </AppField>

      <AppField
        label="Description"
        hint="Shown under your name on the storefront."
        error={fieldErrors.description?.[0]}
      >
        <AppTextarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Owambe-ready custom shirts, made in Aba."
        />
      </AppField>

      <AppField label="Welcome message" hint="Greets customers on their design page.">
        <AppTextarea
          rows={2}
          value={welcome}
          onChange={(e) => setWelcome(e.target.value)}
          placeholder="Hey! Make your shirt however you like, then send it over."
        />
      </AppField>

      <AppField label="Storefront accent colour">
        <AppColourSwatches colours={STOREFRONT_COLORS} value={color} onChange={setColor} />
      </AppField>

      <AppField label="Storefront font">
        <FontControl value={font} onChange={setFont} />
      </AppField>

      <div>
        <AppButton type="submit" variant="primary" loading={update.isPending}>
          Save storefront
        </AppButton>
        <AppText variant="mono" as="p" className="mt-2 text-[10px]">
          /s/{seller.public_slug}
        </AppText>
      </div>
    </form>
  );
}
