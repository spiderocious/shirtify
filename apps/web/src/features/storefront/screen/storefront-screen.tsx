import { ROUTES, fontFamilyById, type StorefrontItem, type StartSessionBody } from '@shirtify/core';
import { AppText, AppSkeleton, AppEmptyState, DrawerService } from '@shirtify/ui';
import { Show, Repeat } from '@shirtify/ui/flow';
import { useNavigate, useParams } from 'react-router-dom';

import { resolveAssetUrl } from '@shared/api/resolve-asset-url.ts';
import { toApiError } from '@shared/api/api-error.ts';

import { useStartSession } from '../api/use-start-session.ts';
import { useStorefront } from '../api/use-storefront.ts';
import { StorefrontItemCard } from './parts/storefront-item-card.tsx';
import { openStartWithName } from './parts/start-with-name.tsx';
import { StorefrontLogo } from './parts/storefront-logo.tsx';

export default function StorefrontScreen() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useStorefront(slug);
  const start = useStartSession();

  const begin = (item: StorefrontItem) => {
    openStartWithName(item, async (name) => {
      const body: StartSessionBody =
        item.kind === 'design'
          ? {
              shirt_type: item.shirt_type,
              shirt_color: item.shirt_color,
              customer_name: name,
              from_token: item.token,
              ...(item.material_slug && { material_slug: item.material_slug }),
            }
          : {
              shirt_type: (item.builtin_shape as StartSessionBody['shirt_type']) ?? 'tee',
              shirt_color: data?.shirt_colors[0] ?? 'white',
              customer_name: name,
              ...(item.image_key ? { material_slug: item.slug } : {}),
            };
      try {
        const { token } = await start.mutateAsync({ slug, body });
        DrawerService.closeModal();
        navigate(ROUTES.CUSTOMER_DESIGN(token));
      } catch (err) {
        DrawerService.toast((await toApiError(err)).message, { tone: 'warn' });
      }
    });
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12">
        <AppSkeleton className="h-16 w-64" />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <AppSkeleton key={i} className="aspect-square" />
          ))}
        </div>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-paper px-6">
        <AppEmptyState glyph="⚠" title="Shop not found" description="Double-check the link with the seller." />
      </main>
    );
  }

  const accent = data.brand.storefront_color ?? undefined;
  const headingFont = data.brand.storefront_font
    ? fontFamilyById(data.brand.storefront_font)
    : undefined;

  return (
    <main className="min-h-dvh bg-paper">
      {/* Immersive brand header */}
      <header
        className="border-b-3 border-ink px-6 py-12 text-center"
        style={accent ? { backgroundColor: accent } : undefined}
      >
        <StorefrontLogo logoKey={data.brand.brand_logo_key} resolveAssetUrl={resolveAssetUrl} />
        <h1
          className="mt-4 font-display text-4xl tracking-tight text-ink sm:text-5xl"
          style={headingFont ? { fontFamily: headingFont } : undefined}
        >
          {data.brand.business_name}
        </h1>
        <Show when={Boolean(data.brand.description)}>
          <AppText variant="body" className="mx-auto mt-3 max-w-prose !text-ink">
            {data.brand.description}
          </AppText>
        </Show>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <AppText variant="overline">Tap any design to make it your own</AppText>
        <Show
          when={data.items.length > 0}
          fallback={
            <AppEmptyState
              className="mt-6"
              glyph="👕"
              title="Coming soon"
              description="This shop hasn't added any designs yet."
            />
          }
        >
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <Repeat each={[...data.items]}>
              {(item) => (
                <StorefrontItemCard
                  key={item.kind === 'design' ? item.token : item.slug}
                  item={item}
                  onPick={() => begin(item)}
                />
              )}
            </Repeat>
          </div>
        </Show>
      </section>

      <footer className="border-t-3 border-ink px-6 py-6 text-center">
        <AppText variant="mono" as="p" className="text-[10px]">
          {data.brand.business_name} · powered by Shirtify
        </AppText>
      </footer>
    </main>
  );
}
