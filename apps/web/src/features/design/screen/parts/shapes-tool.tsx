import { SHAPE_KINDS, type ShapeKind, type ShapeLayer, type Fill } from '@shirtify/core';
import { AppText, AppField, AppColourSwatches } from '@shirtify/ui';
import { Repeat, Show } from '@shirtify/ui/flow';

import { useDesign } from '../../providers/design-provider.tsx';

const PALETTE = ['#16140F', '#C6F24E', '#1F6BFF', '#FF5252', '#ea580c', '#9333ea', '#0d9488', '#FBF7EC'];

// A glyph per shape for the picker grid.
const GLYPH: Record<ShapeKind, string> = {
  rect: '▢',
  'rounded-rect': '▭',
  circle: '●',
  ellipse: '⬭',
  triangle: '▲',
  star: '★',
  pentagon: '⬠',
  hexagon: '⬡',
  diamond: '◆',
  heart: '♥',
  arrow: '➤',
  line: '▬',
  cross: '✚',
  burst: '✺',
};

const isSolid = (f: Fill): f is string => typeof f === 'string';

/** Add shapes; edit the selected shape's fill colour. */
export function ShapesTool() {
  const { addShapeLayer, selectedLayer, patchLayer } = useDesign();
  const selectedShape = selectedLayer?.kind === 'shape' ? (selectedLayer as ShapeLayer) : null;

  return (
    <div className="flex flex-col gap-4">
      <AppText variant="overline">Shapes</AppText>
      <AppText variant="body-sm">Tap a shape to drop it on the shirt.</AppText>

      <div className="grid grid-cols-4 gap-2">
        <Repeat each={[...SHAPE_KINDS]}>
          {(shape) => (
            <button
              key={shape}
              type="button"
              aria-label={shape}
              onClick={() => addShapeLayer(shape)}
              className="flex aspect-square items-center justify-center border-2.5 border-ink bg-paper-warm text-2xl text-ink hover:bg-go-tint"
            >
              {GLYPH[shape]}
            </button>
          )}
        </Repeat>
      </div>

      <Show when={selectedShape !== null}>
        <AppField label="Shape colour">
          <AppColourSwatches
            colours={PALETTE}
            value={selectedShape && isSolid(selectedShape.fill) ? selectedShape.fill : '#1F6BFF'}
            onChange={(fill) => selectedShape && patchLayer(selectedShape.id, { fill })}
          />
        </AppField>
      </Show>
    </div>
  );
}
