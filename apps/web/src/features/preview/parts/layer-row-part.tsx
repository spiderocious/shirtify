import { useState } from 'react';

import { Repeat } from 'meemaw';

import { AppLayerRow, type AppLayerKind } from '@shirtify/ui';

import { Section, ComponentRow } from './preview-canvas.tsx';

interface Layer {
  readonly id: string;
  readonly kind: AppLayerKind;
  readonly name: string;
  readonly meta: string;
}

const INITIAL: readonly Layer[] = [
  { id: '1', kind: 'text', name: '“LAGOS BOY”', meta: 'text · x142 y88 · 42°' },
  { id: '2', kind: 'shape', name: 'Star burst', meta: 'shape · 118%' },
  { id: '3', kind: 'image', name: 'church-logo.png', meta: 'image · 64%' },
  { id: '4', kind: 'text', name: '“EST. 2026”', meta: 'text · −8°' },
];

export function LayerRowPart() {
  const [selected, setSelected] = useState('1');
  const [layers, setLayers] = useState<readonly Layer[]>(INITIAL);

  return (
    <Section
      title="Layer row"
      description="One row in the design tool's layer stack — type-tinted thumbnail (text / image / shape), name, mono transform, and a trash action. The selected row fills lime and lifts onto its shadow."
    >
      <ComponentRow label="The stack (tap to select, 🗑 to delete)">
        <div className="flex w-[320px] flex-col gap-2 border-3 border-ink bg-paper-warm p-2.5 shadow-pop">
          <Repeat each={[...layers]}>
            {(layer) => (
              <AppLayerRow
                kind={layer.kind}
                name={layer.name}
                meta={layer.meta}
                selected={layer.id === selected}
                onSelect={() => setSelected(layer.id)}
                onDelete={() => setLayers((prev) => prev.filter((l) => l.id !== layer.id))}
              />
            )}
          </Repeat>
        </div>
      </ComponentRow>
    </Section>
  );
}
