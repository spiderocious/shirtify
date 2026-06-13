import { AppText, AppSkeleton } from '@shirtify/ui';
import { Show } from '@shirtify/ui/flow';

import { useAuth } from '../../auth/providers/auth-provider.tsx';
import { BrandForm } from './parts/brand-form.tsx';

export default function BrandScreen() {
  const { seller } = useAuth();

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <AppText variant="overline">Dashboard</AppText>
      <AppText variant="display-2" className="mt-1">
        Brand & identity
      </AppText>
      <AppText variant="body" className="mt-2">
        Your name, logo, colours and font. (Manage which products show on your storefront under the
        Storefront tab.)
      </AppText>

      <Show when={seller !== null} fallback={<AppSkeleton className="mt-8 h-96" />}>
        {seller ? (
          <div className="mt-8">
            <section className="border-3 border-ink bg-paper-warm p-6 shadow-pop">
              <BrandForm seller={seller} />
            </section>
          </div>
        ) : null}
      </Show>
    </main>
  );
}
