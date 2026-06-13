import { ROUTES, type ShirtType, type StartSessionBody } from '@shirtify/core';
import { AppText, AppButton, AppSkeleton, AppEmptyState } from '@shirtify/ui';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { toApiError } from '@shared/api/api-error.ts';

import { useStartSession } from '../api/use-start-session.ts';
import { useStorefront } from '../api/use-storefront.ts';
import { ShirtPicker } from './parts/shirt-picker.tsx';

export default function StorefrontScreen() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useStorefront(slug);
  const start = useStartSession();

  const [shirtType, setShirtType] = useState<ShirtType>('tee');
  const [shirtColor, setShirtColor] = useState('');
  const [error, setError] = useState<string | null>(null);

  const begin = async () => {
    setError(null);
    const color = shirtColor || data?.shirt_colors[0] || '';
    const body: StartSessionBody = { shirt_type: shirtType, shirt_color: color };
    try {
      const { token } = await start.mutateAsync({ slug, body });
      navigate(ROUTES.CUSTOMER_DESIGN(token));
    } catch (err) {
      const apiError = await toApiError(err);
      setError(apiError.message);
    }
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-lg px-6 py-12">
        <AppSkeleton className="h-10 w-48" />
        <AppSkeleton className="mt-6 h-64" />
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-paper px-6">
        <AppEmptyState
          glyph="⚠"
          title="Shop not found"
          description="This storefront link may be wrong. Double-check it with the seller."
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <div className="text-center">
        <AppText variant="overline">Custom shirts by</AppText>
        <AppText variant="display-1" className="mt-1">
          {data.brand.business_name}
        </AppText>
        <AppText variant="body" className="mx-auto mt-3 max-w-prose">
          {data.brand.welcome_voice ??
            'Design your own custom shirt below, then send it over — we’ll be in touch on WhatsApp.'}
        </AppText>
      </div>

      <div className="mt-8 border-3 border-ink bg-paper-warm p-6 shadow-pop">
        <ShirtPicker
          storefront={data}
          shirtType={shirtType}
          onShirtType={setShirtType}
          shirtColor={shirtColor || (data.shirt_colors[0] ?? '')}
          onShirtColor={setShirtColor}
        />

        {error ? <p className="mt-4 font-mono text-[11px] text-crit">{error}</p> : null}

        <AppButton
          variant="primary"
          block
          size="lg"
          className="mt-6"
          loading={start.isPending}
          onClick={begin}
        >
          Start designing →
        </AppButton>
      </div>

      <AppText variant="mono" as="p" className="mt-6 text-center text-[10px]">
        Designed for {data.brand.business_name} · powered by Shirtify
      </AppText>
    </main>
  );
}
