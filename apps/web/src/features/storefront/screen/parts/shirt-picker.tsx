import {
  SHIRT_TYPE_LABELS,
  SHIRT_COLORS,
  type ShirtType,
  type StorefrontResponse,
} from '@shirtify/core';
import { AppField, AppSelect, AppColourSwatches, AppText } from '@shirtify/ui';

const SLUG_HEX = new Map(SHIRT_COLORS.map((c) => [c.id, c.hex]));

export function ShirtPicker({
  storefront,
  shirtType,
  onShirtType,
  shirtColor,
  onShirtColor,
}: {
  storefront: StorefrontResponse;
  shirtType: ShirtType;
  onShirtType: (t: ShirtType) => void;
  shirtColor: string;
  onShirtColor: (slug: string) => void;
}) {
  const typeOptions = storefront.shirt_types.map((t) => ({
    value: t,
    label: SHIRT_TYPE_LABELS[t],
  }));
  const hexes = storefront.shirt_colors.map((slug) => SLUG_HEX.get(slug) ?? '#cccccc');
  const currentHex = SLUG_HEX.get(shirtColor) ?? '#cccccc';
  const hexToSlug = new Map(
    storefront.shirt_colors.map((slug) => [SLUG_HEX.get(slug) ?? '#cccccc', slug]),
  );

  return (
    <div className="flex flex-col gap-5">
      <AppField label="Shirt type" htmlFor="sf-type">
        <AppSelect
          id="sf-type"
          options={typeOptions}
          value={shirtType}
          onChange={(e) => onShirtType(e.target.value as ShirtType)}
        />
      </AppField>

      <AppField label="Shirt colour">
        <AppText variant="body-sm" className="mb-2">
          Pick the shirt you'd like to design on.
        </AppText>
        <AppColourSwatches
          colours={hexes}
          value={currentHex}
          onChange={(hex) => onShirtColor(hexToSlug.get(hex) ?? shirtColor)}
        />
      </AppField>
    </div>
  );
}
