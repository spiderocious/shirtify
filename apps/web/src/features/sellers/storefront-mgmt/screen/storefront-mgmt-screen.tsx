import { ROUTES } from '@shirtify/core';
import { AppText, AppSkeleton, AppButton } from '@shirtify/ui';
import { Show } from '@shirtify/ui/flow';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@features/sellers/auth/providers/auth-provider.tsx';
import { MaterialsManager } from '@features/sellers/brand/screen/parts/materials-manager.tsx';
import { ENV } from '@shared/config/env.ts';

/** Storefront management tab — what's shown publicly: materials + how to feature designs. */
export default function StorefrontMgmtScreen() {
  const { seller } = useAuth();
  const navigate = useNavigate();

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <AppText variant="overline">Dashboard</AppText>
          <AppText variant="display-2" className="mt-1">
            Your storefront
          </AppText>
        </div>
        <Show when={seller !== null}>
          <AppButton
            variant="secondary"
            onClick={() =>
              window.open(
                `${ENV.WEB_BASE_URL}${ROUTES.STOREFRONT(seller?.public_slug ?? '')}`,
                '_blank',
                'noopener',
              )
            }
          >
            View storefront ↗
          </AppButton>
        </Show>
      </div>

      <Show when={seller !== null} fallback={<AppSkeleton className="mt-8 h-64" />}>
        {seller ? (
          <div className="mt-8 flex flex-col gap-8">
            <section className="border-3 border-ink bg-paper-warm p-6 shadow-pop">
              <MaterialsManager seller={seller} />
            </section>

            <section className="border-3 border-dashed border-ink bg-paper-warm p-6">
              <AppText variant="overline">Feature a design</AppText>
              <AppText variant="body-sm" className="mt-2">
                Want a customer's design to appear on your storefront for others to use? Open a
                submitted session and toggle “Show on storefront”.
              </AppText>
              <AppButton
                variant="ghost"
                size="sm"
                className="mt-3"
                onClick={() => navigate(ROUTES.DASHBOARD_SESSIONS)}
              >
                Go to sessions ›
              </AppButton>
            </section>
          </div>
        ) : null}
      </Show>
    </main>
  );
}
