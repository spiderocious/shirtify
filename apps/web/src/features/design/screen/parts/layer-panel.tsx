import { type Layer } from '@shirtify/core';
import { AppText, AppLayerRow, AppButton, AppEmptyState } from '@shirtify/ui';
import { Show, Repeat } from '@shirtify/ui/flow';

import { useDesign } from '../../providers/design-provider.tsx';

const layerName = (layer: Layer): string =>
  layer.kind === 'text' ? layer.text || 'Text' : 'Image';

const layerMeta = (layer: Layer): string =>
  `${Math.round(layer.scale * 100)}% · ${Math.round(layer.rotation)}°`;

/** The layer stack — select, reorder (z-order), delete. Top of list = top layer. */
export function LayerPanel() {
  const { activeScene, selectedLayerId, selectLayer, reorderLayer, removeLayer } = useDesign();
  // Render top layer first (reverse of array order, which is bottom→top).
  const ordered = [...activeScene.layers].reverse();

  return (
    <div className="flex flex-col gap-2.5">
      <AppText variant="overline">Layers</AppText>
      <Show
        when={ordered.length > 0}
        fallback={
          <AppEmptyState
            glyph="✎"
            title="Nothing yet"
            description="Add text or an image to start your design."
            className="!px-4 !py-6"
          />
        }
      >
        <div className="flex flex-col gap-1.5">
          <Repeat each={ordered}>
            {(layer) => (
              <div key={layer.id} className="flex items-stretch gap-1.5">
                <AppLayerRow
                  kind={layer.kind === 'image' ? 'image' : 'text'}
                  name={layerName(layer)}
                  meta={layerMeta(layer)}
                  selected={layer.id === selectedLayerId}
                  onSelect={() => selectLayer(layer.id)}
                  className="flex-1"
                />
                <div className="flex flex-col">
                  <button
                    type="button"
                    aria-label="Move up"
                    onClick={() => reorderLayer(layer.id, 1)}
                    className="flex-1 border-2.5 border-b-0 border-ink px-2 text-xs hover:bg-go-tint"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    onClick={() => reorderLayer(layer.id, -1)}
                    className="flex-1 border-2.5 border-ink px-2 text-xs hover:bg-go-tint"
                  >
                    ↓
                  </button>
                </div>
              </div>
            )}
          </Repeat>
        </div>
        <Show when={selectedLayerId !== null}>
          <AppButton
            variant="danger"
            size="sm"
            block
            onClick={() => selectedLayerId && removeLayer(selectedLayerId)}
          >
            Delete selected layer
          </AppButton>
        </Show>
      </Show>
    </div>
  );
}
