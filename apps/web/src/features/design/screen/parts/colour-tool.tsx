import { SHIRT_COLORS } from '@shirtify/core';
import { AppText, AppColourSwatches, AppEmptyState } from '@shirtify/ui';
import { Show } from '@shirtify/ui/flow';

import { useDesign } from '../../providers/design-provider.tsx';

// Map known platform colour slugs → hex so the swatches render. Unknown (custom
// seller) slugs fall back to a neutral chip handled below.
const SLUG_HEX = new Map(SHIRT_COLORS.map((c) => [c.id, c.hex]));

/** Lets the customer switch the shirt base colour among the seller's allowed set. */
export function ColourTool() {
  const { context, activeScene, setShirtColor } = useDesign();
  const allowed = context.session.allowed_colors ?? [];

  if (allowed.length <= 1) {
    return (
      <AppEmptyState
        glyph="◑"
        title="Colour is fixed"
        description="The seller set a single shirt colour for this design."
        className="!px-4 !py-6"
      />
    );
  }

  const hexes = allowed.map((slug) => SLUG_HEX.get(slug) ?? '#cccccc');
  const currentHex = SLUG_HEX.get(activeScene.shirt.color) ?? '#cccccc';
  const hexToSlug = new Map(allowed.map((slug) => [SLUG_HEX.get(slug) ?? '#cccccc', slug]));

  return (
    <div className="flex flex-col gap-3">
      <AppText variant="overline">Shirt colour</AppText>
      <Show when={hexes.length > 0}>
        <AppColourSwatches
          colours={hexes}
          value={currentHex}
          onChange={(hex) => setShirtColor(hexToSlug.get(hex) ?? activeScene.shirt.color)}
        />
      </Show>
    </div>
  );
}
