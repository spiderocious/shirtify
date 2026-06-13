import { type Layer } from '@shirtify/core';
import { AppText, AppLayerRow, AppEmptyState, type AppLayerKind } from '@shirtify/ui';
import { Show, Repeat } from '@shirtify/ui/flow';
import { useState } from 'react';

import { useDesign } from '../../providers/design-provider.tsx';

const layerName = (layer: Layer): string => {
  if (layer.kind === 'text') return layer.text || 'Text';
  if (layer.kind === 'shape') return `${layer.shape} shape`;
  if (layer.kind === 'graphic') return layer.iconId;
  return 'Image';
};

const layerMeta = (layer: Layer): string =>
  `${layer.kind} · ${Math.round(layer.scale * 100)}% · ${Math.round(layer.rotation)}°`;

/** Layer stack — select, drag to reorder (z-order), delete. Top of list = top layer. */
export function LayerPanel() {
  const { activeScene, selectedLayerId, selectLayer, moveLayerToIndex, removeLayer } = useDesign();
  const [dragId, setDragId] = useState<string | null>(null);

  // Render top layer first (reverse of array order, which is bottom→top).
  const ordered = [...activeScene.layers].reverse();

  const onDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    // Map display (reversed) positions back to scene (bottom→top) indices.
    const sceneLen = activeScene.layers.length;
    const targetDisplayIdx = ordered.findIndex((l) => l.id === targetId);
    const sceneIndex = sceneLen - 1 - targetDisplayIdx;
    moveLayerToIndex(dragId, sceneIndex);
    setDragId(null);
  };

  return (
    <div className="flex flex-col gap-2.5">
      <AppText variant="overline">Layers</AppText>
      <Show
        when={ordered.length > 0}
        fallback={
          <AppEmptyState
            glyph="✎"
            title="Nothing yet"
            description="Add text, an image, or a shape to start your design."
            className="!px-4 !py-6"
          />
        }
      >
        <div className="flex flex-col gap-1.5">
          <Repeat each={ordered}>
            {(layer) => (
              <AppLayerRow
                key={layer.id}
                kind={layer.kind as AppLayerKind}
                name={layerName(layer)}
                meta={layerMeta(layer)}
                selected={layer.id === selectedLayerId}
                onSelect={() => selectLayer(layer.id)}
                onDelete={() => removeLayer(layer.id)}
                draggable
                onDragStart={() => setDragId(layer.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(layer.id)}
                onDragEnd={() => setDragId(null)}
                className={dragId === layer.id ? 'opacity-50' : undefined}
              />
            )}
          </Repeat>
        </div>
        <AppText variant="mono" as="p" className="text-[10px]">
          Drag to reorder · top of list is the top layer
        </AppText>
      </Show>
    </div>
  );
}
