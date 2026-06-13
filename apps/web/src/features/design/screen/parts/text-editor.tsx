import { type TextLayer, type Fill, type Gradient } from '@shirtify/core';
import { AppField, AppInput, AppText, AppColourSwatches, AppToggle, AppSlider } from '@shirtify/ui';
import { Show } from '@shirtify/ui/flow';

import { useDesign } from '../../providers/design-provider.tsx';
import { FontControl } from '../../widgets/font-picker-modal.tsx';

const PALETTE = ['#16140F', '#FBF7EC', '#C6F24E', '#1F6BFF', '#FF5252', '#D11A1A', '#2E3A06', '#ea580c', '#9333ea', '#0d9488'];

const isGradient = (fill: Fill): fill is Gradient => typeof fill !== 'string';

const DEFAULT_GRADIENT: Gradient = {
  type: 'linear',
  stops: [
    { offset: 0, color: '#1F6BFF' },
    { offset: 1, color: '#C6F24E' },
  ],
  angle: 0,
};

/** Side panel for editing the selected text layer. */
export function TextEditor({ layer }: { layer: TextLayer }) {
  const { patchLayer } = useDesign();
  const id = layer.id;
  const gradient = isGradient(layer.color);

  const setStop = (index: number, color: string) => {
    if (!isGradient(layer.color)) return;
    const stops = layer.color.stops.map((s, i) => (i === index ? { ...s, color } : s));
    patchLayer(id, { color: { ...layer.color, stops } });
  };

  return (
    <div className="flex flex-col gap-4">
      <AppText variant="overline">Text</AppText>

      <AppField label="Your text">
        <AppInput
          value={layer.text}
          onChange={(e) => patchLayer(id, { text: e.target.value })}
          placeholder="Type something"
        />
      </AppField>

      <AppField label="Font">
        <FontControl value={layer.font} onChange={(font) => patchLayer(id, { font })} />
      </AppField>

      {/* Fill: solid or gradient (multi-colour text). */}
      <div className="border-2.5 border-ink bg-paper p-3">
        <AppToggle
          label="Gradient (multi-colour)"
          checked={gradient}
          onChange={(on) => patchLayer(id, { color: on ? DEFAULT_GRADIENT : '#16140F' })}
        />
        <Show
          when={gradient}
          fallback={
            <div className="mt-3">
              <AppText variant="overline">Colour</AppText>
              <AppColourSwatches
                className="mt-1.5"
                colours={PALETTE}
                value={typeof layer.color === 'string' ? layer.color : '#16140F'}
                onChange={(color) => patchLayer(id, { color })}
              />
            </div>
          }
        >
          <Show when={isGradient(layer.color)}>
            <div className="mt-3 flex flex-col gap-3">
              <div>
                <AppText variant="overline">Start colour</AppText>
                <AppColourSwatches
                  className="mt-1.5"
                  colours={PALETTE}
                  value={isGradient(layer.color) ? (layer.color.stops[0]?.color ?? '') : ''}
                  onChange={(c) => setStop(0, c)}
                />
              </div>
              <div>
                <AppText variant="overline">End colour</AppText>
                <AppColourSwatches
                  className="mt-1.5"
                  colours={PALETTE}
                  value={isGradient(layer.color) ? (layer.color.stops.at(-1)?.color ?? '') : ''}
                  onChange={(c) =>
                    isGradient(layer.color) && setStop(layer.color.stops.length - 1, c)
                  }
                />
              </div>
              <AppField label={`Angle · ${isGradient(layer.color) ? layer.color.angle : 0}°`}>
                <AppSlider
                  min={0}
                  max={360}
                  step={15}
                  value={isGradient(layer.color) ? layer.color.angle : 0}
                  onChange={(e) =>
                    isGradient(layer.color) &&
                    patchLayer(id, { color: { ...layer.color, angle: Number(e.target.value) } })
                  }
                />
              </AppField>
            </div>
          </Show>
        </Show>
      </div>

      {/* Outline (border) — labelled. */}
      <div className="border-2.5 border-ink bg-paper p-3">
        <AppToggle
          label="Outline (border around the text)"
          checked={Boolean(layer.stroke)}
          onChange={(on) =>
            patchLayer(id, { stroke: on ? { color: '#16140F', width: 3 } : undefined })
          }
        />
        <Show when={Boolean(layer.stroke)}>
          <div className="mt-3 flex flex-col gap-3">
            <div>
              <AppText variant="overline">Outline colour</AppText>
              <AppColourSwatches
                className="mt-1.5"
                colours={PALETTE}
                value={layer.stroke?.color ?? '#16140F'}
                onChange={(color) =>
                  patchLayer(id, { stroke: { color, width: layer.stroke?.width ?? 3 } })
                }
              />
            </div>
            <AppField label={`Outline width · ${layer.stroke?.width ?? 3}px`}>
              <AppSlider
                min={1}
                max={12}
                step={1}
                value={layer.stroke?.width ?? 3}
                onChange={(e) =>
                  patchLayer(id, {
                    stroke: { color: layer.stroke?.color ?? '#16140F', width: Number(e.target.value) },
                  })
                }
              />
            </AppField>
          </div>
        </Show>
      </div>

      {/* Shadow — labelled. */}
      <div className="border-2.5 border-ink bg-paper p-3">
        <AppToggle
          label="Drop shadow (soft shadow behind the text)"
          checked={Boolean(layer.shadow)}
          onChange={(on) => patchLayer(id, { shadow: on })}
        />
      </div>
    </div>
  );
}
