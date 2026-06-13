import { FILTER_KINDS, type FilterKind, type ImageLayer } from '@shirtify/core';
import { AppText, AppField } from '@shirtify/ui';
import { Repeat, Show } from '@shirtify/ui/flow';

import { useDesign } from '../../providers/design-provider.tsx';

const LABELS: Record<FilterKind, string> = {
  none: 'None',
  grayscale: 'B & W',
  sepia: 'Sepia',
  invert: 'Invert',
  vintage: 'Vintage',
  cool: 'Cool',
  warm: 'Warm',
  noir: 'Noir',
};

function FilterChips({ value, onChange }: { value: FilterKind; onChange: (f: FilterKind) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <Repeat each={[...FILTER_KINDS]}>
        {(f) => (
          <button
            key={f}
            type="button"
            onClick={() => onChange(f)}
            className={`border-2.5 border-ink px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase ${
              value === f ? 'bg-lime text-lime-ink' : 'bg-paper-warm text-ink'
            }`}
          >
            {LABELS[f]}
          </button>
        )}
      </Repeat>
    </div>
  );
}

/** Apply a filter to the whole design, or to the selected image layer. */
export function FiltersTool() {
  const { activeScene, selectedLayer, setSceneFilter, patchLayer } = useDesign();
  const selectedImage = selectedLayer?.kind === 'image' ? (selectedLayer as ImageLayer) : null;

  return (
    <div className="flex flex-col gap-4">
      <AppText variant="overline">Filters</AppText>

      <Show when={selectedImage !== null}>
        <AppField label="Selected image">
          <FilterChips
            value={selectedImage?.filter ?? 'none'}
            onChange={(filter) => selectedImage && patchLayer(selectedImage.id, { filter })}
          />
        </AppField>
      </Show>

      <AppField label="Whole design">
        <FilterChips value={activeScene.filter ?? 'none'} onChange={setSceneFilter} />
      </AppField>
    </div>
  );
}
