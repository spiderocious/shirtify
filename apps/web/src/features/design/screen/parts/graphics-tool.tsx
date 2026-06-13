import { type GraphicLayer } from '@shirtify/core';
import { AppText, AppButton, AppField, AppColourSwatches } from '@shirtify/ui';
import { Show } from '@shirtify/ui/flow';

import { useDesign } from '../../providers/design-provider.tsx';
import { openGraphicSelector } from '../../widgets/graphic-selector.tsx';

const PALETTE = ['#16140F', '#FBF7EC', '#C6F24E', '#1F6BFF', '#FF5252', '#ea580c', '#9333ea', '#0d9488'];

/** Add icons/emoji; recolour the selected icon. */
export function GraphicsTool() {
  const { addGraphicLayer, addEmojiLayer, selectedLayer, patchLayer } = useDesign();
  const selectedGraphic = selectedLayer?.kind === 'graphic' ? (selectedLayer as GraphicLayer) : null;

  return (
    <div className="flex flex-col gap-4">
      <AppText variant="overline">Graphics</AppText>
      <AppText variant="body-sm">Add an icon or emoji to your design.</AppText>

      <AppButton
        variant="ai"
        block
        leadingIcon={<span>✦</span>}
        onClick={() =>
          openGraphicSelector({
            onPickIcon: (icon) =>
              addGraphicLayer({ iconId: icon.id, nodes: icon.nodes, viewBox: icon.viewBox }),
            onPickEmoji: (emoji) => addEmojiLayer(emoji),
          })
        }
      >
        Browse icons & emoji
      </AppButton>

      <Show when={selectedGraphic !== null}>
        <AppField label="Icon colour">
          <AppColourSwatches
            colours={PALETTE}
            value={
              selectedGraphic && typeof selectedGraphic.color === 'string'
                ? selectedGraphic.color
                : '#16140F'
            }
            onChange={(color) => selectedGraphic && patchLayer(selectedGraphic.id, { color })}
          />
        </AppField>
      </Show>
    </div>
  );
}
