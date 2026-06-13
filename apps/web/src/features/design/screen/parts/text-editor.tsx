import { FONTS, type TextLayer } from '@shirtify/core';
import {
  AppField,
  AppInput,
  AppText,
  AppFontPicker,
  AppColourSwatches,
  AppToggle,
  AppSlider,
} from '@shirtify/ui';
import { Show } from '@shirtify/ui/flow';

import { useDesign } from '../../providers/design-provider.tsx';

const fontOptions = FONTS.map((f) => ({ id: f.id, label: f.label, fontFamily: f.stack }));
const TEXT_COLORS = ['#16140F', '#FBF7EC', '#C6F24E', '#1F6BFF', '#FF5252', '#D11A1A', '#2E3A06'];

/** Side panel for editing the selected text layer. */
export function TextEditor({ layer }: { layer: TextLayer }) {
  const { patchLayer } = useDesign();
  const id = layer.id;

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
        <AppFontPicker fonts={fontOptions} value={layer.font} onChange={(font) => patchLayer(id, { font })} />
      </AppField>

      <AppField label="Colour">
        <AppColourSwatches
          colours={TEXT_COLORS}
          value={layer.color}
          onChange={(color) => patchLayer(id, { color })}
        />
      </AppField>

      <div className="border-2.5 border-ink bg-paper p-3">
        <AppToggle
          label="Outline"
          checked={Boolean(layer.stroke)}
          onChange={(on) =>
            patchLayer(id, { stroke: on ? { color: '#16140F', width: 3 } : undefined })
          }
        />
        <Show when={Boolean(layer.stroke)}>
          <div className="mt-3 flex flex-col gap-3">
            <AppColourSwatches
              colours={TEXT_COLORS}
              value={layer.stroke?.color ?? '#16140F'}
              onChange={(color) =>
                patchLayer(id, { stroke: { color, width: layer.stroke?.width ?? 3 } })
              }
            />
            <AppField label={`Width · ${layer.stroke?.width ?? 3}px`}>
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

      <div className="border-2.5 border-ink bg-paper p-3">
        <AppToggle
          label="Shadow"
          checked={Boolean(layer.shadow)}
          onChange={(on) => patchLayer(id, { shadow: on })}
        />
      </div>
    </div>
  );
}
