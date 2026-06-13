import {
  ROUTES,
  SHIRT_TYPES,
  SHIRT_TYPE_LABELS,
  idempotencyKey,
  type CreateSessionBody,
  type ShirtType,
} from '@shirtify/core';
import {
  AppButton,
  AppField,
  AppInput,
  AppTextarea,
  AppSelect,
  AppColourSwatches,
  AppText,
  AppSkeleton,
} from '@shirtify/ui';
import { Show } from '@shirtify/ui/flow';
import { type FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { toApiError } from '@shared/api/api-error.ts';

import { useColors } from '../../api/use-colors.ts';
import { useCreateSession } from '../../api/use-create-session.ts';
import { useMaterials } from '../../../materials/api/use-materials.ts';

const shirtTypeOptions = SHIRT_TYPES.map((t) => ({ value: t, label: SHIRT_TYPE_LABELS[t] }));

export function NewSessionForm() {
  const navigate = useNavigate();
  const create = useCreateSession();
  const { data: colors, isLoading: colorsLoading } = useColors();
  const { data: materials } = useMaterials();

  // One idempotency key per form instance — stable across retries of this intent.
  const idemKey = useMemo(() => idempotencyKey(), []);

  const [customerName, setCustomerName] = useState('');
  const [shirtType, setShirtType] = useState<ShirtType>('tee');
  const [materialSlug, setMaterialSlug] = useState('');
  const [shirtColor, setShirtColor] = useState<string>('');
  const [priceNaira, setPriceNaira] = useState('');
  const [notes, setNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Map colour slug → hex for the swatch grid; track selection by slug.
  const swatchHexes = useMemo(() => (colors ?? []).map((c) => c.hex), [colors]);
  const selectedHex = useMemo(
    () => colors?.find((c) => c.slug === shirtColor)?.hex ?? '',
    [colors, shirtColor],
  );
  const hexToSlug = useMemo(
    () => new Map((colors ?? []).map((c) => [c.hex.toLowerCase(), c.slug])),
    [colors],
  );

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setFormError(null);
    if (!shirtColor) {
      setFieldErrors({ shirt_color: ['Pick a shirt colour'] });
      return;
    }

    const body: CreateSessionBody = {
      shirt_type: shirtType,
      shirt_color: shirtColor,
      ...(materialSlug && { material_slug: materialSlug }),
      ...(customerName.trim() && { customer_name: customerName.trim() }),
      ...(notes.trim() && { notes: notes.trim() }),
      ...(priceNaira.trim() && { price_quoted: Math.round(Number(priceNaira) * 100) }),
    };

    try {
      const session = await create.mutateAsync({ body, idempotencyKey: idemKey });
      navigate(ROUTES.SESSION_DETAIL(session.id), { replace: true });
    } catch (err) {
      const apiError = await toApiError(err);
      setFieldErrors(apiError.field_errors ?? {});
      if (!apiError.field_errors) setFormError(apiError.message);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <AppField
        label="Customer name"
        hint="Shown on the customer's design page — e.g. “Tobi”."
        error={fieldErrors.customer_name?.[0]}
        htmlFor="customer_name"
      >
        <AppInput
          id="customer_name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Tobi"
        />
      </AppField>

      <div className="grid gap-4 sm:grid-cols-2">
        <AppField label="Shirt type" error={fieldErrors.shirt_type?.[0]} htmlFor="shirt_type">
          <AppSelect
            id="shirt_type"
            options={shirtTypeOptions}
            value={shirtType}
            onChange={(e) => setShirtType(e.target.value as ShirtType)}
          />
        </AppField>

        <AppField
          label="Material"
          hint="Your own photo, or built-in by type."
          htmlFor="material"
        >
          <AppSelect
            id="material"
            options={[
              { value: '', label: 'Built-in (by type)' },
              ...(materials ?? []).map((m) => ({ value: m.slug, label: m.label })),
            ]}
            value={materialSlug}
            onChange={(e) => setMaterialSlug(e.target.value)}
          />
        </AppField>

        <AppField
          label="Price quoted (₦)"
          hint="Optional."
          error={fieldErrors.price_quoted?.[0]}
          htmlFor="price"
        >
          <AppInput
            id="price"
            mono
            inputMode="decimal"
            value={priceNaira}
            onChange={(e) => setPriceNaira(e.target.value)}
            placeholder="15000"
          />
        </AppField>
      </div>

      <AppField label="Shirt colour" error={fieldErrors.shirt_color?.[0]}>
        <Show when={!colorsLoading} fallback={<AppSkeleton className="h-10 w-48" />}>
          <AppColourSwatches
            colours={swatchHexes}
            value={selectedHex}
            onChange={(hex) => setShirtColor(hexToSlug.get(hex.toLowerCase()) ?? '')}
          />
        </Show>
      </AppField>

      <AppField label="Notes" hint="Private — only you see these." htmlFor="notes">
        <AppTextarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="She wants something elegant, will probably ask for changes."
        />
      </AppField>

      <Show when={formError !== null}>
        <p className="font-mono text-[11px] text-crit">{formError}</p>
      </Show>

      <div className="flex gap-3">
        <AppButton type="submit" variant="primary" loading={create.isPending}>
          Create session & get link
        </AppButton>
        <AppButton type="button" variant="ghost" onClick={() => navigate(ROUTES.DASHBOARD)}>
          Cancel
        </AppButton>
      </div>

      <AppText variant="mono" as="p" className="text-[10px]">
        A unique link is generated. Copy it and send it to your customer on WhatsApp.
      </AppText>
    </form>
  );
}
