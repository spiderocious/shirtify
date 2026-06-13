import {
  defaultStorefrontTheme,
  type Seller,
  type StorefrontTheme,
  type HeroStyle,
  type StorefrontLayout,
} from '@shirtify/core';
import {
  AppText,
  AppField,
  AppInput,
  AppTextarea,
  AppSelect,
  AppToggle,
  AppColourSwatches,
  AppButton,
  AppSlider,
  DrawerService,
} from '@shirtify/ui';
import { Show } from '@shirtify/ui/flow';
import { useState } from 'react';

import { toApiError } from '@shared/api/api-error.ts';

import { useUpdateBrand } from '../../../auth/api/use-update-brand.ts';

const BG_COLORS = ['#FBF7EC', '#16140F', '#1F6BFF', '#C6F24E', '#FFE7E3', '#E5EEFF', '#1f3d2b', '#5a1f25'];
const TEXT_COLORS = ['#16140F', '#FBF7EC', '#1F6BFF', '#C6F24E'];

const HERO_OPTIONS: ReadonlyArray<{ value: HeroStyle; label: string }> = [
  { value: 'centered', label: 'Centered' },
  { value: 'banner', label: 'Banner' },
  { value: 'minimal', label: 'Minimal' },
];
const LAYOUT_OPTIONS: ReadonlyArray<{ value: StorefrontLayout; label: string }> = [
  { value: 'grid', label: 'Card grid' },
  { value: 'compact', label: 'Compact' },
  { value: 'feature', label: 'Large feature' },
];

/** Seller-facing editor for the expanded storefront theme. */
export function StorefrontThemeEditor({ seller }: { seller: Seller }) {
  const update = useUpdateBrand();
  const [theme, setTheme] = useState<StorefrontTheme>(seller.storefront_theme ?? defaultStorefrontTheme());

  const set = <K extends keyof StorefrontTheme>(key: K, value: StorefrontTheme[K]) =>
    setTheme((t) => ({ ...t, [key]: value }));

  const save = async () => {
    try {
      await update.mutateAsync({ storefront_theme: theme });
      DrawerService.toast('Storefront theme saved', { tone: 'go' });
    } catch (err) {
      DrawerService.toast((await toApiError(err)).message, { tone: 'warn' });
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <AppText variant="overline">Look & feel</AppText>

      {/* Theming */}
      <div className="grid gap-4 sm:grid-cols-2">
        <AppField label="Background colour">
          <AppColourSwatches
            colours={BG_COLORS}
            value={theme.bg_color ?? '#FBF7EC'}
            onChange={(c) => set('bg_color', c)}
          />
        </AppField>
        <AppField label="Text colour">
          <AppColourSwatches
            colours={TEXT_COLORS}
            value={theme.text_color ?? '#16140F'}
            onChange={(c) => set('text_color', c)}
          />
        </AppField>
      </div>

      {/* Header */}
      <div className="border-2.5 border-ink bg-paper p-4">
        <AppText variant="overline">Header</AppText>
        <div className="mt-3 flex flex-col gap-3">
          <AppField label="Headline" hint="Defaults to your business name.">
            <AppInput
              value={theme.headline ?? ''}
              onChange={(e) => set('headline', e.target.value || null)}
              placeholder={seller.business_name}
            />
          </AppField>
          <AppField label="Tagline">
            <AppInput
              value={theme.tagline ?? ''}
              onChange={(e) => set('tagline', e.target.value || null)}
              placeholder="Custom shirts, made for you"
            />
          </AppField>
          <AppField label="Hero style">
            <AppSelect
              options={HERO_OPTIONS}
              value={theme.hero_style}
              onChange={(e) => set('hero_style', e.target.value as HeroStyle)}
            />
          </AppField>
        </div>
      </div>

      {/* Footer */}
      <div className="border-2.5 border-ink bg-paper p-4">
        <AppToggle
          label="Show a footer"
          checked={theme.footer_enabled}
          onChange={(on) => set('footer_enabled', on)}
        />
        <Show when={theme.footer_enabled}>
          <AppField label="Footer text" className="mt-3">
            <AppTextarea
              rows={2}
              value={theme.footer_text ?? ''}
              onChange={(e) => set('footer_text', e.target.value || null)}
              placeholder="Reach us on WhatsApp · @yourhandle"
            />
          </AppField>
        </Show>
      </div>

      {/* Product layout */}
      <div className="border-2.5 border-ink bg-paper p-4">
        <AppText variant="overline">Product list</AppText>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <AppField label="Layout">
            <AppSelect
              options={LAYOUT_OPTIONS}
              value={theme.layout}
              onChange={(e) => set('layout', e.target.value as StorefrontLayout)}
            />
          </AppField>
          <AppField label={`Columns · ${theme.columns}`}>
            <AppSlider
              min={2}
              max={5}
              step={1}
              value={theme.columns}
              onChange={(e) => set('columns', Number(e.target.value))}
            />
          </AppField>
        </div>
        <div className="mt-3">
          <AppToggle
            label="Show product names"
            checked={theme.show_labels}
            onChange={(on) => set('show_labels', on)}
          />
        </div>
      </div>

      <AppButton variant="primary" loading={update.isPending} onClick={save}>
        Save look & feel
      </AppButton>
    </div>
  );
}
