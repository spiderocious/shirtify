import { DesignCanvas } from '@shirtify/canvas';
import { SHIRT_COLORS } from '@shirtify/core';
import { AppColourSwatches } from '@shirtify/ui';
import { Show } from '@shirtify/ui/flow';

import { resolveAssetUrl } from '@shared/api/resolve-asset-url.ts';

import { useDesign } from '../../providers/design-provider.tsx';

const SLUG_HEX = new Map(SHIRT_COLORS.map((c) => [c.id, c.hex]));

/** The editing surface — DesignCanvas + a quick on-canvas shirt-colour row. */
export function CanvasStage() {
  const { scenes, side, activeScene, context, selectedLayerId, selectLayer, replaceScenes, setShirtColor } =
    useDesign();

  // Colours the customer may switch between (seller's allowed set), as hexes.
  const allowed = context.session.allowed_colors ?? [];
  const swatchHexes = allowed.map((s) => SLUG_HEX.get(s) ?? '#cccccc');
  const currentHex = SLUG_HEX.get(activeScene.shirt.color) ?? '#cccccc';
  const hexToSlug = new Map(allowed.map((s) => [SLUG_HEX.get(s) ?? '#cccccc', s]));
  const usesMaterialPhoto = Boolean(activeScene.shirt.materialImageKey);

  return (
    <div className="flex w-full flex-col items-center gap-3 bg-paper-deep p-3 sm:p-4">
      <div className="w-full max-w-[520px] border-3 border-ink bg-paper shadow-pop">
        <DesignCanvas
          front={scenes.front}
          back={scenes.back}
          side={side}
          resolveAssetUrl={resolveAssetUrl}
          selectedLayerId={selectedLayerId}
          onSelectLayer={selectLayer}
          onChange={replaceScenes}
          className="mx-auto w-full"
        />
      </div>

      {/* Quick shirt-colour switch (only when allowed + not a photo material). */}
      <Show when={allowed.length > 1 && !usesMaterialPhoto}>
        <div className="flex w-full max-w-[520px] items-center gap-2 overflow-x-auto">
          <span className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-ink-3">
            Shirt
          </span>
          <AppColourSwatches
            colours={swatchHexes}
            value={currentHex}
            onChange={(hex) => setShirtColor(hexToSlug.get(hex) ?? activeScene.shirt.color)}
          />
        </div>
      </Show>
    </div>
  );
}
